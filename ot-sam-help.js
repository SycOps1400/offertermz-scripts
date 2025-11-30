/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz SAM Help Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - Consistent debug logging (uses log() helper, respects OT_DEBUG)
 * 
 * *** VERSION 2 ***
 * UPDATES:
 * - Fixed Escape key handler memory leak (now removed on all close paths)
 * - MutationObserver now disconnects after icons are successfully injected
 * - Added max retry limit with proper cleanup
 * - Improved performance by tracking injected labels
 * 
 * FILE: ot-sam-help.js
 * PURPOSE: Field help icons (ⓘ) and popup tooltips for SAM fields
 * EDIT THIS WHEN: Adding new help tooltips, changing help messages, styling icons
 * 
 * HOW IT WORKS:
 * - Scans for field labels containing specific text (case-insensitive)
 * - Adds a clickable ⓘ icon next to matching labels
 * - Shows a popup with SAM's friendly explanation when clicked
 * 
 * TO ADD A NEW TOOLTIP:
 * 1. Add a new entry to SAM_FIELD_HELP_CONFIG (line 45+)
 * 2. Set 'labelContains' to the text in the field label (case-insensitive)
 * 3. Set 'title' for the popup header
 * 4. Set 'message' for the popup content (HTML supported)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_SAM_HELP_LOADED) return;
  window.OT_SAM_HELP_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // V3: DEBUG LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  function log(message) {
    if (window.OT_DEBUG) {
      console.log(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELP CONFIGURATION - Add new tooltips here!
  // ═══════════════════════════════════════════════════════════════════════

  var SAM_FIELD_HELP_CONFIG = {
    
    'start_following_up': {
      labelContains: 'start following up',
      title: "When should I start?",
      message: "If a seller says <strong>\"call me in 6 months,\"</strong> it'll hurt your business if you follow up in 1 week.<br><br>Pick a future date and I'll take care of it.<br><br>We won't bother the lead till it's time — because in business, <strong>we say what we do and we do what we say.</strong> 😊"
    },
    
    'get_rapport_quickly': {
      labelContains: 'get rapport quickly',
      title: "Give me some context!",
      message: "Tell me anything about them:<br><br>• Kids, job, hobbies<br>• Why they're selling<br>• Favorite sports team<br>• Anything personal they mentioned<br><br>I'll use it to sound like a <strong>real person</strong> who actually remembers them."
    },
    
    'follow_up_frequency': {
      labelContains: 'follow up with this frequency',
      title: "How hard should I push?",
      message: "Not all sellers are made equal!<br><br><strong>🌱 Light</strong><br>Weekly, then eventually monthly. Nice and easy.<br><br><strong>⚡ Medium</strong><br>Every few days, slowly backing off to monthly.<br><br><strong>🔥 Heavy</strong><br>Tomorrow, then 2 days, 4 days, 6, 9, 11, 15... We're on it. <strong>GTFM baby!</strong>"
    },
    
    'when_leads_responds': {
      labelContains: 'when the leads responds',
      title: "What happens when they reply?",
      message: "I've got you covered! Pick one:<br><br><strong>Continue the conversation</strong><br>I keep chatting and see where this lead goes. You focus on other things.<br><br><strong>Stop talking, I got it</strong><br>I let you know they replied, then step back. You take over from here.<br><br><em>Your business, your pick!</em>"
    },
    
    'notify_me_at_this_number': {
      labelContains: 'notify me at this number',
      title: "Where should I text you?",
      message: "Give me a cell number and I'll message you like:<br><br><em>\"Hey, your lead John Doe responded!\"</em><br><br>Whose number should I use?<br>• <strong>Yours?</strong><br>• <strong>Your VA's?</strong><br>• <strong>Your closer?</strong><br>• <strong>The sales team?</strong><br><br>You pick.<br><br>P.S. I'm available 24/7, but I'll only bug you between <strong>9am-9pm</strong>. I've got manners. 😉"
    }
    
  };

  // Track state for cleanup
  var samHelpObserver = null;
  var retryInterval = null;
  var injectedLabelsCount = 0;
  var totalExpectedLabels = Object.keys(SAM_FIELD_HELP_CONFIG).length;

  // ═══════════════════════════════════════════════════════════════════════
  // SHOW HELP POPUP
  // ═══════════════════════════════════════════════════════════════════════

  function showHelpPopup(config) {
    // Don't create duplicate popups
    if (document.getElementById('sam-help-overlay')) return;
    
    var overlay = document.createElement('div');
    overlay.id = 'sam-help-overlay';
    overlay.className = 'sam-help-overlay';
    
    overlay.innerHTML = 
      '<div class="sam-help-popup">' +
        '<div class="sam-help-header">' +
          '<span class="sam-help-avatar">🤖</span>' +
          '<h3 class="sam-help-title">' + config.title + '</h3>' +
          '<button class="sam-help-close" id="sam-help-close-btn">✕</button>' +
        '</div>' +
        '<div class="sam-help-body">' +
          '<p class="sam-help-message">' + config.message + '</p>' +
        '</div>' +
        '<div class="sam-help-footer">' +
          '<button class="sam-help-btn" id="sam-help-got-it-btn">Got it!</button>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(overlay);
    
    // Store escape handler reference for proper cleanup
    var escHandler = function(e) {
      if (e.key === 'Escape') {
        closePopup();
      }
    };
    
    // Unified close function that always cleans up escape handler
    var closePopup = function() { 
      document.removeEventListener('keydown', escHandler);
      overlay.remove(); 
    };
    
    // Event listeners
    document.getElementById('sam-help-close-btn').onclick = closePopup;
    document.getElementById('sam-help-got-it-btn').onclick = closePopup;
    
    // Close on overlay click
    overlay.onclick = function(e) { 
      if (e.target === overlay) closePopup(); 
    };
    
    // Add escape handler
    document.addEventListener('keydown', escHandler);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INJECT INFO ICONS
  // ═══════════════════════════════════════════════════════════════════════

  function injectInfoIcons() {
    var labels = document.querySelectorAll('div.label');
    var newlyInjected = 0;
    
    labels.forEach(function(label) {
      var labelText = (label.textContent || '').toLowerCase();
      
      // Skip if icon already exists
      if (label.querySelector('.sam-info-icon')) return;
      
      // Check each help config
      Object.keys(SAM_FIELD_HELP_CONFIG).forEach(function(fieldKey) {
        var config = SAM_FIELD_HELP_CONFIG[fieldKey];
        
        // Case-insensitive match
        if (labelText.includes(config.labelContains.toLowerCase())) {
          
          // Create the icon
          var icon = document.createElement('span');
          icon.className = 'sam-info-icon';
          icon.innerHTML = '𝑖';
          icon.title = 'Click for help';
          
          // Click handler
          icon.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            showHelpPopup(config);
          };
          
          // Add to label
          label.appendChild(icon);
          newlyInjected++;
        }
      });
    });
    
    // Track total injected
    if (newlyInjected > 0) {
      injectedLabelsCount += newlyInjected;
      log('💡 SAM Help: Injected ' + newlyInjected + ' icons (total: ' + injectedLabelsCount + '/' + totalExpectedLabels + ')');
    }
    
    // Return true if all expected icons are injected
    return injectedLabelsCount >= totalExpectedLabels;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CLEANUP FUNCTION
  // ═══════════════════════════════════════════════════════════════════════

  function stopWatching() {
    if (samHelpObserver) {
      samHelpObserver.disconnect();
      samHelpObserver = null;
      log('🧹 SAM Help: Observer disconnected');
    }
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  function initSamHelp() {
    var allInjected = injectInfoIcons();
    if (allInjected) {
      stopWatching();
    }
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSamHelp);
  } else {
    initSamHelp();
  }
  
  // Watch for dynamic content (GHL loads fields dynamically)
  samHelpObserver = new MutationObserver(function() {
    clearTimeout(window.samHelpDebounce);
    window.samHelpDebounce = setTimeout(function() {
      var allInjected = injectInfoIcons();
      if (allInjected) {
        stopWatching();
      }
    }, 100);
  });
  
  samHelpObserver.observe(document.body, { childList: true, subtree: true });
  
  // Retry injection periodically (GHL lazy loads)
  var attempts = 0;
  var maxAttempts = 20;
  retryInterval = setInterval(function() {
    var allInjected = injectInfoIcons();
    attempts++;
    
    // Stop if all injected OR max attempts reached
    if (allInjected || attempts >= maxAttempts) {
      if (attempts >= maxAttempts && !allInjected) {
        log('⚠️ SAM Help: Max attempts reached, only injected ' + injectedLabelsCount + '/' + totalExpectedLabels + ' icons');
      }
      stopWatching();
    }
  }, 500);

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_SamHelp = {
    config: SAM_FIELD_HELP_CONFIG,
    inject: injectInfoIcons,
    showPopup: showHelpPopup,
    stopWatching: stopWatching
  };

  log('✅ ot-sam-help.js v3 loaded');

})();
