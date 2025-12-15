/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Submit Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * *** VERSION 4 ***
 * UPDATES FROM V3:
 * - Added "Lead Came From" field to validation, animation, and payload
 * 
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - Stronger double-click prevention (locks immediately on button click)
 * - Improved locationId extraction (multiple fallback methods)
 * - Better navigation detection during SAM animation
 * - Added submission timeout failsafe (auto-unlock after 60 seconds)
 * - Respects OT_DEBUG flag for logging
 * 
 * *** VERSION 2 ***
 * UPDATES:
 * - Fixed duplicate SAM overlay bug (now checks before creating)
 * - Added fallback alerts when OT_Modals is not available
 * - Added XSS protection on streetAddress in coach modal
 * - Fixed double-click protection (flag set earlier in flow)
 * - Added cleanup on page navigation during submission
 * 
 * FILE: ot-submit.js
 * PURPOSE: Deal Token submission flow - SAM reading, validation, webhook, coach blocking
 * EDIT THIS WHEN: Changing submission logic, validation rules, coach location, webhook URL
 * 
 * CONFIGURATION:
 * - Line 45: Webhook URL (Make.com)
 * - Line 46: Coach Location ID (blocked from submissions)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_SUBMIT_LOADED) return;
  window.OT_SUBMIT_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var WEBHOOK_URL = 'https://delicate-voice-d54e.ahmed-d77.workers.dev';
  var COACH_LOCATION_ID = '7Ab8lel9dfY7xJBnMOrF';
  var SUBMISSION_TIMEOUT_MS = 60000; // V3: 60 second failsafe timeout

  // Track submission state globally
  window.OT_IS_SUBMITTING = false;
  var submissionTimeoutId = null; // V3: Track timeout for cleanup

  // V3: Logging helper
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

  // V3: Improved locationId extraction with multiple fallback methods
  function getLocationId() {
    // Method 1: Standard URL path pattern
    var match = window.location.pathname.match(/\/location\/([a-zA-Z0-9]+)/);
    if (match) {
      log('LocationId found via URL path: ' + match[1]);
      return match[1];
    }
    
    // Method 2: Check for location in query params
    var urlParams = new URLSearchParams(window.location.search);
    var locationParam = urlParams.get('location') || urlParams.get('locationId');
    if (locationParam) {
      log('LocationId found via query param: ' + locationParam);
      return locationParam;
    }
    
    // Method 3: Check for GHL's global location object
    if (window.hl && window.hl.location && window.hl.location.id) {
      log('LocationId found via window.hl: ' + window.hl.location.id);
      return window.hl.location.id;
    }
    
    // Method 4: Check localStorage for cached location
    try {
      var cachedLocation = localStorage.getItem('hl_location_id');
      if (cachedLocation) {
        log('LocationId found via localStorage: ' + cachedLocation);
        return cachedLocation;
      }
    } catch (e) {
      // localStorage may be blocked
    }
    
    // Method 5: Look for location in page content (meta tags, data attributes)
    var metaLocation = document.querySelector('meta[name="location-id"]');
    if (metaLocation && metaLocation.content) {
      log('LocationId found via meta tag: ' + metaLocation.content);
      return metaLocation.content;
    }
    
    log('LocationId not found via any method');
    return null;
  }

  function getFieldValue(selector) {
    var el = document.querySelector(selector);
    if (!el) return '';
    var val = el.value || '';
    return val.replace(/[<>]/g, '').trim();
  }

  // V4: Helper for getting select dropdown text (for dropdowns that use button display)
  function getSelectDisplayValue(selector) {
    // First try the standard select value
    var val = getFieldValue(selector);
    if (val) return val;
    
    // For GHL bootstrap-select dropdowns, look for the displayed text
    var container = document.querySelector(selector);
    if (container) {
      var displayBtn = container.closest('.bootstrap-select');
      if (displayBtn) {
        var btnText = displayBtn.querySelector('.filter-option-inner-inner');
        if (btnText) {
          return btnText.textContent.trim();
        }
      }
    }
    return '';
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function checkSectionStatus() {
    var contactField = document.querySelector('input[name="contact.first_name"]');
    var contactOpen = false;
    if (contactField) {
      var rect = contactField.getBoundingClientRect();
      contactOpen = rect.height > 0 && rect.width > 0;
    }
    
    var propertyField = document.querySelector('input[name="contact.number_of_bedrooms"]');
    var propertyOpen = false;
    if (propertyField) {
      var rect = propertyField.getBoundingClientRect();
      propertyOpen = rect.height > 0 && rect.width > 0;
    }
    
    return {
      contactOpen: contactOpen,
      propertyOpen: propertyOpen,
      allOpen: contactOpen && propertyOpen
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FALLBACK ALERT SYSTEM
  // ═══════════════════════════════════════════════════════════════════════

  function showFallbackAlert(message) {
    alert(message);
  }

  function showFallbackConfirm(message, onConfirm, onCancel) {
    if (confirm(message)) {
      if (onConfirm) onConfirm();
    } else {
      if (onCancel) onCancel();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // V3: SUBMISSION STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  function lockSubmission() {
    window.OT_IS_SUBMITTING = true;
    
    // V3: Failsafe timeout - auto-unlock after 60 seconds
    // This prevents permanent lock if something goes wrong
    if (submissionTimeoutId) {
      clearTimeout(submissionTimeoutId);
    }
    submissionTimeoutId = setTimeout(function() {
      if (window.OT_IS_SUBMITTING) {
        log('⚠️ Submission timeout failsafe triggered - unlocking');
        unlockSubmission();
        removeSAMOverlay();
      }
    }, SUBMISSION_TIMEOUT_MS);
  }

  function unlockSubmission() {
    window.OT_IS_SUBMITTING = false;
    if (submissionTimeoutId) {
      clearTimeout(submissionTimeoutId);
      submissionTimeoutId = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SAM READING OVERLAY
  // ═══════════════════════════════════════════════════════════════════════

  function createSAMOverlay() {
    var existing = document.getElementById('ot-sam-overlay');
    if (existing) {
      existing.remove();
    }
    
    var overlay = document.createElement('div');
    overlay.id = 'ot-sam-overlay';
    overlay.className = 'ot-sam-overlay';
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">🤖</div>' +
          '<div class="ot-sam-title">SAM is reading your deal...</div>' +
          '<div class="ot-sam-subtitle">Hang tight! I\'m grabbing all the details</div>' +
        '</div>' +
        '<div class="ot-sam-fields" id="ot-sam-fields"></div>' +
        '<div class="ot-sam-progress">' +
          '<div class="ot-sam-progress-fill" id="ot-sam-progress-fill"></div>' +
        '</div>' +
        '<div class="ot-sam-progress-text" id="ot-sam-progress-text">0% done</div>' +
      '</div>';
    
    document.body.appendChild(overlay);
  }

  function removeSAMOverlay() {
    var overlay = document.getElementById('ot-sam-overlay');
    if (overlay) overlay.remove();
  }

  function updateSAMField(fieldName, status, value) {
    var container = document.getElementById('ot-sam-fields');
    if (!container) return;
    
    var fieldId = 'sam-field-' + fieldName.replace(/\s+/g, '-').toLowerCase();
    var fieldDiv = document.getElementById(fieldId);
    
    if (!fieldDiv) {
      fieldDiv = document.createElement('div');
      fieldDiv.id = fieldId;
      fieldDiv.className = 'ot-sam-field ot-sam-field-waiting';
      container.appendChild(fieldDiv);
    }
    
    var icon = '⏳';
    var statusClass = 'ot-sam-field-waiting';
    
    if (status === 'reading') {
      icon = '🔄';
      statusClass = 'ot-sam-field-reading';
    } else if (status === 'done') {
      icon = '✅';
      statusClass = 'ot-sam-field-done';
    }
    
    fieldDiv.className = 'ot-sam-field ' + statusClass;
    
    var displayValue = value && value.length > 25 ? value.substring(0, 22) + '...' : value;
    var valueDisplay = displayValue ? ' → ' + escapeHtml(displayValue) : '';
    
    fieldDiv.innerHTML = 
      '<span class="ot-sam-field-icon">' + icon + '</span>' +
      '<span class="ot-sam-field-name">' + escapeHtml(fieldName) + valueDisplay + '</span>';
  }

  function updateSAMProgress(current, total) {
    var percent = Math.round((current / total) * 100);
    var fill = document.getElementById('ot-sam-progress-fill');
    var text = document.getElementById('ot-sam-progress-text');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = percent + '% done';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FIELD COLLECTION
  // ═══════════════════════════════════════════════════════════════════════

  function getDealFields() {
    return {
      sellerFirstName: getFieldValue('input[name="contact.first_name"]'),
      sellerLastName: getFieldValue('input[name="contact.last_name"]'),
      sellerPhone: getFieldValue('input[name="contact.phone"]'),
      streetAddress: getFieldValue('input[name="contact.address1"]'),
      city: getFieldValue('input[name="contact.city"]'),
      state: getFieldValue('input[name="contact.state"]'),
      postalCode: getFieldValue('input[name="contact.postal_code"]'),
      bedrooms: getFieldValue('input[name="contact.number_of_bedrooms"]'),
      bathrooms: getFieldValue('input[name="contact.number_of_bathrooms"]'),
      sqft: getFieldValue('input[name="contact.square_footage"]'),
      askingPrice: getFieldValue('input[placeholder="Asking Price"]'),
      repairCost: getFieldValue('input[placeholder="Repairs cost will be about...."]'),
      arv: getFieldValue('input[placeholder="After Repair Value (ARV)"]'),
      willSellOnTerms: getFieldValue('select[name="contact.will_they_sell_on_termz"]'),
      mortgageBalance: getFieldValue('input[placeholder="Current mortgage balance?"]'),
      monthlyPayment: getFieldValue('input[placeholder="Monthly payment to the bank? (PITI)"]'),
      potentialRent: getFieldValue('input[placeholder="potential monthly lease option amount"]'),
      propertyCondition: getFieldValue('textarea[name="contact.property_condition"]'),
      zillowLink: getFieldValue('input[name="contact.link_to_zillow"]'),
      // V4: New field
      leadCameFrom: getFieldValue('select[name="contact.the_lead_came_from"]')
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════

  function validateDealSubmission(fields) {
    var errors = [];
    
    var sellerMissing = [];
    if (!fields.sellerFirstName) sellerMissing.push('First Name');
    if (!fields.sellerLastName) sellerMissing.push('Last Name');
    if (!fields.sellerPhone) sellerMissing.push('Phone Number');
    if (sellerMissing.length > 0) {
      errors.push('📋 <strong>Seller Info:</strong> ' + sellerMissing.join(', '));
    }
    
    var addressMissing = [];
    if (!fields.streetAddress) addressMissing.push('Street Address');
    if (!fields.city) addressMissing.push('City');
    if (!fields.state) addressMissing.push('State');
    if (!fields.postalCode) addressMissing.push('Zip Code');
    if (addressMissing.length > 0) {
      errors.push('🏠 <strong>Property Address:</strong> ' + addressMissing.join(', '));
    }
    
    var propertyMissing = [];
    if (!fields.askingPrice) propertyMissing.push('Asking Price');
    if (!fields.arv) propertyMissing.push('ARV (After Repair Value)');
    if (!fields.bedrooms) propertyMissing.push('Bedrooms');
    if (!fields.bathrooms) propertyMissing.push('Bathrooms');
    if (!fields.sqft) propertyMissing.push('Square Footage');
    if (propertyMissing.length > 0) {
      errors.push('🔢 <strong>Property Details:</strong> ' + propertyMissing.join(', '));
    }
    
    var dealMissing = [];
    if (!fields.willSellOnTerms) dealMissing.push('Will They Sell on Terms?');
    if (!fields.propertyCondition) dealMissing.push('Property Condition');
    // V4: Add lead source validation
    if (!fields.leadCameFrom) dealMissing.push('Lead Came From');
    if (dealMissing.length > 0) {
      errors.push('💼 <strong>Deal Terms:</strong> ' + dealMissing.join(', '));
    }
    
    if (fields.propertyCondition && fields.propertyCondition.length > 50) {
      errors.push('✂️ Property Condition is too long (' + fields.propertyCondition.length + ' chars) - keep it under 50');
    }
    
    return errors;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // WEBHOOK SUBMISSION WITH RETRY
  // ═══════════════════════════════════════════════════════════════════════

  function submitDealWithRetry(payload, attempt, maxAttempts, onSuccess, onError) {
    attempt = attempt || 1;
    maxAttempts = maxAttempts || 3;
    
    // V3: Check if submission was cancelled before each attempt
    if (!window.OT_IS_SUBMITTING) {
      log('Submission cancelled before attempt ' + attempt);
      return;
    }
    
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 10000);
    
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    .then(function(response) {
      clearTimeout(timeoutId);
      if (response.ok) {
        onSuccess();
      } else {
        throw new Error('HTTP ' + response.status);
      }
    })
    .catch(function(error) {
      clearTimeout(timeoutId);
      log('Submission attempt ' + attempt + ' failed: ' + error.message);
      
      // V3: Check if still submitting before retry
      if (!window.OT_IS_SUBMITTING) {
        log('Submission cancelled - not retrying');
        return;
      }
      
      if (attempt < maxAttempts) {
        var delay = Math.pow(2, attempt) * 1000;
        setTimeout(function() {
          submitDealWithRetry(payload, attempt + 1, maxAttempts, onSuccess, onError);
        }, delay);
      } else {
        onError(error);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ANIMATED FIELD READING SEQUENCE
  // ═══════════════════════════════════════════════════════════════════════

  function startSAMReading(locationId) {
var fieldsToRead = [
      { name: 'First Name', selector: 'input[name="contact.first_name"]' },
      { name: 'Last Name', selector: 'input[name="contact.last_name"]' },
      { name: 'Phone', selector: 'input[name="contact.phone"]' },
      { name: 'Street Address', selector: 'input[name="contact.address1"]' },
      { name: 'City', selector: 'input[name="contact.city"]' },
      { name: 'State', selector: 'input[name="contact.state"]' },
      { name: 'Zip Code', selector: 'input[name="contact.postal_code"]' },
      { name: 'Bedrooms', selector: 'input[name="contact.number_of_bedrooms"]' },
      { name: 'Bathrooms', selector: 'input[name="contact.number_of_bathrooms"]' },
      { name: 'Square Feet', selector: 'input[name="contact.square_footage"]' },
      { name: 'Asking Price', selector: 'input[placeholder="Asking Price"]' },
      { name: 'Repair Cost', selector: 'input[placeholder="Repairs cost will be about...."]' },
      { name: 'ARV', selector: 'input[placeholder="After Repair Value (ARV)"]' },
      { name: 'Sell on Terms?', selector: 'select[name="contact.will_they_sell_on_termz"]' },
      { name: 'Mortgage Balance', selector: 'input[placeholder="Current mortgage balance?"]' },
      { name: 'Monthly Payment', selector: 'input[placeholder="Monthly payment to the bank? (PITI)"]' },
      { name: 'Potential Rent', selector: 'input[placeholder="potential monthly lease option amount"]' },
      { name: 'Condition', selector: 'textarea[name="contact.property_condition"]' },
      { name: 'Zillow Link', selector: 'input[name="contact.link_to_zillow"]' },
      // V4: New field
      { name: 'Lead Came From', selector: 'select[name="contact.the_lead_came_from"]' }
    ];
    
    fieldsToRead.forEach(function(f) {
      updateSAMField(f.name, 'waiting', '');
    });
    
    readFieldsSequentially(fieldsToRead, 0, locationId);
  }

  function readFieldsSequentially(fields, index, locationId) {
    // V3: Enhanced cancellation check
    if (!window.OT_IS_SUBMITTING || !document.getElementById('ot-sam-overlay')) {
      log('Submission cancelled during field reading');
      removeSAMOverlay();
      unlockSubmission();
      return;
    }
    
    if (index >= fields.length) {
      finalizeSAMSubmission(locationId);
      return;
    }
    
    var field = fields[index];
    updateSAMField(field.name, 'reading', '');
    updateSAMProgress(index, fields.length);
    
    var element = document.querySelector(field.selector);
    
    setTimeout(function() {
      if (!window.OT_IS_SUBMITTING) {
        removeSAMOverlay();
        unlockSubmission();
        return;
      }
      
      var value = '';
      if (element) {
        value = element.value || element.textContent || '';
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
      
      updateSAMField(field.name, 'done', value);
      
      setTimeout(function() {
        readFieldsSequentially(fields, index + 1, locationId);
      }, 120);
    }, 180);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FINALIZE SUBMISSION
  // ═══════════════════════════════════════════════════════════════════════

  function finalizeSAMSubmission(locationId) {
    if (!window.OT_IS_SUBMITTING) {
      removeSAMOverlay();
      unlockSubmission();
      return;
    }
    
    updateSAMProgress(100, 100);
    
    var header = document.querySelector('.ot-sam-title');
    var subtitle = document.querySelector('.ot-sam-subtitle');
    if (header) header.textContent = 'Checking everything...';
    if (subtitle) subtitle.textContent = 'Making sure nothing is missing';
    
    setTimeout(function() {
      if (!window.OT_IS_SUBMITTING) {
        removeSAMOverlay();
        unlockSubmission();
        return;
      }
      
      var fields = getDealFields();
      var errors = validateDealSubmission(fields);
      
      if (errors.length > 0) {
        removeSAMOverlay();
        unlockSubmission();
        if (window.OT_Modals) {
          window.OT_Modals.showValidationErrorModal(errors);
        } else {
          var plainErrors = errors.map(function(e) {
            return e.replace(/<[^>]*>/g, '');
          }).join('\n');
          showFallbackAlert('Missing required fields:\n\n' + plainErrors);
        }
        return;
      }
      
      if (header) header.textContent = 'Sending to coaches...';
      if (subtitle) subtitle.textContent = 'Almost done!';
      
      var payload = {
        locationId: locationId,
        timestamp: new Date().toISOString(),
        seller: {
          firstName: fields.sellerFirstName,
          lastName: fields.sellerLastName,
          phone: fields.sellerPhone
        },
        property: {
          address: {
            street: fields.streetAddress,
            city: fields.city,
            state: fields.state,
            zip: fields.postalCode
          },
          details: {
            bedrooms: fields.bedrooms,
            bathrooms: fields.bathrooms,
            sqft: fields.sqft,
            condition: fields.propertyCondition
          },
          financials: {
            askingPrice: fields.askingPrice,
            repairCost: fields.repairCost,
            arv: fields.arv,
            mortgageBalance: fields.mortgageBalance,
            monthlyPayment: fields.monthlyPayment,
            potentialRent: fields.potentialRent
          },
          zillowLink: fields.zillowLink
        },
        dealTerms: {
          willSellOnTerms: fields.willSellOnTerms,
          hasDebt: fields.mortgageBalance && parseFloat(fields.mortgageBalance.replace(/[^0-9.]/g, '')) > 0
        },
        // V4: New field in payload
        leadSource: fields.leadCameFrom
      };
      
      // Coach location check
      if (locationId === COACH_LOCATION_ID) {
        removeSAMOverlay();
        unlockSubmission();
        var streetAddress = escapeHtml(payload.property.address.street) || 'this property';
        if (window.OT_Modals) {
          window.OT_Modals.showCoachLocationModal(streetAddress);
        } else {
          showFallbackAlert('Hey Coach! You\'re already in the Truka Deal Token CRM. If we submit this deal, you\'ll just get it right back. Good luck with ' + streetAddress + '!');
        }
        return;
      }
      
      // Send to webhook
      submitDealWithRetry(
        payload,
        1,
        3,
        function() {
          removeSAMOverlay();
          unlockSubmission();
          if (window.OT_Modals) {
            window.OT_Modals.showSuccessModal();
          } else {
            showFallbackAlert('Woohoo! Deal Sent! 🎉\n\nYour deal is on its way to the coaches. Check your email for updates!');
          }
        },
        function(error) {
          removeSAMOverlay();
          unlockSubmission();
          if (window.OT_Modals) {
            window.OT_Modals.showNetworkErrorModal(
              'I couldn\'t connect to the server. Check your internet and try again.',
              function() { window.otSubmitDealToken(); }
            );
          } else {
            showFallbackAlert('Something went wrong connecting to the server. Please check your internet and try again.');
          }
        }
      );
    }, 800);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN SUBMISSION FUNCTION (V3: Immediate lock on click)
  // ═══════════════════════════════════════════════════════════════════════

  window.otSubmitDealToken = function() {
    // V3: Immediate lock to prevent ANY double-click
    if (window.OT_IS_SUBMITTING) {
      log('Submission already in progress - ignoring click');
      return;
    }
    
    // Check if on contact page BEFORE locking
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Submit Deal Token');
      } else {
        showFallbackAlert('Please open a contact record first to use Submit Deal Token.');
      }
      return;
    }
    
    // Check sections BEFORE locking
    var sectionStatus = checkSectionStatus();
    if (!sectionStatus.allOpen) {
      if (window.OT_Modals) {
        window.OT_Modals.showSectionInstructionModal(
          sectionStatus, 
          function() { window.otSubmitDealToken(); }, 
          null
        );
      } else {
        var tabsNeeded = [];
        if (!sectionStatus.contactOpen) tabsNeeded.push('Contact');
        if (!sectionStatus.propertyOpen) tabsNeeded.push('Property Information Sheet');
        showFallbackAlert('Please expand these tabs first: ' + tabsNeeded.join(' and ') + '\n\nThen click Submit Deal Token again.');
      }
      return;
    }
    
    // V3: Lock IMMEDIATELY when showing confirmation
    // This prevents double-click on the confirmation button too
    lockSubmission();
    
    // Show confirmation modal
    if (window.OT_Modals) {
      window.OT_Modals.showConfirmationModal(
        function() {
          // User confirmed - proceed with submission
          var locationId = getLocationId();
          if (!locationId) {
            unlockSubmission();
            window.OT_Modals.showNetworkErrorModal(
              'I couldn\'t figure out your account. Try refreshing the page.', 
              null
            );
            return;
          }
          
          createSAMOverlay();
          setTimeout(function() {
            startSAMReading(locationId);
          }, 400);
        }, 
        function() {
          // User cancelled
          unlockSubmission();
        }
      );
    } else {
      // Fallback confirm
      showFallbackConfirm(
        'Use a Deal Token?\n\nThis will send your deal to the coaches for review.\n\nIt costs 1 token and can\'t be undone.',
        function() {
          var locationId = getLocationId();
          if (!locationId) {
            unlockSubmission();
            showFallbackAlert('Couldn\'t figure out your account. Try refreshing the page.');
            return;
          }
          createSAMOverlay();
          setTimeout(function() {
            startSAMReading(locationId);
          }, 400);
        },
        function() {
          unlockSubmission();
        }
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // V3: ENHANCED CLEANUP ON NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════

  // Handle page unload
  window.addEventListener('beforeunload', function() {
    if (window.OT_IS_SUBMITTING) {
      unlockSubmission();
      removeSAMOverlay();
    }
  });

  // Handle SPA navigation (GHL uses client-side routing)
  var lastPathname = window.location.pathname;
  var lastContactId = window.location.pathname.match(/\/contacts\/detail\/([^\/]+)/);
  lastContactId = lastContactId ? lastContactId[1] : null;

  setInterval(function() {
    var currentPath = window.location.pathname;
    var currentContactMatch = currentPath.match(/\/contacts\/detail\/([^\/]+)/);
    var currentContactId = currentContactMatch ? currentContactMatch[1] : null;
    
    // V3: Cancel if navigated away OR switched to different contact
    if (window.OT_IS_SUBMITTING) {
      if (currentPath !== lastPathname || currentContactId !== lastContactId) {
        log('Navigation detected during submission - cancelling');
        unlockSubmission();
        removeSAMOverlay();
      }
    }
    
    lastPathname = currentPath;
    lastContactId = currentContactId;
  }, 250); // V3: Check more frequently (250ms vs 500ms)

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_Submit = {
    submit: window.otSubmitDealToken,
    getDealFields: getDealFields,
    validateDealSubmission: validateDealSubmission,
    cancelSubmission: unlockSubmission  // V3: Expose for manual cancellation
  };

  log('✅ ot-submit.js v4 loaded');

})();
