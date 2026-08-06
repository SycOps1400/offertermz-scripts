/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Lead Strip Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 1 ***
 *
 * FILE: ot-leadstrip.js
 * PURPOSE: A small branded pill shown just below the OfferTermz header
 *          buttons on every lead record, displaying the LEAD's first name
 *          and street address — e.g.  "John, 4506 Jackson Dr" — so the
 *          caller never says the wrong name or address mid-dial.
 * EDIT THIS WHEN: Changing what the strip shows, its look, or its position.
 *
 * DEPENDS ON: ot-autotabs.js (the Contact and Property tabs must be open
 *             and built before the fields can be read).
 *
 * SELF-CONTAINED ON PURPOSE: styles, element creation, and updates all
 * live in this one file so the feature can be removed by deleting one
 * line from the loader — nothing else references it.
 *
 * NOTE THE TWO NAMES IN THIS SYSTEM:
 * - The strip shows the LEAD's first name (the seller — "John").
 * - The Closer button sends the CALLER's first name (the assigned user).
 *   Different people, different sources, on purpose.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_LEADSTRIP_LOADED) return;
  window.OT_LEADSTRIP_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var STRIP_ID = 'ot-lead-strip';
  var BUTTONS_ID = 'ot-header-buttons'; // created by ot-loader.js
  var REFRESH_EVERY_MS = 500;           // re-read fields / re-anchor position

  // ═══════════════════════════════════════════════════════════════════════
  // DEBUG LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  function log(message) {
    if (window.OT_DEBUG) {
      console.log(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  function isOnContactPage() {
    return window.location.pathname.includes('/contacts/detail/');
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

  // ═══════════════════════════════════════════════════════════════════════
  // STYLES (injected once — OfferTermz brand: navy canvas, orange accent)
  // ═══════════════════════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('ot-lead-strip-styles')) return;

    var style = document.createElement('style');
    style.id = 'ot-lead-strip-styles';
    style.textContent =
      '#' + STRIP_ID + ' {' +
        'position: fixed;' +
        'z-index: 999;' +
        'display: none;' +               /* shown only when there is data */
        'align-items: center;' +
        'gap: 8px;' +
        'padding: 5px 14px 5px 10px;' +
        'border-radius: 999px;' +
        'background: linear-gradient(135deg, #1E3A5F 0%, #2a5080 100%);' +
        'box-shadow: 0 2px 8px rgba(30,58,95,0.35);' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'font-size: 12.5px;' +
        'font-weight: 600;' +
        'color: #ffffff;' +
        'white-space: nowrap;' +
        'pointer-events: none;' +        /* never blocks anything underneath */
        'letter-spacing: 0.2px;' +
      '}' +
      '#' + STRIP_ID + ' .ot-strip-dot {' +
        'width: 8px;' +
        'height: 8px;' +
        'border-radius: 50%;' +
        'background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%);' +
        'flex: 0 0 auto;' +
      '}';
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STRIP ELEMENT
  // ═══════════════════════════════════════════════════════════════════════

  function getOrCreateStrip() {
    var strip = document.getElementById(STRIP_ID);
    if (strip) return strip;

    injectStyles();
    strip = document.createElement('div');
    strip.id = STRIP_ID;
    strip.innerHTML =
      '<span class="ot-strip-dot"></span>' +
      '<span id="ot-strip-text"></span>';
    document.body.appendChild(strip);
    return strip;
  }

  // Anchor the strip directly below the OfferTermz header buttons,
  // right-edge aligned with them. Re-measured every refresh, so window
  // resizes and layout shifts self-correct.
  function positionStrip(strip) {
    var buttons = document.getElementById(BUTTONS_ID);
    if (!buttons) return false;

    var rect = buttons.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false; // not laid out yet

    strip.style.top = (rect.bottom + 6) + 'px';
    strip.style.right = (window.innerWidth - rect.right) + 'px';
    strip.style.left = 'auto';
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // REFRESH LOOP
  // ═══════════════════════════════════════════════════════════════════════

  function refresh() {
    var strip = document.getElementById(STRIP_ID);

    // Not on a lead → nothing to show
    if (!isOnContactPage() || window.OT_TABS_READY !== true) {
      if (strip) strip.style.display = 'none';
      return;
    }

    var leadFirstName = getFieldByLabel('First Name');
    var street = getFieldByLabel('Street Address');

    // Nothing captured on this lead yet → stay hidden rather than show a bare dot
    if (!leadFirstName && !street) {
      if (strip) strip.style.display = 'none';
      return;
    }

    strip = getOrCreateStrip();

    var text;
    if (leadFirstName && street) {
      text = leadFirstName + ', ' + street;
    } else {
      text = leadFirstName || street;
    }

    var textEl = document.getElementById('ot-strip-text');
    if (textEl && textEl.textContent !== text) {
      textEl.textContent = text;
      log('📍 LeadStrip: ' + text);
    }

    if (positionStrip(strip)) {
      strip.style.display = 'flex';
    } else {
      strip.style.display = 'none'; // header buttons not built yet
    }
  }

  setInterval(refresh, REFRESH_EVERY_MS);

  // Snap into place the moment a lead becomes ready
  document.addEventListener('ot-tabs-ready', refresh);

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_LeadStrip = {
    refresh: refresh
  };

  log('✅ ot-leadstrip.js v1 loaded');

})();
