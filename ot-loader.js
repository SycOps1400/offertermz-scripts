/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Loader file
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * *** VERSION 4 ***
 * UPDATES FROM V3:
 * - MutationObserver now disconnects after header buttons are created
 * - Interval cleanup is more thorough
 * - All logging uses consistent log() helper
 * 
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - Confetti now loads FIRST (before other modules) so it's ready for success modal
 * - Smarter cache busting: uses daily version instead of every page load
 * - Reduced console logging: only errors show in production, debug mode available
 * - Added OT_DEBUG flag for verbose logging when troubleshooting
 * 
 * *** VERSION 2 ***
 * UPDATES:
 * - Fixed race condition: Buttons now disabled until all modules load
 * - Added OT_MODULES_READY flag for other scripts to check
 * - Buttons show "Loading..." state until ready
 * - Added error tracking for failed module loads
 * 
 * FILE: ot-loader.js
 * PURPOSE: Loads all OfferTermz modules and creates header buttons
 * THIS IS THE ONLY FILE THAT GOES IN GHL CUSTOM JS
 * 
 * EDIT THIS WHEN: 
 * - Adding new modules
 * - Changing GitHub URLs (after moving to your own repo)
 * - Adding/removing header buttons
 * 
 * SETUP:
 * 1. Upload all ot-*.js files to GitHub
 * 2. Update the GITHUB_BASE_URL below with your repo URL
 * 3. Copy this entire file into GHL Custom JS
 * 
 * DEBUG MODE:
 * - Set window.OT_DEBUG = true in browser console before page load
 * - Or add ?ot_debug=true to URL
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION - UPDATE THIS WITH YOUR GITHUB URL
  // ═══════════════════════════════════════════════════════════════════════
  
  // IMPORTANT: Replace with your GitHub raw URL after uploading files
  // Format: https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/
  var GITHUB_BASE_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/offertermz-scripts/main/';

  // Module files to load (in order)
  var MODULES = [
    'ot-styles.js',      // CSS styles (load first)
    'ot-modals.js',      // Modal system
    'ot-panels.js',      // Calculator, Script, Comps panels
    'ot-submit.js',      // Deal Token submission + coach blocking
    'ot-sam-help.js'     // Field help icons
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // DEBUG MODE & LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  // Check for debug mode via URL param or global flag
  var urlParams;
  try {
    urlParams = new URLSearchParams(window.location.search);
  } catch (e) {
    // Fallback for browsers without URLSearchParams
    urlParams = { get: function() { return null; } };
  }
  var DEBUG = window.OT_DEBUG || urlParams.get('ot_debug') === 'true';

  function log(message) {
    if (DEBUG) {
      console.log(message);
    }
  }

  function logError(message) {
    // Errors always show
    console.error(message);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SMARTER CACHE BUSTING
  // ═══════════════════════════════════════════════════════════════════════

  // Use daily cache version instead of every page load
  // This means scripts cache for 24 hours, reducing load times
  // To force refresh: add ?ot_nocache=true to URL
  function getCacheVersion() {
    if (urlParams.get('ot_nocache') === 'true') {
      return Date.now(); // Force fresh load
    }
    // Daily version: changes once per day
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

  // V4: Track observers/intervals for cleanup
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
  // LOAD CONFETTI FIRST (before modules)
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
      // Non-critical - continue without confetti
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
    if (document.getElementById('ot-header-buttons')) return false; // Already exists
    
    var headerControls = document.querySelector('.hl_header--controls');
    if (!headerControls) return false; // Can't create yet
    
    var container = document.createElement('div');
    container.id = 'ot-header-buttons';
    
    var buttons = [
      { id: 'ot-calculator-btn', text: 'Deal Analyzer', fn: 'otToggleCalculatorPanel' },
      { id: 'ot-script-btn', text: 'Show Script', fn: 'otToggleScriptPanel' },
      { id: 'ot-comps-btn', text: 'Get Comps', fn: 'otToggleCompsPanel' },
      { id: 'ot-token-btn', text: 'Submit Deal Token', fn: 'otSubmitDealToken' }
    ];
    
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
    return true; // Successfully created
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
  // V4: CLEANUP FUNCTION
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
      // V4: Stop watching once buttons are created
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

  log('🚀 OfferTermz Loader v4 starting...');
  
  // Load confetti first, then start loading modules
  loadConfetti(function() {
    loadNextModule(0);
  });

  // Watch for GHL dynamic content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }

  // V4: Store observer reference for cleanup
  appObserver = new MutationObserver(function() {
    // Only watch if buttons don't exist yet
    if (!document.getElementById('ot-header-buttons')) {
      waitForApp();
    } else {
      stopAppWatching();
    }
  });
  appObserver.observe(document.body, { childList: true, subtree: true });

  // V4: Store interval reference for cleanup
  var checks = 0;
  appCheckInterval = setInterval(function() {
    waitForApp();
    checks++;
    if (checks > 20 || document.getElementById('ot-header-buttons')) {
      stopAppWatching();
    }
  }, 500);

  // V4: Separate interval for URL changes (this one should keep running for SPA navigation)
  urlCheckInterval = setInterval(checkURLChange, 1000);

})();
