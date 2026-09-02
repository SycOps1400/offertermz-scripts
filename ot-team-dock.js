/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz SMRT Team Dock Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 2 ***
 * UPDATES FROM V1 (all caught in first sandbox test):
 * - FIX: portrait circles rendered giant — .ot-dock-circle spans were
 *   inline, so width/height were ignored. display:flex added (the tool
 *   circles already had it, which is why only they rendered correctly).
 * - FIX: phone read as empty — the real GHL label is "Phone (Primary)",
 *   not "Phone". Primary tried first, plain "Phone" kept as fallback.
 * - Popup enlarged: min(560px, 94vw) × min(800px, 90vh).
 * - Circles 44px → 48px.
 *
 * *** VERSION 1 ***
 *
 * FILE: ot-team-dock.js
 * PURPOSE: The navy "Team Dock" bar that replaces the three header buttons
 *          and the lead strip. Circular portraits for the SMRT AI Team
 *          (Sam, Mia active · Ruby, Tate in training) plus circular tool
 *          chips (Deal Analyzer, Get Comps, The Closer), with the lead
 *          name/address chip at the left end of the bar.
 *
 *          Clicking Mia dims the CRM and opens the central Mia page in a
 *          popup frame, animated as if her circle enlarges to life.
 *
 * EDIT THIS WHEN: Changing dock layout/labels, activating Ruby or Tate,
 *                 changing the Mia URL contract, or swapping portraits.
 *
 * DEPENDS ON: ot-autotabs.js (OT_TABS_READY + 'ot-tabs-ready' event),
 *             ot-panels.js (otToggleCalculatorPanel / otToggleCompsPanel),
 *             ot-closer.js (otOpenTheCloser).
 *
 * SELF-CONTAINED ON PURPOSE: styles, elements, popup, and updates all live
 * in this one file — removing the feature is deleting one line from the
 * loader (and restoring the old buttons + leadstrip lines).
 *
 * MIA URL CONTRACT (central page, one page for all subscribers):
 *   https://www.offertermz.com/mia
 *     ?contact=...                 contact ID (from the page URL)
 *     &location_id=...             subaccount ID (from the page URL)
 *     &first_name=...              lead's first name (First Name field)
 *     &phone=...                   lead phone, normalized to +1XXXXXXXXXX
 *     &street_name_and_suffix=...  derived from Street Address (mirrors the
 *                                  GHL workflow code exactly — house number
 *                                  and unit designators dropped; NOTE:
 *                                  directionals are kept, same as workflow)
 *     &assigned_user=...           owner's first name; UNASSIGNED when none
 *     &company=...                 subaccount company name, scraped from the
 *                                  sidebar location switcher; text inside
 *                                  parentheses when present, else full text
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_TEAMDOCK_LOADED) return;
  window.OT_TEAMDOCK_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var DOCK_ID = 'ot-team-dock';
  var POPUP_ID = 'ot-mia-popup';
  var OVERLAY_ID = 'ot-mia-overlay';
  var REFRESH_EVERY_MS = 500;

  var MIA_URL = 'https://www.offertermz.com/mia';

  var IMG = {
    sam:  'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771a32ae01952f74ab5f2.webp',
    mia:  'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a97717bef6af944f0041ade.webp',
    ruby: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771c1ef6af944f0041e25.webp',
    tate: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771e49b2eaead5c292992.webp'
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DEBUG LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  function log(message) {
    if (window.OT_DEBUG) {
      console.log(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS (same patterns as ot-closer.js / ot-leadstrip.js)
  // ═══════════════════════════════════════════════════════════════════════

  function isOnContactPage() {
    return window.location.pathname.includes('/contacts/detail/');
  }

  function tabsReady() {
    return window.OT_TABS_READY === true;
  }

  function getFieldByLabel(labelText) {
    var labels = document.querySelectorAll('span.hr-form-item-label__text');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim().toLowerCase() === labelText.toLowerCase()) {
        var container = labels[i].closest('.hr-form-item__container');
        if (container) {
          var input = container.querySelector('input, select, textarea');
          if (input) return input.value.replace(/[<>]/g, '').trim();
        }
      }
    }
    return '';
  }

  function firstWord(text) {
    return text ? text.split(' ')[0] : '';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VALUE READERS
  // ═══════════════════════════════════════════════════════════════════════

  function getContactId() {
    var match = window.location.pathname.match(/\/contacts\/detail\/([^\/]+)/);
    return match ? match[1] : '';
  }

  function getLocationId() {
    var match = window.location.pathname.match(/\/location\/([^\/]+)/);
    return match ? match[1] : '';
  }

  // Owner's first name — anchored to #owner-dropdown-trigger, NEVER
  // #hr-ellipsis-id (GHL duplicates that id). Unassigned → 'UNASSIGNED'.
  // Same logic as ot-closer.js v4.
  function getAssignedUserFirstName() {
    var wrap = document.querySelector('#owner-dropdown-trigger');
    if (!wrap) {
      log('TeamDock: owner area not found — sending no assigned_user');
      return '';
    }
    var nameEl = wrap.querySelector('.hr-ellipsis');
    var text = ((nameEl ? nameEl.textContent : wrap.textContent) || '')
      .replace(/[<>]/g, '').trim();
    if (!text || text.toLowerCase().indexOf('unassigned') !== -1) {
      return 'UNASSIGNED';
    }
    return firstWord(text);
  }

  // Company name from the sidebar location switcher. The DOM keeps the
  // FULL text even when the display truncates it. Parentheses rule:
  // "Amanda Gill (Desert Lily Homes LLC)" → "Desert Lily Homes LLC";
  // no parentheses → the whole name as-is.
  function getCompanyName() {
    var el = document.querySelector('.hl_switcher-loc-name');
    if (!el) return '';
    var text = (el.textContent || '').replace(/[<>]/g, '').trim();
    if (!text) return '';
    var match = text.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : text;
  }

  // Lead phone, normalized toward +1XXXXXXXXXX (US). Falls back to the
  // trimmed raw value when the digits don't fit a US shape.
  // V2: the real GHL label is "Phone (Primary)" — sandbox testing caught
  // the exact-match miss. Try it first, then plain "Phone" as fallback.
  function getLeadPhone() {
    var raw = getFieldByLabel('Phone (Primary)') || getFieldByLabel('Phone');
    if (!raw) return '';
    var digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
    return raw;
  }

  // street_name_and_suffix — EXACT mirror of the GHL workflow code that
  // populates the hidden custom field. Do not "improve" this without
  // changing the workflow too; the two must always agree.
  function deriveStreetNameAndSuffix() {
    var streetAddress = (getFieldByLabel('Street Address') || '').trim();
    var street = '';
    if (streetAddress) {
      // Drop the leading house number / range (e.g. "123", "123A", "100-102")
      street = streetAddress.replace(/^\s*\d+[A-Za-z]?(?:-\d+[A-Za-z]?)?\s+/, '');
      // Drop a trailing unit designator (Apt, Ste, Unit, #, Fl, Lot, etc.) and anything after it
      street = street.replace(/\s+(?:#|apt|apartment|ste|suite|unit|fl|floor|rm|room|bldg|building|lot|trlr|trailer|space|spc|dept)\b.*$/i, '');
      // Tidy whitespace
      street = street.replace(/\s+/g, ' ').trim();
    }
    return street;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MIA URL BUILDER
  // ═══════════════════════════════════════════════════════════════════════

  function buildMiaURL() {
    var params = [];

    var contactId = getContactId();
    if (contactId) params.push('contact=' + encodeURIComponent(contactId));

    var locationId = getLocationId();
    if (locationId) params.push('location_id=' + encodeURIComponent(locationId));

    var firstName = firstWord(getFieldByLabel('First Name'));
    if (firstName) params.push('first_name=' + encodeURIComponent(firstName));

    var phone = getLeadPhone();
    if (phone) params.push('phone=' + encodeURIComponent(phone));

    var street = deriveStreetNameAndSuffix();
    if (street) params.push('street_name_and_suffix=' + encodeURIComponent(street));

    var assignedUser = getAssignedUserFirstName();
    if (assignedUser) params.push('assigned_user=' + encodeURIComponent(assignedUser));

    var company = getCompanyName();
    if (company) params.push('company=' + encodeURIComponent(company));

    return MIA_URL + '?' + params.join('&');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STYLES (injected once — hardcoded hex, GHL-armored, no CSS variables)
  // ═══════════════════════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('ot-team-dock-styles')) return;

    var style = document.createElement('style');
    style.id = 'ot-team-dock-styles';
    style.textContent =
      '#' + DOCK_ID + ' {' +
        'position: fixed;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'z-index: 999;' +
        'display: none;' +
        'align-items: center;' +
        'gap: 14px;' +
        'padding: 8px 18px 6px 12px;' +
        'border-radius: 999px;' +
        'background: linear-gradient(135deg, #1E3A5F 0%, #2a5080 100%);' +
        'box-shadow: 0 4px 14px rgba(30,58,95,0.35);' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'white-space: nowrap;' +
      '}' +

      /* ── Lead chip (the old lead strip, graduated) ── */
      '#' + DOCK_ID + ' .ot-dock-lead {' +
        'display: none;' +
        'align-items: center;' +
        'gap: 7px;' +
        'padding: 5px 12px 5px 9px;' +
        'border-radius: 999px;' +
        'background: rgba(255,255,255,0.12);' +
        'font-size: 12px;' +
        'font-weight: 600;' +
        'color: #ffffff;' +
        'letter-spacing: 0.2px;' +
        'max-width: 220px;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-lead .ot-dock-lead-text {' +
        'overflow: hidden;' +
        'text-overflow: ellipsis;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-dot {' +
        'width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto;' +
        'background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%);' +
      '}' +

      /* ── Circles ── */
      '#' + DOCK_ID + ' .ot-dock-item {' +
        'display: flex; flex-direction: column; align-items: center;' +
        'gap: 2px; border: none; background: none; padding: 0; margin: 0;' +
        'cursor: pointer;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-circle {' +
        'display: flex; align-items: center; justify-content: center;' + /* v2: without display:flex, spans ignore width/height and portraits render giant */
        'width: 48px; height: 48px; border-radius: 50%;' +
        'border: 2.5px solid #E85A33;' +
        'background: #2a5080;' +
        'overflow: hidden;' +
        'position: relative;' +
        'box-sizing: border-box;' +
        'transition: transform 0.15s ease, box-shadow 0.15s ease;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item:hover .ot-dock-circle {' +
        'transform: scale(1.08);' +
        'box-shadow: 0 0 0 3px rgba(232,90,51,0.35);' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-circle img {' +
        'width: 100%; height: 100%; display: block; object-fit: cover;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-label {' +
        'font-size: 10px; font-weight: 600; color: #ffffff;' +
        'letter-spacing: 0.3px;' +
      '}' +

      /* ── Online dot (positioned on the wrapper so it isn't clipped) ── */
      '#' + DOCK_ID + ' .ot-dock-avatar-wrap {' +
        'position: relative;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-online {' +
        'position: absolute; bottom: 0; right: 0;' +
        'width: 11px; height: 11px; border-radius: 50%;' +
        'background: #16a34a; border: 2px solid #1E3A5F;' +
      '}' +

      /* ── Training (Ruby, Tate) ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training {' +
        'cursor: default;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training .ot-dock-circle {' +
        'border-color: #8896a5;' +
        'background: #3d4a5c;' +
        'opacity: 0.55;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training .ot-dock-circle img {' +
        'filter: grayscale(1);' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training:hover .ot-dock-circle {' +
        'transform: none; box-shadow: none;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training .ot-dock-label {' +
        'color: #8896a5;' +
      '}' +

      /* ── Sam: present, online, but not clickable in v1 ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-passive {' +
        'cursor: default;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-passive:hover .ot-dock-circle {' +
        'transform: none; box-shadow: none;' +
      '}' +

      /* ── Tool chips ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-tool .ot-dock-circle {' +
        'background: #ffffff;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-tool svg {' +
        'width: 20px; height: 20px; stroke: #1E3A5F; fill: none;' +
        'stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;' +
      '}' +

      /* ── Divider between team and tools ── */
      '#' + DOCK_ID + ' .ot-dock-divider {' +
        'width: 1px; height: 40px; background: rgba(255,255,255,0.25);' +
      '}' +

      /* ── Loading / disabled ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-waiting .ot-dock-circle {' +
        'animation: ot-dock-pulse 1.2s ease-in-out infinite;' +
      '}' +
      '@keyframes ot-dock-pulse {' +
        '0%, 100% { opacity: 1; }' +
        '50% { opacity: 0.45; }' +
      '}' +

      /* ── Mia overlay + popup ── */
      '#' + OVERLAY_ID + ' {' +
        'position: fixed; inset: 0; z-index: 99998;' +
        'background: rgba(14,26,43,0.72);' +
        'opacity: 0;' +
        'transition: opacity 0.25s ease;' +
      '}' +
      '#' + OVERLAY_ID + '.ot-shown { opacity: 1; }' +
      '#' + POPUP_ID + ' {' +
        'position: fixed; z-index: 99999;' +
        'top: 50%; left: 50%;' +
        'width: min(560px, 94vw); height: min(800px, 90vh);' + /* v2: enlarged */
        'background: #1E3A5F;' +
        'border-radius: 18px;' +
        'box-shadow: 0 20px 60px rgba(0,0,0,0.45);' +
        'overflow: hidden;' +
        'display: flex; flex-direction: column;' +
        'transform: translate(-50%, -50%) scale(0.1);' +
        'opacity: 0;' +
        'transition: transform 0.32s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.22s ease;' +
      '}' +
      '#' + POPUP_ID + '.ot-shown {' +
        'transform: translate(-50%, -50%) scale(1);' +
        'opacity: 1;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-head {' +
        'display: flex; align-items: center; gap: 10px;' +
        'padding: 10px 14px;' +
        'background: #1E3A5F;' +
        'flex: 0 0 auto;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-avatar {' +
        'width: 40px; height: 40px; border-radius: 50%;' +
        'border: 2.5px solid #E85A33; background: #2a5080;' +
        'overflow: hidden; box-sizing: border-box; flex: 0 0 auto;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-avatar img {' +
        'width: 100%; height: 100%; display: block; object-fit: cover;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-title {' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'color: #ffffff; font-size: 14px; font-weight: 700; line-height: 1.2;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-sub {' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'color: #c8d0da; font-size: 11px; font-weight: 500;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-close {' +
        'margin-left: auto;' +
        'border: none; background: rgba(255,255,255,0.12);' +
        'color: #ffffff; font-size: 16px; line-height: 1;' +
        'width: 28px; height: 28px; border-radius: 50%;' +
        'cursor: pointer;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-close:hover {' +
        'background: rgba(255,255,255,0.25);' +
      '}' +
      '#' + POPUP_ID + ' iframe {' +
        'border: none; width: 100%; flex: 1 1 auto; background: #0e1a2b;' +
      '}';
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ICONS (inline SVG — no icon library dependency inside GHL)
  // ═══════════════════════════════════════════════════════════════════════

  var ICONS = {
    calculator:
      '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/>' +
      '<line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="8" y2="11.01"/>' +
      '<line x1="12" y1="11" x2="12" y2="11.01"/><line x1="16" y1="11" x2="16" y2="11.01"/>' +
      '<line x1="8" y1="15" x2="8" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/>' +
      '<line x1="16" y1="15" x2="16" y2="18"/><line x1="8" y1="18" x2="8" y2="18.01"/>' +
      '<line x1="12" y1="18" x2="12" y2="18.01"/></svg>',
    house:
      '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8"/>' +
      '<path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DOCK ELEMENT
  // ═══════════════════════════════════════════════════════════════════════

  function buildItem(opts) {
    // opts: { id, label, kind: 'member'|'tool', img?, icon?, online?,
    //         training?, passive?, title?, onClick? }
    var item = document.createElement('button');
    item.type = 'button';
    item.id = opts.id;
    item.className = 'ot-dock-item' +
      (opts.kind === 'tool' ? ' ot-dock-tool' : '') +
      (opts.training ? ' ot-dock-training' : '') +
      (opts.passive ? ' ot-dock-passive' : '');
    if (opts.title) item.title = opts.title;

    var wrap = document.createElement('span');
    wrap.className = 'ot-dock-avatar-wrap';

    var circle = document.createElement('span');
    circle.className = 'ot-dock-circle';
    if (opts.img) {
      circle.innerHTML = '<img src="' + opts.img + '" alt="' + opts.label + '">';
    } else if (opts.icon) {
      circle.innerHTML = opts.icon;
    }
    wrap.appendChild(circle);

    if (opts.online) {
      var dot = document.createElement('span');
      dot.className = 'ot-dock-online';
      wrap.appendChild(dot);
    }

    var label = document.createElement('span');
    label.className = 'ot-dock-label';
    label.textContent = opts.label;

    item.appendChild(wrap);
    item.appendChild(label);

    if (opts.onClick) {
      item.addEventListener('click', opts.onClick);
    }

    return item;
  }

  function getOrCreateDock() {
    var dock = document.getElementById(DOCK_ID);
    if (dock) return dock;

    injectStyles();

    dock = document.createElement('div');
    dock.id = DOCK_ID;

    // Lead chip
    var lead = document.createElement('div');
    lead.className = 'ot-dock-lead';
    lead.innerHTML =
      '<span class="ot-dock-dot"></span>' +
      '<span class="ot-dock-lead-text" id="ot-dock-lead-text"></span>';
    dock.appendChild(lead);

    // ── Team ──
    dock.appendChild(buildItem({
      id: 'ot-dock-sam', label: 'Sam', kind: 'member', img: IMG.sam,
      online: true, passive: true,
      title: 'Sam · Acquisitionist — already working your leads'
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-mia', label: 'Mia', kind: 'member', img: IMG.mia,
      online: true,
      title: 'Mia · Followup Specialist — click to hand off this lead',
      onClick: onMiaClick
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-ruby', label: 'Ruby', kind: 'member', img: IMG.ruby,
      training: true,
      title: 'Ruby · Dispositionist — in training, coming soon'
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-tate', label: 'Tate', kind: 'member', img: IMG.tate,
      training: true,
      title: 'Tate · CRM Support — in training, coming soon'
    }));

    // ── Divider ──
    var divider = document.createElement('span');
    divider.className = 'ot-dock-divider';
    dock.appendChild(divider);

    // ── Tools ──
    dock.appendChild(buildItem({
      id: 'ot-dock-analyzer', label: 'Analyzer', kind: 'tool',
      icon: ICONS.calculator, title: 'Deal Analyzer',
      onClick: toolHandler('otToggleCalculatorPanel', 'Deal Analyzer')
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-comps', label: 'Comps', kind: 'tool',
      icon: ICONS.house, title: 'Get Comps',
      onClick: toolHandler('otToggleCompsPanel', 'Get Comps')
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-closer', label: 'Closer', kind: 'tool',
      icon: ICONS.phone, title: 'The Closer',
      onClick: toolHandler('otOpenTheCloser', 'The Closer')
    }));

    document.body.appendChild(dock);
    log('✅ TeamDock: dock built');
    return dock;
  }

  function toolHandler(fnName, toolName) {
    return function() {
      if (!window.OT_MODULES_READY) {
        alert('OfferTermz is still loading. Please wait a moment and try again.');
        return;
      }
      var fn = window[fnName];
      if (typeof fn === 'function') {
        fn();
      } else {
        alert('Something went wrong. Please refresh the page and try again.');
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // POSITIONING — centered horizontally; vertical anchor just below the
  // GHL header, in the white space of the page's tab row (where the lead
  // strip used to float). Re-measured every refresh.
  // ═══════════════════════════════════════════════════════════════════════

  function positionDock(dock) {
    var header = document.querySelector('.hl_header--controls');
    if (!header) return false;
    var rect = header.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    dock.style.top = (rect.bottom + 6) + 'px';
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // REFRESH LOOP — visibility, lead chip text, ready-state pulses
  // ═══════════════════════════════════════════════════════════════════════

  function refresh() {
    var dock = document.getElementById(DOCK_ID);

    // Dock lives on contact records only (the tools were contact-only
    // in the button world anyway — this keeps every other screen clean)
    if (!isOnContactPage()) {
      if (dock) dock.style.display = 'none';
      return;
    }

    dock = getOrCreateDock();

    // Lead chip: LEAD first name + street (the old strip's job)
    var leadEl = dock.querySelector('.ot-dock-lead');
    if (tabsReady()) {
      var leadFirstName = getFieldByLabel('First Name');
      var street = getFieldByLabel('Street Address');
      var text = '';
      if (leadFirstName && street) text = leadFirstName + ', ' + street;
      else text = leadFirstName || street;

      var textEl = document.getElementById('ot-dock-lead-text');
      if (text) {
        if (textEl && textEl.textContent !== text) {
          textEl.textContent = text;
          log('📍 TeamDock lead chip: ' + text);
        }
        leadEl.style.display = 'flex';
      } else {
        leadEl.style.display = 'none';
      }
    } else {
      leadEl.style.display = 'none';
    }

    // Ready-state pulses: Mia + Closer need the lead's fields (tabs);
    // Analyzer + Comps just need the modules.
    var waitFieldItems = [
      document.getElementById('ot-dock-mia'),
      document.getElementById('ot-dock-closer')
    ];
    waitFieldItems.forEach(function(item) {
      if (!item) return;
      if (tabsReady()) item.classList.remove('ot-dock-waiting');
      else item.classList.add('ot-dock-waiting');
    });

    var waitModuleItems = [
      document.getElementById('ot-dock-analyzer'),
      document.getElementById('ot-dock-comps')
    ];
    waitModuleItems.forEach(function(item) {
      if (!item) return;
      if (window.OT_MODULES_READY) item.classList.remove('ot-dock-waiting');
      else item.classList.add('ot-dock-waiting');
    });

    if (positionDock(dock)) {
      dock.style.display = 'flex';
    } else {
      dock.style.display = 'none';
    }
  }

  setInterval(refresh, REFRESH_EVERY_MS);
  document.addEventListener('ot-tabs-ready', refresh);

  // ═══════════════════════════════════════════════════════════════════════
  // MIA POPUP — dim the CRM, enlarge Mia's circle into a centered frame
  // loading the central Mia page with this lead's values.
  // ═══════════════════════════════════════════════════════════════════════

  function onMiaClick() {
    if (!isOnContactPage()) {
      alert('Please open a contact record first to hand a lead to Mia.');
      return;
    }
    if (!tabsReady()) {
      alert('One second — still loading this lead\'s details. Try again in a moment.');
      return;
    }
    openMiaPopup();
  }

  function openMiaPopup() {
    if (document.getElementById(OVERLAY_ID)) return; // already open

    var url = buildMiaURL();
    log('TeamDock: opening Mia → ' + url);

    // Overlay
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.addEventListener('click', closeMiaPopup);
    document.body.appendChild(overlay);

    // Popup
    var popup = document.createElement('div');
    popup.id = POPUP_ID;
    popup.innerHTML =
      '<div class="ot-mia-popup-head">' +
        '<span class="ot-mia-popup-avatar"><img src="' + IMG.mia + '" alt="Mia"></span>' +
        '<span>' +
          '<div class="ot-mia-popup-title">Mia</div>' +
          '<div class="ot-mia-popup-sub">Followup Specialist</div>' +
        '</span>' +
        '<button type="button" class="ot-mia-popup-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<iframe src="' + url + '" title="Mia — Followup Specialist"></iframe>';
    popup.querySelector('.ot-mia-popup-close').addEventListener('click', closeMiaPopup);
    document.body.appendChild(popup);

    // "Comes to life": start the popup collapsed at Mia's circle, then
    // release it to the center on the next frame so the transition runs.
    var miaItem = document.getElementById('ot-dock-mia');
    if (miaItem) {
      var r = miaItem.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      popup.style.transformOrigin = 'center center';
      popup.style.transform = 'translate(calc(' + (cx - window.innerWidth / 2) + 'px - 50%), ' +
        'calc(' + (cy - window.innerHeight / 2) + 'px - 50%)) scale(0.1)';
    }

    // ESC closes
    document.addEventListener('keydown', escHandler);

    // Two frames: first paints the collapsed state, second releases it
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        overlay.classList.add('ot-shown');
        popup.style.transform = '';
        popup.classList.add('ot-shown');
      });
    });
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeMiaPopup();
  }

  function closeMiaPopup() {
    var overlay = document.getElementById(OVERLAY_ID);
    var popup = document.getElementById(POPUP_ID);
    document.removeEventListener('keydown', escHandler);
    if (popup) {
      popup.classList.remove('ot-shown');
    }
    if (overlay) {
      overlay.classList.remove('ot-shown');
    }
    setTimeout(function() {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 280);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_TeamDock = {
    refresh: refresh,
    buildMiaURL: buildMiaURL,
    getCompanyName: getCompanyName,
    getLeadPhone: getLeadPhone,
    deriveStreetNameAndSuffix: deriveStreetNameAndSuffix,
    getAssignedUserFirstName: getAssignedUserFirstName,
    openMiaPopup: openMiaPopup,
    closeMiaPopup: closeMiaPopup
  };

  log('✅ ot-team-dock.js v1 loaded');

})();
