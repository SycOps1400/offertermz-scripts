/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Loader v9
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 10 *** — THE LEGEND
 * UPDATES FROM V9:
 * - New module in dock mode: ot-legend.js — the SMRT Team key map popup
 *   (opened from the info icon on the dock pill).
 *
 * *** VERSION 9 *** — THE SMRT TEAM DOCK (SANDBOX ONLY)
 * UPDATES FROM V8:
 * - New module: ot-team-dock.js — the navy Team Dock bar (SMRT AI Team
 *   portrait circles + tool circles + lead chip) that REPLACES the three
 *   header buttons and the lead strip.
 * - New rollout switch: ENABLE_DOCK_EVERYWHERE (false in this version).
 *   Sandbox gets the dock; every production subaccount keeps the exact
 *   v8 experience — three buttons + lead strip — untouched.
 * - In dock mode the loader skips creating the header buttons and skips
 *   loading ot-leadstrip.js (the dock's lead chip is the strip's heir).
 *   Both are restorable by flipping the flag logic — nothing deleted.
 * - TO ROLL OUT TO EVERYONE (next tag): set ENABLE_DOCK_EVERYWHERE = true.
 *
 * *** VERSION 8 *** — THE LAUNCH VERSION
 * UPDATES FROM V7:
 * - ENABLE_CLOSER_EVERYWHERE flipped to true. Every subaccount now gets:
 *   auto-opening tabs, the lead strip, and the three-button header —
 *   Deal Analyzer (right side, 45%) · Get Comps · The Closer.
 * - Show Script and Submit Deal Token buttons retired everywhere
 *   (their modules stay loaded; restoration is a one-line change).
 *
 * *** VERSION 7 ***
 * UPDATES FROM V6:
 * - Closer world drops the Show Script button (CCC page replaced static
 *   scripts). Production button set still identical to v5.
 *
 * *** VERSION 6 ***
 * UPDATES FROM V5:
 * - Registers three new modules: ot-autotabs.js, ot-closer.js, ot-leadstrip.js
 * - Header button change: "Submit Deal Token" replaced by "The Closer"
 * - BOTH changes are SANDBOX-ONLY in this version. Production subaccounts
 *   behave exactly like v5 — same modules, same four buttons. This lets the
 *   full new pipeline be tested in the sandbox behind tag v1.2.8 before the
 *   switch is flipped for everyone in a later tag.
 * - TO ROLL OUT TO EVERYONE (next tag): set ENABLE_CLOSER_EVERYWHERE = true.
 *
 * NOTE: ot-submit.js still loads everywhere. Only its header button is
 * replaced — the Deal Token machinery stays intact and restorable.
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION - SANDBOX VS PRODUCTION
  // ═══════════════════════════════════════════════════════════════════════
  
  var SANDBOX_LOCATION_ID = 'gE9qbjW9QSgOwI1Api5h';

  // V6: The Closer rollout switch.
  // false = new modules + The Closer button appear in the SANDBOX only.
  // true  = everyone gets them (flip this in the rollout tag).
  var ENABLE_CLOSER_EVERYWHERE = true;

  // V9: The Team Dock rollout switch.
  // false = the dock (and the retirement of header buttons + lead strip)
  //         happens in the SANDBOX only. Production stays pure v8.
  // true  = everyone gets the dock (flip this in the rollout tag).
  var ENABLE_DOCK_EVERYWHERE = false;
  
  function getLoaderVersion() {
    var scripts = document.querySelectorAll('script[src*="offertermz-scripts"]');
    for (var i = 0; i < scripts.length; i++) {
      var match = scripts[i].src.match(/@(v[\d.]+)\//);
      if (match) return match[1];
    }
    return 'dev';
  }
  
  function getCurrentLocationId() {
    var match = window.location.pathname.match(/\/location\/([^\/]+)/);
    return match ? match[1] : null;
  }
  
  var currentLocationId = getCurrentLocationId();
  var IS_SANDBOX = (currentLocationId === SANDBOX_LOCATION_ID);
  var CURRENT_VERSION = getLoaderVersion();

  // V6: one flag that answers "does this account get The Closer experience?"
  var CLOSER_ENABLED = ENABLE_CLOSER_EVERYWHERE || IS_SANDBOX;

  // V9: one flag that answers "does this account get the Team Dock?"
  var DOCK_ENABLED = ENABLE_DOCK_EVERYWHERE || IS_SANDBOX;
  
  var GITHUB_BASE_URL = IS_SANDBOX
    ? 'https://cdn.jsdelivr.net/gh/SycOps1400/offertermz-scripts@dev/'
    : 'https://cdn.jsdelivr.net/gh/SycOps1400/offertermz-scripts@' + CURRENT_VERSION + '/';

  var MODULES = [
    'ot-styles.js',
    'ot-modals.js',
    'ot-panels.js',
    'ot-submit.js',
    'ot-sam-help.js'
  ];

  // V6: The Closer pipeline. Order matters: ot-autotabs.js must load
  // before the modules that depend on its READY signal.
  // V9: in dock mode the lead strip is not loaded — the dock's lead chip
  // does its job. The strip module itself is untouched and restorable.
  if (CLOSER_ENABLED) {
    MODULES.push('ot-autotabs.js');
    MODULES.push('ot-closer.js');
    if (!DOCK_ENABLED) {
      MODULES.push('ot-leadstrip.js');
    }
  }

  // V9: the Team Dock itself (last — it depends on everything above).
  if (DOCK_ENABLED) {
    MODULES.push('ot-team-dock.js');
      MODULES.push('ot-legend.js'); // V10: the SMRT Team key map
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEBUG MODE & LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  var urlParams;
  try {
    urlParams = new URLSearchParams(window.location.search);
  } catch (e) {
    urlParams = { get: function() { return null; } };
  }
  var DEBUG = window.OT_DEBUG || urlParams.get('ot_debug') === 'true';

  function log(message) {
    if (DEBUG) {
      console.log(message);
    }
  }

  function logError(message) {
    console.error(message);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CACHE BUSTING
  // ═══════════════════════════════════════════════════════════════════════

  function getCacheVersion() {
    if (urlParams.get('ot_nocache') === 'true') {
      return Date.now();
    }
    var today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  }

  var CACHE_VERSION = getCacheVersion();

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_MODULES_READY = false;
  window.OT_CONFETTI_READY = false;
  var loadedCount = 0;
  var failedModules = [];
  var totalModules = MODULES.length;

  var appObserver = null;
  var appCheckInterval = null;
  var urlCheckInterval = null;

  // ═══════════════════════════════════════════════════════════════════════
  // SCRIPT LOADER
  // ═══════════════════════════════════════════════════════════════════════

  function loadScript(url, moduleName, callback) {
    var script = document.createElement('script');
    script.src = url + '?v=' + CACHE_VERSION;
    script.onload = function() {
      callback(true);
    };
    script.onerror = function() {
      logError('❌ Failed to load: ' + url);
      failedModules.push(moduleName);
      callback(false);
    };
    document.head.appendChild(script);
  }

  function loadNextModule(index) {
    if (index >= MODULES.length) {
      onAllModulesLoaded();
      return;
    }

    var moduleName = MODULES[index];
    var moduleUrl = GITHUB_BASE_URL + moduleName;
    loadScript(moduleUrl, moduleName, function(success) {
      loadedCount++;
      log('📦 Loaded ' + loadedCount + '/' + totalModules + ': ' + moduleName + (success ? '' : ' (FAILED)'));
      loadNextModule(index + 1);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOAD CONFETTI
  // ═══════════════════════════════════════════════════════════════════════

  function loadConfetti(callback) {
    var confettiScript = document.createElement('script');
    confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
    confettiScript.onload = function() {
      window.OT_CONFETTI_READY = true;
      log('🎊 Confetti library loaded');
      callback();
    };
    confettiScript.onerror = function() {
      log('⚠️ Confetti failed to load (non-critical)');
      callback();
    };
    document.head.appendChild(confettiScript);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HEADER BUTTONS
  // ═══════════════════════════════════════════════════════════════════════

  function safeHandler(fnName, buttonName) {
    return function() {
      if (!window.OT_MODULES_READY) {
        alert('OfferTermz is still loading. Please wait a moment and try again.');
        return;
      }
      
      var fn = window[fnName];
      if (typeof fn === 'function') {
        fn();
      } else {
        logError('Function ' + fnName + ' not found');
        alert('Something went wrong. Please refresh the page and try again.');
      }
    };
  }

  function createHeaderButtons() {
    // V9: in dock mode the buttons are retired — ot-team-dock.js owns the
    // header UI. Report success so the app-watcher stands down.
    if (DOCK_ENABLED) return true;

    if (document.getElementById('ot-header-buttons')) return false;
    
    var headerControls = document.querySelector('.hl_header--controls');
    if (!headerControls) return false;
    
    var container = document.createElement('div');
    container.id = 'ot-header-buttons';
    
    // V7: two button worlds.
    // Closer world: Show Script retired (the CCC page replaced static
    // scripts) and The Closer takes the last slot. Production (until the
    // rollout flag flips): the original four, unchanged.
    var buttons;
    if (CLOSER_ENABLED) {
      buttons = [
        { id: 'ot-calculator-btn', text: 'Deal Analyzer', fn: 'otToggleCalculatorPanel' },
        { id: 'ot-comps-btn', text: 'Get Comps', fn: 'otToggleCompsPanel' },
        { id: 'ot-closer-btn', text: 'The Closer', fn: 'otOpenTheCloser' }
      ];
    } else {
      buttons = [
        { id: 'ot-calculator-btn', text: 'Deal Analyzer', fn: 'otToggleCalculatorPanel' },
        { id: 'ot-script-btn', text: 'Show Script', fn: 'otToggleScriptPanel' },
        { id: 'ot-comps-btn', text: 'Get Comps', fn: 'otToggleCompsPanel' },
        { id: 'ot-token-btn', text: 'Submit Deal Token', fn: 'otSubmitDealToken' }
      ];
    }
    
    buttons.forEach(function(b) {
      var btn = document.createElement('button');
      btn.id = b.id;
      btn.className = 'ot-header-btn ot-btn-loading';
      btn.textContent = 'Loading...';
      btn.dataset.readyText = b.text;
      btn.addEventListener('click', safeHandler(b.fn, b.text));
      container.appendChild(btn);
    });
    
    headerControls.insertBefore(container, headerControls.firstChild);
    return true;
  }

  function enableButtons() {
    var buttons = document.querySelectorAll('.ot-header-btn');
    buttons.forEach(function(btn) {
      btn.classList.remove('ot-btn-loading');
      btn.textContent = btn.dataset.readyText || btn.textContent;
    });
    updateButtonStates();
  }

  function updateButtonStates() {
    var onContact = window.location.pathname.includes('/contacts/detail/');
    var buttons = document.querySelectorAll('.ot-header-btn');
    
    buttons.forEach(function(btn) {
      if (btn.classList.contains('ot-btn-loading')) return;
      
      if (onContact) {
        btn.classList.remove('ot-btn-disabled');
      } else {
        btn.classList.add('ot-btn-disabled');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════

  function stopAppWatching() {
    if (appObserver) {
      appObserver.disconnect();
      appObserver = null;
      log('🧹 App observer disconnected');
    }
    if (appCheckInterval) {
      clearInterval(appCheckInterval);
      appCheckInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  function onAllModulesLoaded() {
    window.OT_MODULES_READY = true;
    
    if (failedModules.length > 0) {
      logError('⚠️ OfferTermz loaded with errors. Failed modules: ' + failedModules.join(', '));
    } else {
      log('✅ All OfferTermz modules loaded!');
    }
    
    initializeUI();
    enableButtons();
  }

  function initializeUI() {
    var created = createHeaderButtons();
    if (created) {
      stopAppWatching();
    }
    updateButtonStates();
  }

  var lastURL = window.location.href;

  function checkURLChange() {
    if (window.location.href !== lastURL) {
      lastURL = window.location.href;
      updateButtonStates();
    }
  }

  function waitForApp() {
    if (window.location.pathname.includes('login') || window.location.pathname.includes('auth')) return;
    
    var headerControls = document.querySelector('.hl_header--controls');
    if (headerControls && !document.getElementById('ot-header-buttons')) {
      initializeUI();
      if (window.OT_MODULES_READY) {
        enableButtons();
      }
    }
    checkURLChange();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // START LOADING
  // ═══════════════════════════════════════════════════════════════════════

  log('🚀 OfferTermz Loader v9 starting... (Sandbox: ' + IS_SANDBOX + ', Closer: ' + CLOSER_ENABLED + ', Dock: ' + DOCK_ENABLED + ')');
  
  loadConfetti(function() {
    loadNextModule(0);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }

  appObserver = new MutationObserver(function() {
    if (!document.getElementById('ot-header-buttons')) {
      waitForApp();
    } else {
      stopAppWatching();
    }
  });
  appObserver.observe(document.body, { childList: true, subtree: true });

  var checks = 0;
  appCheckInterval = setInterval(function() {
    waitForApp();
    checks++;
    if (checks > 20 || document.getElementById('ot-header-buttons')) {
      stopAppWatching();
    }
  }, 500);

  urlCheckInterval = setInterval(checkURLChange, 1000);

})();
