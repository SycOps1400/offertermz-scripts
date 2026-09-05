/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz SMRT Team Legend (Key Map)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 1 ***
 *
 * FILE: ot-legend.js
 * PURPOSE: The Rosetta stone for the Team Dock's visual language. A popup
 *          (opened from the ℹ icon on the dock pill) showing every member,
 *          every dot color, and what each state means — for new subscribers
 *          learning the system.
 * EDIT THIS WHEN: A member gains a new state, copy needs a voice pass, or
 *                 Ruby/Tate graduate from training.
 *
 * ARCHITECTURE: fully self-contained (own styles, own images, own DOM).
 * The dock calls window.OT_Legend.open(); nothing else is shared.
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  if (window.OT_Legend) return; // idempotent

  var IMG = {
    sam:  'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771a32ae01952f74ab5f2.webp',
    mia:  'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a97717bef6af944f0041ade.webp',
    ruby: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771c1ef6af944f0041e25.webp',
    tate: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771e49b2eaead5c292992.webp'
  };

  var GREEN = '#22c55e', AMBER = '#f59e0b';

  // ── The key itself: every member, every state, in the product voice ──
  var SECTIONS = [
    {
      title: 'Sam',
      role: 'The Acquisitionist',
      img: IMG.sam,
      rows: [
        { dot: GREEN, dim: false, label: 'Sam On',
          text: 'On the clock \u2014 he engages the lead the moment they text, working to book you a call.' },
        { dot: AMBER, dim: false, label: 'Sam on Standby',
          text: 'Mia\u2019s following up. The second the lead responds, she tags Sam in and he takes it from there.' },
        { dot: null, dim: true, label: 'Sam Off',
          text: 'Out doing life \u2014 fishing, golfing, who knows. Click him to call him back to the office.' }
      ]
    },
    {
      title: 'Mia',
      role: 'The Followup Magician',
      img: IMG.mia,
      rows: [
        { dot: GREEN, dim: false, label: 'Following up',
          text: 'She\u2019s nurturing this lead on schedule. Click her to redirect or stop the plan.' },
        { dot: null, dim: true, label: 'Off duty',
          text: 'Not on this lead yet. Click her to hand her the followup.' }
      ]
    },
    {
      title: 'Ruby',
      role: 'The Disposition Queen \u2014 finding the BIG $$$',
      img: IMG.ruby,
      rows: [
        { dot: null, dim: true, label: 'In training',
          text: 'Learning the ropes. She\u2019ll be moving your deals soon.' }
      ]
    },
    {
      title: 'Tate',
      role: 'Well\u2026 he\u2019s just the IT guy.',
      img: IMG.tate,
      rows: [
        { dot: null, dim: true, label: 'In training',
          text: 'Keeping the lights on behind the scenes. He\u2019ll introduce himself eventually.' }
      ]
    }
  ];

  // ═════════════════════════════════════════════════════════════════════
  // STYLES (self-contained, family design language)
  // ═════════════════════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('ot-legend-styles')) return;
    var style = document.createElement('style');
    style.id = 'ot-legend-styles';
    style.textContent =
      '#ot-legend-overlay {' +
        'position: fixed; inset: 0; z-index: 99998;' +
        'background: rgba(14,26,43,0.72);' +
      '}' +
      '#ot-legend {' +
        'position: fixed; z-index: 99999; top: 50%; left: 50%;' +
        'transform: translate(-50%, -50%);' +
        'width: min(560px, 96vw); max-height: 88vh;' +
        'display: flex; flex-direction: column;' +
        'background: linear-gradient(170deg, #1E3A5F 0%, #0d1f38 62%);' +
        'border-radius: 22px; overflow: hidden;' +
        'box-shadow: 0 20px 60px rgba(0,0,0,0.45);' +
        'font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
      '}' +
      '#ot-legend .ot-lg-head {' +
        'display: flex; align-items: center; gap: 10px;' +
        'padding: 12px 16px; background: #1E3A5F; flex-shrink: 0;' +
      '}' +
      '#ot-legend .ot-lg-title {' +
        'color: #fff; font-size: 15px; font-weight: 800; letter-spacing: .2px;' +
      '}' +
      '#ot-legend .ot-lg-close {' +
        'margin-left: auto; border: none; cursor: pointer;' +
        'background: rgba(255,255,255,0.12); color: #fff;' +
        'width: 28px; height: 28px; border-radius: 50%; font-size: 16px; line-height: 1;' +
      '}' +
      '#ot-legend .ot-lg-body {' +
        'overflow-y: auto; padding: 6px 18px 8px;' +
      '}' +
      '#ot-legend .ot-lg-section {' +
        'padding: 12px 0 4px;' +
      '}' +
      '#ot-legend .ot-lg-section + .ot-lg-section {' +
        'border-top: 1px solid rgba(255,255,255,0.12);' +
      '}' +
      '#ot-legend .ot-lg-member {' +
        'font-family: "Playfair Display", Georgia, serif;' +
        'color: #fff; font-size: 20px; font-weight: 700; line-height: 1.2;' +
      '}' +
      '#ot-legend .ot-lg-role {' +
        'color: #E85A33; font-size: 12.5px; font-weight: 700;' +
        'letter-spacing: .3px; margin: 2px 0 10px;' +
      '}' +
      '#ot-legend .ot-lg-row {' +
        'display: flex; align-items: center; gap: 12px; margin-bottom: 10px;' +
      '}' +
      '#ot-legend .ot-lg-circle {' +
        'position: relative; width: 46px; height: 46px; flex: 0 0 auto;' +
        'border-radius: 50%; border: 2.5px solid #E85A33;' +
        'background: #2a5080; overflow: hidden; box-sizing: border-box;' +
      '}' +
      '#ot-legend .ot-lg-circle img {' +
        'width: 100%; height: 100%; object-fit: cover; display: block;' +
      '}' +
      '#ot-legend .ot-lg-circle.ot-lg-dim {' +
        'border-color: #8896a5; background: #3d4a5c;' +
      '}' +
      '#ot-legend .ot-lg-circle.ot-lg-dim img {' +
        'filter: grayscale(1); opacity: 0.55;' +
      '}' +
      '#ot-legend .ot-lg-dot {' +
        'position: absolute; right: 1px; bottom: 1px;' +
        'width: 11px; height: 11px; border-radius: 50%;' +
        'border: 2px solid #0d1f38;' +
      '}' +
      '#ot-legend .ot-lg-label {' +
        'color: #fff; font-size: 13.5px; font-weight: 700;' +
      '}' +
      '#ot-legend .ot-lg-text {' +
        'color: rgba(255,255,255,.82); font-size: 13px; line-height: 1.5; font-weight: 500;' +
      '}' +
      '#ot-legend .ot-lg-foot {' +
        'padding: 12px 18px 16px; flex-shrink: 0;' +
      '}' +
      '#ot-legend .ot-lg-btn {' +
        'display: block; width: 100%; border: none; cursor: pointer;' +
        'font-family: inherit; font-size: 15px; font-weight: 800; color: #fff;' +
        'background: linear-gradient(135deg, #E85A33, #c94820);' +
        'border-radius: 12px; padding: 13px;' +
        'box-shadow: 0 10px 30px rgba(232,90,51,.35);' +
      '}';
    document.head.appendChild(style);
  }

  // ═════════════════════════════════════════════════════════════════════
  // POPUP
  // ═════════════════════════════════════════════════════════════════════

  function rowHTML(section, row) {
    return '' +
      '<div class="ot-lg-row">' +
        '<span class="ot-lg-circle' + (row.dim ? ' ot-lg-dim' : '') + '">' +
          '<img src="' + section.img + '" alt="' + section.title + '">' +
          (row.dot ? '<span class="ot-lg-dot" style="background:' + row.dot + ';"></span>' : '') +
        '</span>' +
        '<span>' +
          '<div class="ot-lg-label">' + row.label + '</div>' +
          '<div class="ot-lg-text">' + row.text + '</div>' +
        '</span>' +
      '</div>';
  }

  function open() {
    if (document.getElementById('ot-legend-overlay')) return;
    injectStyles();

    var overlay = document.createElement('div');
    overlay.id = 'ot-legend-overlay';
    overlay.addEventListener('click', close);
    document.body.appendChild(overlay);

    var sectionsHTML = '';
    for (var i = 0; i < SECTIONS.length; i++) {
      var s = SECTIONS[i];
      sectionsHTML +=
        '<div class="ot-lg-section">' +
          '<div class="ot-lg-member">' + s.title + '</div>' +
          '<div class="ot-lg-role">' + s.role + '</div>' +
          s.rows.map(function(r) { return rowHTML(s, r); }).join('') +
        '</div>';
    }

    var card = document.createElement('div');
    card.id = 'ot-legend';
    card.innerHTML =
      '<div class="ot-lg-head">' +
        '<span class="ot-lg-title">Your SMRT Team \u2014 the key</span>' +
        '<button type="button" class="ot-lg-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="ot-lg-body">' + sectionsHTML + '</div>' +
      '<div class="ot-lg-foot">' +
        '<button type="button" class="ot-lg-btn">Got it \u2014 back to the CRM</button>' +
      '</div>';
    card.querySelector('.ot-lg-close').addEventListener('click', close);
    card.querySelector('.ot-lg-btn').addEventListener('click', close);
    document.body.appendChild(card);
    document.addEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') close();
  }

  function close() {
    document.removeEventListener('keydown', escHandler);
    var overlay = document.getElementById('ot-legend-overlay');
    var card = document.getElementById('ot-legend');
    if (card && card.parentNode) card.parentNode.removeChild(card);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  window.OT_Legend = { open: open, close: close };
})();
