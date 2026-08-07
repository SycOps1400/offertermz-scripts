/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz "The Closer" Button Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 4 ***
 * UPDATES FROM V3:
 * - Unassigned leads now correctly send caller=UNASSIGNED. GHL does not
 *   render the owner name element at all when nobody is assigned (it shows
 *   an "Unassigned" placeholder in a different structure), so V3 found
 *   nothing and silently omitted the caller parameter. V4 treats "owner
 *   area present but no name" as the unassigned state.
 *
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - CALLER now read from the Owner dropdown (#owner-dropdown-trigger), not
 *   #hr-ellipsis-id — GHL uses that id TWICE (contact name AND owner), so
 *   id lookup grabbed the contact. Sandbox testing caught it.
 * - URL now carries two names: name = LEAD's first name (from the First
 *   Name field), caller = OWNER's first name. The v31 page will use caller
 *   for every "This is X" line.
 * - Key lengthened to 64 characters.
 * - Fixed: button stayed grey (disabled look) until refresh — the loader
 *   skips pulsing buttons when un-greying, so this module now clears the
 *   disabled state itself once READY.
 *
 * *** VERSION 2 ***
 * - Rebuilt on ot-autotabs.js: no modals, no waiting at click time.
 *
 * FILE: ot-closer.js
 * PURPOSE: Header button that opens The Closer call guide in a new tab,
 *          carrying the lead's first name, the caller's first name, the
 *          property address, and the subscriber key.
 * EDIT THIS WHEN: Rotating the subscriber key, changing the tool URL,
 *                 or changing how names/address are read from the page.
 *
 * DEPENDS ON: ot-autotabs.js (loads first; raises window.OT_TABS_READY).
 *
 * CONFIGURATION:
 * - CLOSER_URL: the live tool page
 * - CLOSER_KEY: shared subscriber key — MUST match the key hardcoded in
 *   the-closer-v31-fullpage.html. Rotation = change it in both files.
 *
 * URL PARAMETERS SENT:
 * - name   = lead's first name (the seller — "Charles")
 * - caller = owner's first name (the student — "Reginald");
 *            "UNASSIGNED" in caps when the lead has no owner, nudging the
 *            student to assign the lead to themselves
 * - address = Street Address from the Property Information Sheet
 * - k      = subscriber key
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_CLOSER_LOADED) return;
  window.OT_CLOSER_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var CLOSER_URL = 'https://tools.offertermz.com/ccc';
  var CLOSER_KEY = 'Gf7wI73qbSKji81o8lTRL5p6LR3FLlrTMDePRT4HMe6pBJXH1S3Pynx0CZxkqzNa'; // Must match v31 page key

  var BUTTON_ID = 'ot-closer-btn';   // created by ot-loader.js
  var SYNC_EVERY_MS = 300;           // how often the button look is synced

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

  function showFallbackAlert(message) {
    alert(message);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CALLER NAME (Owner dropdown)
  // NOTE: never use #hr-ellipsis-id — GHL assigns that id to BOTH the
  // contact name and the owner name. The owner's own container is the
  // only unambiguous anchor.
  // ═══════════════════════════════════════════════════════════════════════

  function getCallerFirstName() {
    var wrap = document.querySelector('#owner-dropdown-trigger');
    if (!wrap) {
      // Owner UI not on the page at all — can't know anything, send nothing
      log('The Closer: owner area not found — sending no caller');
      return '';
    }

    // Assigned leads render the name inside an ellipsis element; unassigned
    // leads render no such element (V4). Fall back to the area's whole text.
    var nameEl = wrap.querySelector('.hr-ellipsis');
    var text = ((nameEl ? nameEl.textContent : wrap.textContent) || '')
      .replace(/[<>]/g, '').trim();

    // Deliberate nudge: unassigned leads open the tool as "UNASSIGNED".
    // Covers both the literal "Unassigned" placeholder and an empty area.
    if (!text || text.toLowerCase().indexOf('unassigned') !== -1) {
      log('The Closer: no owner assigned — sending caller=UNASSIGNED');
      return 'UNASSIGNED';
    }

    var firstName = firstWord(text);
    log('The Closer: caller resolved to "' + firstName + '"');
    return firstName;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LEAD NAME (First Name field — Contact tab, already open via auto-tabs)
  // ═══════════════════════════════════════════════════════════════════════

  function getLeadFirstName() {
    var firstName = firstWord(getFieldByLabel('First Name'));
    if (firstName) {
      log('The Closer: lead resolved to "' + firstName + '"');
    }
    return firstName;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // URL BUILDER
  // ═══════════════════════════════════════════════════════════════════════

  function buildCloserURL() {
    var params = [];

    var leadName = getLeadFirstName();
    if (leadName) {
      params.push('name=' + encodeURIComponent(leadName));
    }

    var callerName = getCallerFirstName();
    if (callerName) {
      params.push('caller=' + encodeURIComponent(callerName));
    }

    var street = getFieldByLabel('Street Address');
    if (street) {
      params.push('address=' + encodeURIComponent(street));
    }

    // Subscriber key — always present
    params.push('k=' + CLOSER_KEY);

    return CLOSER_URL + '?' + params.join('&');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BUTTON READY-STATE SYNC
  //   pulsing = this lead's fields are still being prepared
  //   solid   = ready, click will fire instantly
  // V3: also clears the grey disabled look once READY, because the
  // loader's own un-grey pass deliberately skips pulsing buttons.
  // ═══════════════════════════════════════════════════════════════════════

  function syncButtonState() {
    var btn = document.getElementById(BUTTON_ID);
    if (!btn) return; // loader hasn't built the header yet

    if (!isOnContactPage()) {
      // Off contact pages: no pulse; the loader's disabled state applies.
      btn.classList.remove('ot-btn-loading');
      return;
    }

    if (!tabsReady()) {
      btn.classList.add('ot-btn-loading');
    } else {
      btn.classList.remove('ot-btn-loading');
      btn.classList.remove('ot-btn-disabled'); // V3 fix
      if (btn.dataset.readyText) {
        btn.textContent = btn.dataset.readyText;
      }
    }
  }

  setInterval(syncButtonState, SYNC_EVERY_MS);

  // Snap to solid the instant auto-tabs announces READY (no 300ms lag)
  document.addEventListener('ot-tabs-ready', syncButtonState);

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN BUTTON FUNCTION
  // ═══════════════════════════════════════════════════════════════════════

  window.otOpenTheCloser = function() {
    // Must be on a contact record
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('The Closer');
      } else {
        showFallbackAlert('Please open a contact record first to use The Closer.');
      }
      return;
    }

    // Rare edge: clicked while the lead's fields are still being prepared
    // (button is visibly pulsing in this state). Be honest, stay simple.
    if (!tabsReady()) {
      showFallbackAlert('One second — still loading this lead\'s details. Try again in a moment.');
      return;
    }

    // Everything is already built: read + open, all in the same instant
    // as the click, so the browser never blocks the new tab.
    var url = buildCloserURL();
    log('The Closer: opening ' + url);
    window.open(url, '_blank');
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_Closer = {
    open: window.otOpenTheCloser,
    getCallerFirstName: getCallerFirstName,
    getLeadFirstName: getLeadFirstName,
    buildCloserURL: buildCloserURL,
    syncButtonState: syncButtonState
  };

  log('✅ ot-closer.js v4 loaded');

})();
