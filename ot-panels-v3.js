/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Panels Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - Added XSS protection (escapeHtml) for all displayed address values
 * - Added Escape key handler to close comps overlay
 * - Consistent debug logging (uses log() helper)
 * - Comps overlay escape handler properly cleaned up
 * 
 * *** VERSION 2 ***
 * UPDATES:
 * - Fixed script panel toggle: now switches to new dealType instead of just closing
 * - Fixed ZIP code validation: now accepts ZIP+4 format (12345-6789)
 * - Added fallback alerts when OT_Modals not available
 * - Button text now properly resets on panel close via X button
 * 
 * FILE: ot-panels.js
 * PURPOSE: Slide-out panels for Calculator, Script, and Comps
 * EDIT THIS WHEN: Changing panel behavior, URLs, iframe stuff, Zillow logic
 * 
 * PANELS INCLUDED:
 * - Deal Analyzer (Calculator) - Left slide panel
 * - Show Script - Right slide panel
 * - Get Comps - Zillow lookup with address validation
 * 
 * CONFIGURATION:
 * - Line 48: Google Doc URL for sales scripts
 * - Line 49: Calculator URL
 * - Line 52-57: Script tab anchors for different deal types
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_PANELS_LOADED) return;
  window.OT_PANELS_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var SCRIPT_DOC_BASE_URL = 'https://docs.google.com/document/d/1AP1yqYxljROHvQLNYVTFnSdUrACG3bWCEcCsmiEShQQ/preview';
  var CALCULATOR_URL = 'https://offertermz.com/calculator';

  // Script tab anchors for different deal types
  var SCRIPT_TABS = {
    'subject-to': 't.u6vs1q5zzo82',
    'wrap': 't.64jigev0vd1x',
    'wholesale': 't.9ippe7s8o1z6',
    'seller-financing': 't.g5glmqw372ao'
  };

  // US States for address validation
  var US_STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  };

  // Track current script deal type for smart toggle
  var currentScriptDealType = null;
  
  // V3: Track comps escape handler for cleanup
  var compsEscHandler = null;

  // ═══════════════════════════════════════════════════════════════════════
  // V3: DEBUG LOGGING
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

  function getFieldValue(selector) {
    var el = document.querySelector(selector);
    if (!el) return '';
    var val = el.value || '';
    return val.replace(/[<>]/g, '').trim();
  }

  // V3: XSS protection helper
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Fallback alert helper
  function showFallbackAlert(message) {
    alert(message);
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

  function isValidState(state) {
    if (!state) return false;
    var upper = state.toUpperCase();
    return US_STATES[upper] || Object.values(US_STATES).some(function(s) { 
      return s.toUpperCase() === upper; 
    });
  }

  // Fixed ZIP validation to accept ZIP+4 format
  function isValidZipCode(zip) {
    if (!zip) return false;
    return /^\d{5}(-\d{4})?$/.test(zip.trim());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FIELD DATA COLLECTION
  // ═══════════════════════════════════════════════════════════════════════

  function collectFieldData() {
    var termsSelect = document.querySelector('select[name="contact.will_they_sell_on_termz"]');
    var termsValue = termsSelect ? termsSelect.value : '';
    var termsAvailable = termsValue.toLowerCase() === 'yes' || termsValue === 'true' || termsValue === '1';
    
    return {
      askingPrice: getFieldValue('input[placeholder="Asking Price"]'),
      arv: getFieldValue('input[placeholder="After Repair Value (ARV)"]'),
      repairs: getFieldValue('input[placeholder="Repairs cost will be about...."]'),
      mortgageBalance: getFieldValue('input[placeholder="Current mortgage balance?"]'),
      monthlyPiti: getFieldValue('input[placeholder="Monthly payment to the bank? (PITI)"]'),
      termsAvailable: termsAvailable
    };
  }

  function getPropertyAddress() {
    return {
      street: getFieldValue('input[name="contact.address1"]'),
      city: getFieldValue('input[name="contact.city"]'),
      state: getFieldValue('input[name="contact.state"]'),
      postal: getFieldValue('input[name="contact.postal_code"]')
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // URL BUILDERS
  // ═══════════════════════════════════════════════════════════════════════

  function buildCalculatorURL(fieldData) {
    var params = [];
    
    function cleanNumber(val) {
      if (!val) return '';
      return val.replace(/[^0-9.]/g, '');
    }
    
    if (fieldData.askingPrice) params.push('askingPrice=' + encodeURIComponent(cleanNumber(fieldData.askingPrice)));
    if (fieldData.arv) params.push('arv=' + encodeURIComponent(cleanNumber(fieldData.arv)));
    if (fieldData.repairs) params.push('repairs=' + encodeURIComponent(cleanNumber(fieldData.repairs)));
    if (fieldData.mortgageBalance) params.push('mortgageBalance=' + encodeURIComponent(cleanNumber(fieldData.mortgageBalance)));
    if (fieldData.monthlyPiti) params.push('monthlyPiti=' + encodeURIComponent(cleanNumber(fieldData.monthlyPiti)));
    if (fieldData.termsAvailable) params.push('termsAvailable=yes');
    
    return params.length > 0 ? CALCULATOR_URL + '?' + params.join('&') : CALCULATOR_URL;
  }

  function buildZillowURL(address) {
    var query = address.street + ', ' + address.city + ', ' + address.state + ' ' + address.postal;
    return 'https://www.zillow.com/homes/' + encodeURIComponent(query) + '_rb/';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCRIPT PANEL
  // ═══════════════════════════════════════════════════════════════════════

  function createScriptPanel(url) {
    var panel = document.getElementById('ot-script-panel');
    if (panel) {
      var iframe = panel.querySelector('.ot-panel-iframe');
      if (iframe && url && iframe.src !== url) {
        iframe.src = url;
      }
      return;
    }
    panel = document.createElement('div');
    panel.id = 'ot-script-panel';
    panel.className = 'ot-panel ot-panel-right';
    panel.innerHTML = 
      '<div class="ot-panel-header">' +
        '<span>Sales Script</span>' +
        '<button class="ot-panel-close" id="ot-script-close">✕</button>' +
      '</div>' +
      '<iframe src="' + (url || SCRIPT_DOC_BASE_URL) + '" class="ot-panel-iframe"></iframe>';
    document.body.appendChild(panel);
    document.getElementById('ot-script-close').onclick = function() {
      closeScriptPanel();
    };
  }

  function closeScriptPanel() {
    var panel = document.getElementById('ot-script-panel');
    var btn = document.getElementById('ot-script-btn');
    if (panel) {
      panel.classList.remove('ot-panel-visible');
    }
    if (btn) {
      btn.textContent = 'Show Script';
    }
    currentScriptDealType = null;
  }

  window.otToggleScriptPanel = function(dealType) {
    var panel = document.getElementById('ot-script-panel');
    var btn = document.getElementById('ot-script-btn');
    
    if (panel && panel.classList.contains('ot-panel-visible')) {
      if (!dealType || dealType === currentScriptDealType) {
        closeScriptPanel();
        return;
      } else {
        var newURL = SCRIPT_DOC_BASE_URL;
        if (SCRIPT_TABS[dealType]) {
          newURL = SCRIPT_DOC_BASE_URL + '?tab=' + SCRIPT_TABS[dealType];
        }
        var iframe = panel.querySelector('.ot-panel-iframe');
        if (iframe) {
          iframe.src = newURL;
        }
        currentScriptDealType = dealType;
        return;
      }
    }
    
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Show Script');
      } else {
        showFallbackAlert('Please open a contact record first to use Show Script.');
      }
      return;
    }
    
    var scriptURL = SCRIPT_DOC_BASE_URL;
    if (dealType && SCRIPT_TABS[dealType]) {
      scriptURL = SCRIPT_DOC_BASE_URL + '?tab=' + SCRIPT_TABS[dealType];
    }
    
    createScriptPanel(scriptURL);
    panel = document.getElementById('ot-script-panel');
    panel.classList.add('ot-panel-visible');
    if (btn) btn.textContent = 'Hide Script';
    currentScriptDealType = dealType || null;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CALCULATOR PANEL
  // ═══════════════════════════════════════════════════════════════════════

  function createCalculatorPanel(url) {
    if (document.getElementById('ot-calculator-panel')) return;
    var panel = document.createElement('div');
    panel.id = 'ot-calculator-panel';
    panel.className = 'ot-panel ot-panel-left';
    panel.innerHTML = 
      '<div class="ot-panel-header">' +
        '<span>Deal Analyzer</span>' +
        '<button class="ot-panel-close" id="ot-calculator-close">✕</button>' +
      '</div>' +
      '<iframe src="' + (url || CALCULATOR_URL) + '" class="ot-panel-iframe"></iframe>';
    document.body.appendChild(panel);
    document.getElementById('ot-calculator-close').onclick = function() {
      closeCalculatorPanel();
    };
  }

  function closeCalculatorPanel() {
    var panel = document.getElementById('ot-calculator-panel');
    var btn = document.getElementById('ot-calculator-btn');
    if (panel) {
      panel.classList.remove('ot-panel-visible');
    }
    if (btn) {
      btn.textContent = 'Deal Analyzer';
    }
  }

  window.otToggleCalculatorPanel = function() {
    var panel = document.getElementById('ot-calculator-panel');
    var btn = document.getElementById('ot-calculator-btn');
    
    if (panel && panel.classList.contains('ot-panel-visible')) {
      closeCalculatorPanel();
      return;
    }
    
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Deal Analyzer');
      } else {
        showFallbackAlert('Please open a contact record first to use Deal Analyzer.');
      }
      return;
    }
    
    var sectionStatus = checkSectionStatus();
    if (!sectionStatus.contactOpen) {
      if (window.OT_Modals) {
        window.OT_Modals.showSectionInstructionModal(
          { contactOpen: false, propertyOpen: true, allOpen: false }, 
          function() { window.otToggleCalculatorPanel(); }, 
          null, 
          'Deal Analyzer'
        );
      } else {
        showFallbackAlert('Please expand the "Contact" tab first, then click Deal Analyzer again.');
      }
      return;
    }
    
    var fieldData = collectFieldData();
    var calcURL = buildCalculatorURL(fieldData);
    
    createCalculatorPanel(calcURL);
    panel = document.getElementById('ot-calculator-panel');
    panel.classList.add('ot-panel-visible');
    if (btn) btn.textContent = 'Hide Analyzer';
  };

  // ═══════════════════════════════════════════════════════════════════════
  // COMPS PANEL (V3: Added escape key, XSS protection)
  // ═══════════════════════════════════════════════════════════════════════

  // V3: Function to remove comps overlay with proper cleanup
  function removeCompsOverlay() {
    var overlay = document.getElementById('ot-comps-overlay');
    if (overlay) overlay.remove();
    
    if (compsEscHandler) {
      document.removeEventListener('keydown', compsEscHandler);
      compsEscHandler = null;
    }
  }

  function createCompsOverlay() {
    var existing = document.getElementById('ot-comps-overlay');
    if (existing) existing.remove();
    
    var overlay = document.createElement('div');
    overlay.id = 'ot-comps-overlay';
    overlay.className = 'ot-sam-overlay';
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">🤖</div>' +
          '<div class="ot-sam-title">SAM is checking the address...</div>' +
          '<div class="ot-sam-subtitle">Making sure we have what we need for Zillow</div>' +
        '</div>' +
        '<div class="ot-sam-fields" id="ot-comps-fields"></div>' +
        '<div class="ot-sam-progress">' +
          '<div class="ot-sam-progress-fill" id="ot-comps-progress-fill"></div>' +
        '</div>' +
        '<div class="ot-sam-progress-text" id="ot-comps-progress-text">0% done</div>' +
      '</div>';
    
    document.body.appendChild(overlay);
    
    // V3: Add escape key handler
    if (compsEscHandler) {
      document.removeEventListener('keydown', compsEscHandler);
    }
    compsEscHandler = function(e) {
      if (e.key === 'Escape') {
        removeCompsOverlay();
      }
    };
    document.addEventListener('keydown', compsEscHandler);
  }

  function updateCompsProgress(percent) {
    var fill = document.getElementById('ot-comps-progress-fill');
    var text = document.getElementById('ot-comps-progress-text');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = percent + '% done';
  }

  // V3: XSS-safe field display using DOM methods
  function addCompsField(fieldName, status, value) {
    var container = document.getElementById('ot-comps-fields');
    if (!container) return null;
    
    var fieldDiv = document.createElement('div');
    fieldDiv.className = 'ot-sam-field ot-sam-field-waiting';
    container.appendChild(fieldDiv);
    
    var icon = '⏳';
    var statusClass = 'ot-sam-field-waiting';
    
    if (status === 'reading') {
      icon = '📖';
      statusClass = 'ot-sam-field-reading';
    } else if (status === 'done') {
      icon = '✅';
      statusClass = 'ot-sam-field-done';
    } else if (status === 'error') {
      icon = '❌';
      statusClass = 'ot-sam-field-done';
    }
    
    fieldDiv.className = 'ot-sam-field ' + statusClass;
    
    // V3: Build content safely using DOM methods (XSS protection)
    var iconSpan = document.createElement('span');
    iconSpan.className = 'ot-sam-field-icon';
    iconSpan.textContent = icon;
    
    var nameSpan = document.createElement('span');
    nameSpan.className = 'ot-sam-field-name';
    nameSpan.textContent = fieldName;
    
    if (status === 'done' && value) {
      var valueSpan = document.createElement('span');
      valueSpan.style.color = '#059669';
      valueSpan.textContent = ' → ' + value;
      nameSpan.appendChild(valueSpan);
    } else if (status === 'error') {
      var errorSpan = document.createElement('span');
      errorSpan.style.color = '#dc2626';
      errorSpan.textContent = ' → Missing';
      nameSpan.appendChild(errorSpan);
    }
    
    fieldDiv.appendChild(iconSpan);
    fieldDiv.appendChild(nameSpan);
    
    return fieldDiv;
  }

  // V3: Update field display safely
  function updateCompsField(fieldDiv, fieldName, status, value) {
    if (!fieldDiv) return;
    
    var icon = '✅';
    var statusClass = 'ot-sam-field-done';
    
    if (status === 'error') {
      icon = '❌';
    }
    
    fieldDiv.className = 'ot-sam-field ' + statusClass;
    fieldDiv.innerHTML = ''; // Clear existing
    
    var iconSpan = document.createElement('span');
    iconSpan.className = 'ot-sam-field-icon';
    iconSpan.textContent = icon;
    
    var nameSpan = document.createElement('span');
    nameSpan.className = 'ot-sam-field-name';
    nameSpan.textContent = fieldName;
    
    if (status === 'done' && value) {
      var valueSpan = document.createElement('span');
      valueSpan.style.color = '#059669';
      valueSpan.textContent = ' → ' + value;
      nameSpan.appendChild(valueSpan);
    } else if (status === 'error') {
      var errorSpan = document.createElement('span');
      errorSpan.style.color = '#dc2626';
      errorSpan.textContent = ' → Missing';
      nameSpan.appendChild(errorSpan);
    }
    
    fieldDiv.appendChild(iconSpan);
    fieldDiv.appendChild(nameSpan);
  }

  function showCompsErrorResult(errors, address) {
    var overlay = document.getElementById('ot-comps-overlay');
    if (!overlay) return;
    
    // V3: Build error list safely
    var errorListItems = errors.map(function(e) {
      return '• ' + escapeHtml(e);
    }).join('<br>');
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">😕</div>' +
          '<div class="ot-sam-title" style="color: #dc2626;">Missing Address Info</div>' +
          '<div class="ot-sam-subtitle">I need these fields to find comps:</div>' +
        '</div>' +
        '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 30px; text-align: left; color: #991b1b; font-size: 15px; line-height: 2;">' +
          errorListItems +
        '</div>' +
        '<div style="padding: 0 30px 30px;">' +
          '<button id="ot-comps-error-btn" style="background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%); color: white; border: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(249,96,58,0.3);">Got It</button>' +
        '</div>' +
      '</div>';
    
    document.getElementById('ot-comps-error-btn').onclick = removeCompsOverlay;
  }

  function showCompsSuccessResult(address) {
    var overlay = document.getElementById('ot-comps-overlay');
    if (!overlay) return;
    
    var zillowURL = buildZillowURL(address);
    // V3: Escape address parts for safe display
    var fullAddress = [
      escapeHtml(address.street), 
      escapeHtml(address.city), 
      escapeHtml(address.state), 
      escapeHtml(address.postal)
    ].filter(Boolean).join(', ');
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">🎯</div>' +
          '<div class="ot-sam-title" style="color: #059669;">Address Verified!</div>' +
          '<div class="ot-sam-subtitle">' + fullAddress + '</div>' +
        '</div>' +
        '<div style="padding: 20px 30px 30px; text-align: center;">' +
          '<a id="ot-comps-zillow-link" href="' + zillowURL + '" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(249,96,58,0.3);">Open Zillow Comps →</a>' +
          '<div style="margin-top: 16px;">' +
            '<button id="ot-comps-cancel-btn" style="background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer;">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    document.getElementById('ot-comps-zillow-link').onclick = function() {
      setTimeout(removeCompsOverlay, 100);
    };
    document.getElementById('ot-comps-cancel-btn').onclick = removeCompsOverlay;
  }

  function startCompsReading() {
    var address = getPropertyAddress();
    
    var fields = [
      { name: 'Street Address', value: address.street },
      { name: 'City', value: address.city },
      { name: 'State', value: address.state, validate: isValidState },
      { name: 'Zip Code', value: address.postal, validate: isValidZipCode }
    ];
    
    var errors = [];
    var currentIndex = 0;
    var totalFields = fields.length;
    var fieldDivs = [];
    
    function processNextField() {
      if (currentIndex >= totalFields) {
        updateCompsProgress(100);
        setTimeout(function() {
          if (errors.length > 0) {
            showCompsErrorResult(errors, address);
          } else {
            showCompsSuccessResult(address);
          }
        }, 600);
        return;
      }
      
      var field = fields[currentIndex];
      var fieldDiv = addCompsField(field.name, 'reading', null);
      fieldDivs.push({ div: fieldDiv, field: field });
      
      setTimeout(function() {
        var isValid = !!field.value;
        
        if (field.validate && field.value && !field.validate(field.value)) {
          isValid = false;
        }
        
        if (isValid) {
          updateCompsField(fieldDiv, field.name, 'done', field.value);
        } else {
          updateCompsField(fieldDiv, field.name, 'error', null);
          errors.push(field.name);
        }
        
        currentIndex++;
        var progress = Math.round((currentIndex / totalFields) * 83);
        updateCompsProgress(progress);
        
        setTimeout(processNextField, 400);
      }, 600);
    }
    
    processNextField();
  }

  window.otToggleCompsPanel = function() {
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Get Comps');
      } else {
        showFallbackAlert('Please open a contact record first to use Get Comps.');
      }
      return;
    }
    
    var sectionStatus = checkSectionStatus();
    if (!sectionStatus.propertyOpen) {
      if (window.OT_Modals) {
        window.OT_Modals.showSectionInstructionModal(
          { contactOpen: true, propertyOpen: false, allOpen: false }, 
          function() { window.otToggleCompsPanel(); }, 
          null, 
          'Get Comps'
        );
      } else {
        showFallbackAlert('Please expand the "Property Information Sheet" tab first, then click Get Comps again.');
      }
      return;
    }
    
    createCompsOverlay();
    setTimeout(function() {
      startCompsReading();
    }, 400);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LISTEN FOR MESSAGES FROM CALCULATOR IFRAME
  // ═══════════════════════════════════════════════════════════════════════

  window.addEventListener('message', function(event) {
    if (event.origin !== 'https://offertermz.com') return;
    if (event.data && event.data.action === 'openScript') {
      window.otToggleScriptPanel(event.data.dealType);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_Panels = {
    toggleCalculator: window.otToggleCalculatorPanel,
    toggleScript: window.otToggleScriptPanel,
    toggleComps: window.otToggleCompsPanel,
    collectFieldData: collectFieldData,
    getPropertyAddress: getPropertyAddress,
    closeCalculator: closeCalculatorPanel,
    closeScript: closeScriptPanel,
    closeComps: removeCompsOverlay  // V3: Expose comps close
  };

  log('✅ ot-panels.js v3 loaded');

})();