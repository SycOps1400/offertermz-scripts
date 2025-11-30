/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Modals Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - Fixed Escape key now properly calls onCancel callback for confirmation modal
 * - Modal-specific escape handlers prevent state lock issues
 * - Consistent debug logging
 * 
 * *** VERSION 2 ***
 * UPDATES:
 * - Confetti now checks OT_CONFETTI_READY flag before firing
 * - Reduced console logging (respects OT_DEBUG flag)
 * - Added Escape key support to close modals
 * 
 * FILE: ot-modals.js
 * PURPOSE: Modal system - create, show, hide, and all modal types
 * EDIT THIS WHEN: Changing popup messages, adding new modal types
 * 
 * MODAL TYPES INCLUDED:
 * - Base modal (create, show, hide)
 * - Not on contact page alert
 * - Section instruction modal (open tabs)
 * - Confirmation modal (use a token?)
 * - Validation error modal (missing fields)
 * - Success modal (deal sent!)
 * - Coach location modal (hey coach!)
 * - Network error modal (retry)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_MODALS_LOADED) return;
  window.OT_MODALS_LOADED = true;

  // Logging helper (respects debug mode)
  function log(message) {
    if (window.OT_DEBUG) {
      console.log(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BASE MODAL SYSTEM (V3: Improved escape key handling)
  // ═══════════════════════════════════════════════════════════════════════

  var currentEscHandler = null;
  var currentOnCancel = null; // V3: Track cancel callback for escape key

  function createModal() {
    if (document.getElementById('ot-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'ot-modal';
    modal.className = 'ot-modal';
    modal.innerHTML = '<div class="ot-modal-overlay"></div><div class="ot-modal-content"><div class="ot-modal-body" id="ot-modal-body"></div></div>';
    document.body.appendChild(modal);
  }

  // V3: Updated to accept optional onCancel callback for escape key
  function showModal(onCancel) {
    createModal();
    document.getElementById('ot-modal').classList.add('visible');
    
    // Store the cancel callback
    currentOnCancel = onCancel || null;
    
    // Add escape key handler
    if (currentEscHandler) {
      document.removeEventListener('keydown', currentEscHandler);
    }
    currentEscHandler = function(e) {
      if (e.key === 'Escape') {
        hideModal(true); // V3: Pass flag indicating escape was pressed
      }
    };
    document.addEventListener('keydown', currentEscHandler);
  }

  // V3: Updated to call onCancel when dismissed via escape
  function hideModal(wasEscapeKey) {
    var modal = document.getElementById('ot-modal');
    if (modal) modal.classList.remove('visible');
    
    // Remove escape key handler
    if (currentEscHandler) {
      document.removeEventListener('keydown', currentEscHandler);
      currentEscHandler = null;
    }
    
    // V3: Call onCancel if escape was pressed and callback exists
    if (wasEscapeKey && currentOnCancel) {
      currentOnCancel();
    }
    currentOnCancel = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NOT ON CONTACT PAGE ALERT
  // ═══════════════════════════════════════════════════════════════════════

  function showNotOnContactAlert(buttonName) {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    body.innerHTML = 
      '<div class="ot-modal-icon">📋</div>' +
      '<div class="ot-modal-title">Open a Contact First</div>' +
      '<div class="ot-modal-message">' +
        'To use <strong>' + buttonName + '</strong>, you need to open a contact record first.' +
        '<br><br>' +
        'Go to your contacts list and click on a lead to open their profile.' +
      '</div>' +
      '<div class="ot-modal-buttons">' +
        '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-ok-btn">Got It</button>' +
      '</div>';
    
    showModal(); // No onCancel needed
    document.getElementById('ot-ok-btn').onclick = function() { hideModal(false); };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION INSTRUCTION MODAL (Open Tabs)
  // ═══════════════════════════════════════════════════════════════════════

  function showSectionInstructionModal(sectionStatus, onRetry, onCancel, buttonName) {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    var needContact = !sectionStatus.contactOpen;
    var needProperty = !sectionStatus.propertyOpen;
    var needBoth = needContact && needProperty;
    var btnName = buttonName || 'Submit Deal Token';
    
    var cursorSVG = '<svg class="ot-cursor-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L10.5 20L12.5 13.5L19 11.5L4 4Z" fill="#333" stroke="#333" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    
    var html = '<div class="ot-modal-icon">🤖</div>';
    
    if (needBoth) {
      html += '<div class="ot-modal-title">I need you to open 2 tabs</div>';
      html += '<div class="ot-modal-message">Find and click these on your screen:</div>';
      html += '<div class="ot-look-label">CLICK THIS TAB:</div>';
      html += '<div class="ot-tab-highlight"><span class="ot-tab-chevron">&gt;</span> Contact ' + cursorSVG + '</div>';
      html += '<div class="ot-look-label">THEN CLICK THIS TAB:</div>';
      html += '<div class="ot-tab-highlight"><span class="ot-tab-chevron">&gt;</span> Property Information Sheet ' + cursorSVG + '</div>';
      html += '<div class="ot-instruction-small">After clicking both tabs, come back and click "' + btnName + '" again.</div>';
    } else if (needContact) {
      html += '<div class="ot-modal-title">I need you to open 1 tab</div>';
      html += '<div class="ot-modal-message">Find and click this on your screen:</div>';
      html += '<div class="ot-look-label">CLICK THIS TAB:</div>';
      html += '<div class="ot-tab-highlight"><span class="ot-tab-chevron">&gt;</span> Contact ' + cursorSVG + '</div>';
      html += '<div class="ot-instruction-small">After clicking the tab, come back and click "' + btnName + '" again.</div>';
    } else if (needProperty) {
      html += '<div class="ot-modal-title">I need you to open 1 tab</div>';
      html += '<div class="ot-modal-message">Find and click this on your screen:</div>';
      html += '<div class="ot-look-label">CLICK THIS TAB:</div>';
      html += '<div class="ot-tab-highlight"><span class="ot-tab-chevron">&gt;</span> Property Information Sheet ' + cursorSVG + '</div>';
      html += '<div class="ot-instruction-small">After clicking the tab, come back and click "' + btnName + '" again.</div>';
    }
    
    html += '<div class="ot-modal-buttons">';
    html += '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-ok-btn">OK, Got It</button>';
    html += '</div>';
    
    body.innerHTML = html;
    showModal(onCancel); // V3: Pass onCancel for escape key
    
    document.getElementById('ot-ok-btn').onclick = function() { 
      hideModal(false); 
      if (onCancel) onCancel(); 
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL (Use a Token?) - V3: Fixed escape key handling
  // ═══════════════════════════════════════════════════════════════════════

  function showConfirmationModal(onConfirm, onCancel) {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    body.innerHTML = 
      '<div class="ot-modal-icon">⚠️</div>' +
      '<div class="ot-modal-title">Use a Deal Token?</div>' +
      '<div class="ot-modal-message">' +
        'This will send your deal to the coaches for review.' +
        '<br><br>' +
        '<strong>It costs 1 token and can\'t be undone.</strong>' +
      '</div>' +
      '<div class="ot-modal-buttons">' +
        '<button class="ot-modal-btn ot-modal-btn-secondary" id="ot-cancel-btn">Nevermind</button>' +
        '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-confirm-btn">Yes, Submit Deal</button>' +
      '</div>';
    
    // V3: Pass onCancel so escape key properly cancels and unlocks submission
    showModal(onCancel);
    
    document.getElementById('ot-cancel-btn').onclick = function() { 
      hideModal(false); 
      if (onCancel) onCancel(); 
    };
    document.getElementById('ot-confirm-btn').onclick = function() { 
      hideModal(false); 
      if (onConfirm) onConfirm(); 
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDATION ERROR MODAL (Missing Fields)
  // ═══════════════════════════════════════════════════════════════════════

  function showValidationErrorModal(errors) {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    var errorListHTML = errors.map(function(e) {
      return '<div class="ot-error-item">' + e + '</div>';
    }).join('');
    
    body.innerHTML = 
      '<div class="ot-modal-icon">📝</div>' +
      '<div class="ot-modal-title">Oops! Missing some info</div>' +
      '<div class="ot-modal-message">I need a few more details before I can send this to the coaches:</div>' +
      '<div class="ot-error-list">' + errorListHTML + '</div>' +
      '<div class="ot-modal-buttons">' +
        '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-close-btn">Got It</button>' +
      '</div>';
    
    showModal();
    document.getElementById('ot-close-btn').onclick = function() { hideModal(false); };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUCCESS MODAL (Deal Sent!)
  // ═══════════════════════════════════════════════════════════════════════

  function showSuccessModal() {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    body.innerHTML = 
      '<div class="ot-success-check"></div>' +
      '<div class="ot-modal-title">Woohoo! Deal Sent! 🎉</div>' +
      '<div class="ot-modal-message">' +
        'Your deal is on its way to the coaches!' +
        '<br><br>' +
        'They\'ll review it and work on closing it for you. Check your email for updates!' +
      '</div>' +
      '<div class="ot-modal-buttons">' +
        '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-done-btn">Awesome!</button>' +
      '</div>';
    
    showModal();
    
    // Check both confetti function AND ready flag
    setTimeout(function() {
      if (window.confetti && window.OT_CONFETTI_READY) {
        var duration = 3000;
        var end = Date.now() + duration;
        (function frame() {
          confetti({ 
            particleCount: 3, 
            angle: 60, 
            spread: 55, 
            origin: { x: 0 }, 
            colors: ['#f9603a', '#34434a', '#85bb65', '#ffd700'] 
          });
          confetti({ 
            particleCount: 3, 
            angle: 120, 
            spread: 55, 
            origin: { x: 1 }, 
            colors: ['#f9603a', '#34434a', '#85bb65', '#ffd700'] 
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      } else {
        log('Confetti not available - skipping animation');
      }
    }, 300);
    
    document.getElementById('ot-done-btn').onclick = function() { hideModal(false); };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COACH LOCATION MODAL (Hey Coach!)
  // ═══════════════════════════════════════════════════════════════════════

  function showCoachLocationModal(streetAddress) {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    body.innerHTML = 
      '<div class="ot-modal-icon">👋</div>' +
      '<div class="ot-modal-title">Hey Coach!</div>' +
      '<div class="ot-modal-message">' +
        'You\'re already in the <strong>Truka Deal Token CRM</strong>.<br><br>' +
        'If we submit this deal, you\'ll just get it right back. 😊<br><br>' +
        'Maybe you thought you were in your own CRM or somewhere else?<br><br>' +
        'Good luck with <strong>' + streetAddress + '</strong>!' +
      '</div>' +
      '<div class="ot-modal-buttons">' +
        '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-coach-ok-btn">Got It!</button>' +
      '</div>';
    
    showModal();
    document.getElementById('ot-coach-ok-btn').onclick = function() { hideModal(false); };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NETWORK ERROR MODAL (Retry)
  // ═══════════════════════════════════════════════════════════════════════

  function showNetworkErrorModal(message, onRetry) {
    createModal();
    var body = document.getElementById('ot-modal-body');
    
    // V3: Define cancel action for this modal
    var cancelAction = function() {
      window.OT_IS_SUBMITTING = false;
    };
    
    body.innerHTML = 
      '<div class="ot-modal-icon">😕</div>' +
      '<div class="ot-modal-title">Hmm, something went wrong</div>' +
      '<div class="ot-modal-message">' +
        message +
        '<br><br>' +
        'Don\'t worry - your info is still here. Try again!' +
      '</div>' +
      '<div class="ot-modal-buttons">' +
        '<button class="ot-modal-btn ot-modal-btn-secondary" id="ot-cancel-btn">Cancel</button>' +
        '<button class="ot-modal-btn ot-modal-btn-primary" id="ot-retry-btn">Try Again</button>' +
      '</div>';
    
    showModal(cancelAction); // V3: Pass cancel action for escape key
    
    document.getElementById('ot-cancel-btn').onclick = function() { 
      hideModal(false); 
      cancelAction();
    };
    document.getElementById('ot-retry-btn').onclick = function() { 
      hideModal(false); 
      if (onRetry) onRetry(); 
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_Modals = {
    create: createModal,
    show: showModal,
    hide: hideModal,
    showNotOnContactAlert: showNotOnContactAlert,
    showSectionInstructionModal: showSectionInstructionModal,
    showConfirmationModal: showConfirmationModal,
    showValidationErrorModal: showValidationErrorModal,
    showSuccessModal: showSuccessModal,
    showCoachLocationModal: showCoachLocationModal,
    showNetworkErrorModal: showNetworkErrorModal
  };

  log('✅ ot-modals.js v3 loaded');

})();
