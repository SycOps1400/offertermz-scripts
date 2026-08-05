/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz "The Closer" Button Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 2 ***
 * UPDATES FROM V1 (draft):
 * - Rebuilt on top of ot-autotabs.js — no tab-instruction modal, no waiting
 *   at click time. The button simply isn't lit until the lead is READY.
 * - Button pulses (loading look) until OT_TABS_READY, then goes solid.
 *
 * FILE: ot-closer.js
 * PURPOSE: Header button that opens The Closer call guide in a new tab,
 *          carrying the caller's first name, the property address, and the
 *          subscriber key.
 * EDIT THIS WHEN: Rotating the subscriber key, changing the tool URL,
 *                 or changing how name/address are read from the page.
 *
 * DEPENDS ON: ot-autotabs.js (must be loaded first — it opens the tabs and
 *             raises window.OT_TABS_READY when the fields exist).
 *
 * CONFIGURATION:
 * - CLOSER_URL: the live tool page
 * - CLOSER_KEY: shared subscriber key — MUST match the key hardcoded in
 *   the-closer-v31-fullpage.html. Rotation = change it in both files.
 *
 * HOW THE NAME IS FOUND:
 * - Reads the Assigned User shown on the contact record
 *   (span#hr-ellipsis-id). Everything before the first space is the
 *   first name ("Reginald Crawford" → "Reginald").
 * - "Unassigned" is sent as "UNASSIGNED" on purpose — the tool opens with
 *   "This is UNASSIGNED —", nudging the student to assign the lead.
 * - Element missing entirely → no name sent; the tool shows [your name].
 *
 * HOW THE ADDRESS IS FOUND:
 * - Street Address field in the Property Information Sheet tab, which
 *   ot-autotabs.js has already opened and confirmed built.
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
  var CLOSER_KEY = 'T8NhPzE1lx9H6CojmNyVQswb'; // Must match v31 page key

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

  function showFallbackAlert(message) {
    alert(message);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CALLER NAME (Assigned User)
  // ═══════════════════════════════════════════════════════════════════════

  function getCallerFirstName() {
    var el = document.getElementById('hr-ellipsis-id');
    if (!el) {
      log('The Closer: assigned-user element not found — sending no name');
      return '';
    }

    var fullName = (el.textContent || '').replace(/[<>]/g, '').trim();
    if (!fullName) {
      log('The Closer: assigned-user element empty — sending no name');
      return '';
    }

    // Deliberate nudge: unassigned leads open the tool as "UNASSIGNED"
    if (fullName.toLowerCase() === 'unassigned') {
      return 'UNASSIGNED';
    }

    // Everything before the first space = first name
    var firstName = fullName.split(' ')[0];
    log('The Closer: caller name resolved to "' + firstName + '"');
    return firstName;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // URL BUILDER
  // ═══════════════════════════════════════════════════════════════════════

  function buildCloserURL() {
    var params = [];

    var firstName = getCallerFirstName();
    if (firstName) {
      params.push('name=' + encodeURIComponent(firstName));
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
  // The loader creates the button; this keeps its look truthful:
  //   pulsing = this lead's fields are still being prepared
  //   solid   = ready, click will fire instantly
  // (Off contact pages, the loader's own disabled state takes over.)
  // ═══════════════════════════════════════════════════════════════════════

  function syncButtonState() {
    var btn = document.getElementById(BUTTON_ID);
    if (!btn) return; // loader hasn't built the header yet

    if (isOnContactPage() && !tabsReady()) {
      btn.classList.add('ot-btn-loading');
    } else {
      btn.classList.remove('ot-btn-loading');
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
    buildCloserURL: buildCloserURL,
    syncButtonState: syncButtonState
  };

  log('✅ ot-closer.js v2 loaded');

})();
