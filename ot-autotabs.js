/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Auto-Tabs Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 3 *** — THE TAB ABOVE THE TABS
 * UPDATES FROM V2:
 * - GHL only mounts the Contact/Property folders under the side panel's
 *   "All fields" tab. Refreshing while on DND/Actions meant the sentinel
 *   fields never existed, so READY never fired. V3 first ensures the
 *   "All fields" panel tab is active (.hr-tabs-tab[data-name="all-fields"],
 *   active = .hr-tabs-tab--active), clicking it with the same throttling
 *   as folder clicks, THEN proceeds to folders. Once READY fires the loop
 *   stops, so users are never yanked back from DND/Actions afterward.
 *
 * *** VERSION 2 *** — NEVER GIVE UP, GET PATIENT
 * UPDATES FROM V1:
 * - V1 stopped checking forever after ~10 seconds (25 attempts x 400ms).
 *   On slow GHL loads, tabs/fields weren't built in time, READY never
 *   fired, and dependent buttons pulsed until a manual refresh — seen
 *   intermittently on The Closer button and the Team Dock.
 * - V2 downgrades instead of quitting: after the fast window, the loop
 *   relaxes to one check every 3 seconds and keeps going until READY or
 *   until navigation leaves the lead. Slow days become slow wakeups,
 *   never dead buttons.
 *
 * *** VERSION 1 ***
 *
 * FILE: ot-autotabs.js
 * PURPOSE: Automatically opens the "Contact" and "Property Information Sheet"
 *          tabs every time a lead record loads, then confirms the fields
 *          inside them are actually built before signaling READY.
 * EDIT THIS WHEN: Tab names change in GHL, or other modules need different
 *                 fields confirmed before READY.
 *
 * WHY THIS EXISTS (lazy render):
 * GHL does not build a tab's fields until the tab is expanded, and the
 * building takes a moment AFTER expansion. Opening is instant; building
 * is not. This module absorbs that gap in the background, on page load,
 * so no button ever has to wait at click time.
 *
 * HOW OTHER MODULES USE IT:
 * - Check the flag:            window.OT_TABS_READY === true
 * - Or listen for the event:   document.addEventListener('ot-tabs-ready', fn)
 *   (fires each time a lead record becomes ready, including lead switches)
 *
 * READY means: both tabs are expanded AND the sentinel fields exist —
 * "First Name" (Contact tab) and "Street Address" (Property tab).
 * Field values may still be empty; READY is about existence, not content.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_AUTOTABS_LOADED) return;
  window.OT_AUTOTABS_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var TABS_TO_OPEN = ['Contact', 'Property Information Sheet'];

  // Sentinel field per tab — READY only when every one of these exists
  var SENTINEL_FIELDS = ['First Name', 'Street Address'];

  var CHECK_EVERY_MS = 400;    // how often the ensure-loop runs (fast window)
  var MAX_ATTEMPTS = 25;       // ~10s of fast checks before relaxing (V2: no more giving up)
  var SLOW_CHECK_EVERY_MS = 3000; // V2: patient cadence after the fast window
  // V3: the side panel tab that hosts the field folders
  var FIELDS_PANEL_TAB = '.hr-tabs-tab[data-name="all-fields"]';
  var PANEL_ACTIVE_CLASS = 'hr-tabs-tab--active';
  var URL_WATCH_MS = 300;      // how often we watch for lead switches

  // ═══════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_TABS_READY = false;

  var ensureInterval = null;
  var attempts = 0;
  var slowMode = false; // V2
  var lastPanelClickAt = -99; // V3: throttle for the All-fields tab click
  var lastClickAt = {};        // tabTitle -> attempt number of last click
  var currentContactId = null;

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

  function getContactId() {
    var match = window.location.pathname.match(/\/contacts\/detail\/([^\/]+)/);
    return match ? match[1] : null;
  }

  function findTab(tabTitle) {
    var tabs = document.querySelectorAll('.hr-collapse-item');
    for (var i = 0; i < tabs.length; i++) {
      var titleEl = tabs[i].querySelector('.hr-text');
      if (titleEl && titleEl.textContent.trim() === tabTitle) {
        var arrow = tabs[i].querySelector('svg');
        return {
          titleEl: titleEl,
          isOpen: arrow ? arrow.classList.contains('rotate-90') : false
        };
      }
    }
    return null; // tab not rendered yet
  }

  function fieldExists(labelText) {
    var labels = document.querySelectorAll('span.hr-form-item-label__text');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim().toLowerCase() === labelText.toLowerCase()) {
        var container = labels[i].closest('.hr-form-item__container');
        if (container && container.querySelector('input, select, textarea')) {
          return true;
        }
      }
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // THE ENSURE LOOP
  // ═══════════════════════════════════════════════════════════════════════

  function ensureTick() {
    if (!isOnContactPage()) {
      stopEnsuring('left contact page');
      return;
    }

    attempts++;

    // 0) V3: the folders only exist under the "All fields" panel tab.
    //    If the strip is rendered and another tab is active, switch first —
    //    folder work this tick would be pointless. If the strip isn't
    //    rendered (older layout / not built yet), fall through unchanged.
    var panelTab = document.querySelector(FIELDS_PANEL_TAB);
    if (panelTab && !panelTab.classList.contains(PANEL_ACTIVE_CLASS)) {
      if (attempts - lastPanelClickAt >= 2) {
        log('🗂 AutoTabs: switching side panel to "All fields" (attempt ' + attempts + ')');
        panelTab.click();
        lastPanelClickAt = attempts;
      }
      return; // give GHL a cycle to mount the folders
    }

    // 1) Open any tab that exists but is still collapsed.
    //    Click once, then give GHL two cycles to flip it before re-clicking,
    //    so we never machine-gun the toggle.
    var allOpen = true;
    for (var i = 0; i < TABS_TO_OPEN.length; i++) {
      var title = TABS_TO_OPEN[i];
      var tab = findTab(title);

      if (!tab) {
        allOpen = false; // tab itself not rendered yet — keep waiting
        continue;
      }

      if (!tab.isOpen) {
        allOpen = false;
        var last = lastClickAt[title] || -99;
        if (attempts - last >= 2) {
          log('🗂 AutoTabs: opening "' + title + '" (attempt ' + attempts + ')');
          tab.titleEl.click();
          lastClickAt[title] = attempts;
        }
      }
    }

    // 2) Tabs open is not enough — confirm the fields are actually built.
    if (allOpen) {
      var allFieldsExist = true;
      for (var f = 0; f < SENTINEL_FIELDS.length; f++) {
        if (!fieldExists(SENTINEL_FIELDS[f])) {
          allFieldsExist = false;
          break;
        }
      }

      if (allFieldsExist) {
        window.OT_TABS_READY = true;
        stopEnsuring('ready');
        log('✅ AutoTabs: READY — tabs open, fields built (attempt ' + attempts + ')');
        document.dispatchEvent(new CustomEvent('ot-tabs-ready'));
        return;
      }
    }

    // 3) V2: never give up while still on this lead — get patient instead.
    //    After the fast window, GHL is having a slow day: relax to a
    //    3-second cadence and keep checking until READY or navigation.
    //    (V1 stopped forever here, leaving pulsing buttons only a manual
    //    refresh could fix.)
    if (attempts >= MAX_ATTEMPTS && !slowMode) {
      slowMode = true;
      if (ensureInterval) clearInterval(ensureInterval);
      ensureInterval = setInterval(ensureTick, SLOW_CHECK_EVERY_MS);
      log('🐢 AutoTabs: slow mode after ' + attempts + ' fast attempts — retrying every ' + (SLOW_CHECK_EVERY_MS / 1000) + 's until ready');
    }
  }

  function startEnsuring() {
    stopEnsuring('restart');
    window.OT_TABS_READY = false;
    attempts = 0;
    slowMode = false; // V2: every lead starts with the fast window again
    lastPanelClickAt = -99; // V3
    lastClickAt = {};
    ensureTick(); // run immediately, then on the interval
    ensureInterval = setInterval(ensureTick, CHECK_EVERY_MS);
  }

  function stopEnsuring(reason) {
    if (ensureInterval) {
      clearInterval(ensureInterval);
      ensureInterval = null;
      if (reason && reason !== 'restart') {
        log('🧹 AutoTabs: loop stopped (' + reason + ')');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION WATCH (GHL is a single-page app — no page reloads)
  // ═══════════════════════════════════════════════════════════════════════

  function watchNavigation() {
    var contactId = isOnContactPage() ? getContactId() : null;

    if (contactId !== currentContactId) {
      currentContactId = contactId;

      if (contactId) {
        log('🗂 AutoTabs: lead record detected (' + contactId + ')');
        startEnsuring();
      } else {
        window.OT_TABS_READY = false;
        stopEnsuring('left contact page');
      }
    }
  }

  setInterval(watchNavigation, URL_WATCH_MS);
  watchNavigation(); // handle the case where we load directly on a lead

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_AutoTabs = {
    isReady: function() { return window.OT_TABS_READY === true; },
    ensure: startEnsuring,   // manual re-run (e.g. from console while debugging)
    fieldExists: fieldExists,
    stop: stopEnsuring
  };

  log('✅ ot-autotabs.js v1 loaded');

})();
