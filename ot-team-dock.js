/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz SMRT Team Dock Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * *** VERSION 16 *** — HEADING BACK TO THE OFFICE
 * UPDATES FROM V15:
 * - Themed working states: turning Sam on from off-duty shows
 *   "Heading back to the office… be there in a second" while the
 *   off-duty portrait CROSSFADES into professional Sam (.6s). Off =
 *   "Clocking Sam out…", standby off-notify = "Updating the plan…".
 *
 * *** VERSION 15 *** — TRUE TWINS
 * UPDATES FROM V14 (product-owner override — consistency beats fitted):
 * - Sam's popup now matches Mia's popup EXACTLY: min(650px,96vw) x
 *   min(900px,92vh), and inherits her layout skeleton — portrait at
 *   Mia scale (clamp 230-330px), content center, CTA anchored to the
 *   bottom with breathing room. Two members, one silhouette.
 *
 * *** VERSION 14 *** — THE WARDROBE GETS A VOICE
 * UPDATES FROM V13:
 * - Five off-duty Sams live in the pool (casual, fishing, grilling, golf,
 *   vacation), each themed end-to-end: image + headline + flavor line +
 *   custom CTA label. The CTA always performs Turn Sam On; humor never
 *   costs clarity — the functional sentence ships in every variant.
 *
 * *** VERSION 13 *** — SAM'S OFF-DUTY WARDROBE
 * UPDATES FROM V12:
 * - IMG.samOffPool: array of off-the-clock Sam images (golf outfit, etc.).
 *   One is picked at RANDOM per popup open in the off state — stable
 *   within the session, re-rolled next open. Popup only; the dock pill
 *   always wears the professional headshot. Empty pool = base portrait.
 *
 * *** VERSION 12 *** — MATCHING CHROME
 * UPDATES FROM V11:
 * - Sam's popup now wears the same header strip as Mia's popup frame
 *   (small ringed avatar, name, role, X) — same chrome, same width, same
 *   stage; height stays content-fitted.
 * - Fixed the horizontal scrollbar at the card's bottom edge (the glow
 *   extends past the card; overflow-x now hidden).
 *
 * *** VERSION 11 *** — SAM'S POPUP JOINS THE FAMILY (Mia's design language)
 * UPDATES FROM V10:
 * - Popup rebuilt on the Mia page's stage: navy-deep gradient, orange
 *   radial glow behind a large portrait, Playfair Display headline,
 *   frosted bubble body, full-width orange CTA. Width min(650px, 96vw)
 *   matching the Mia popup; height auto (content-fitted).
 * - Copy accuracy fix: Sam ON = ARMED, not texting. "The moment {lead}
 *   texts, he's on it" — never claims a conversation that may not exist.
 * - State faces: IMG.samOn / samOff / samStandby slots with graceful
 *   fallback to the base portrait until the images are generated.
 *
 * *** VERSION 10 *** — THE DOCK NEVER LIES (cached truth across panel tabs)
 * UPDATES FROM V9:
 * - Switching the side panel to DND/Actions unmounts GHL's field folders,
 *   which made every ring go falsely gray and the lead chip vanish —
 *   terrifying for customers ("my AI died!"). V10 remembers the last
 *   successfully READ status + chip text per contact and shows the
 *   remembered truth whenever the panel is away (canary: First Name
 *   label absent). Cache is keyed by contactId — stale-but-honest for
 *   seconds, never the wrong lead, never a false off.
 * - Accepted edge (logged): a workflow changing status while the user
 *   sits on DND/Actions shows the cached value until they return or hop.
 *
 * *** VERSION 9 *** — THE PERSON AT THE KEYBOARD
 * UPDATES FROM V8:
 * - logged_in_user / logged_in_user_id / logged_in_user_email added to the
 *   Sam payload via GHL's OFFICIAL AppUtils.Utilities.getCurrentUser()
 *   (documented Custom JS wrapper; verified live in our whitelabel
 *   custom-code context). Distinct from assigned_user: "assigned to Ahmed,
 *   toggled by Amanda." Falls back to UNKNOWN if AppUtils is ever absent —
 *   the toggle never breaks over an audit column.
 *
 * *** VERSION 8 *** — AUDIT-READY PAYLOAD
 * UPDATES FROM V7 (feeds the new Airtable toggle log — P8 born early):
 * - assigned_user: owner's first name; "UNASSIGNED" when absent.
 * - timestamp: ISO 8601, Make-parseable.
 * - action: the transition, e.g. "Off to On", "Standby to Off" —
 *   where the status was and where the user took it.
 *
 * *** VERSION 7 ***
 * UPDATES FROM V6:
 * - Sam webhook payload keys renamed to match the Mia page convention the
 *   Make blueprints expect: "contactId" + "Location ID" (space, caps) +
 *   "value". One payload dialect across all pages and scenarios.
 *
 * *** VERSION 6 *** — SAM'S POPUP GETS ITS VOICE (standby two-step)
 * UPDATES FROM V5:
 * - Three-state popup copy in the product voice, lead's first name woven in.
 * - STANDBY is a two-button state with guarded paths:
 *   "Turn Sam On"  -> playful no-op ("he kinda IS on") — correct behavior,
 *                     since Sam only ever responds to inbound texts; going
 *                     fully On during standby would only end Mia's nurturing
 *                     with zero benefit.
 *   "Turn Sam Off" -> confirmation view ("who takes care of the lead?") with
 *                     Keep Sam on Standby (no change) or Turn Sam Off & notify
 *                     me — which writes "Mia Following Up & Sam Off"; the GHL
 *                     field-change workflow rewrites Mia's conclusion to
 *                     notify-me so Sam can never be ghost-tagged back in.
 * - On write failure the popup returns to the main view; nothing changes.
 *
 * *** VERSION 5 ***
 * UPDATES FROM V4:
 * - Real Sam webhook wired in (SAM_WEBHOOK placeholder replaced).
 *
 * *** VERSION 4 *** — AI TEAM STATUS (the dock becomes a status board)
 * UPDATES FROM V3:
 * - Reads the "AI Team Status" dropdown (Contact folder) on every refresh.
 *   GHL renders dropdowns as custom widgets: the value is TEXT in
 *   .hr-base-selection-overlay__wrapper (the inner <input> is empty).
 *   Reader anchors, in order: overlay text -> [title] attr -> field id
 *   contact.ai_team_status. Unknown/empty value => everything off.
 * - Sam & Mia rings become live status: on = green dot, standby = amber
 *   dot + "Sam · standby" label, off = dimmed (still clickable).
 * - Sam click opens a built-in toggle popup (no external page): shows
 *   current state, one primary action (Turn Sam On/Off), POSTs
 *   { contact, location_id, value } to SAM_WEBHOOK. When the current
 *   value is a Mia state, a caution notes that changing Sam ends Mia's
 *   involvement.
 * - Optimistic override: after a confirmed 200 the dock trusts the new
 *   value for 90s (or until GHL re-renders), so the ring flips instantly.
 * - SAM_WEBHOOK ships as a placeholder; the popup refuses politely until
 *   the real URL is set (lesson learned from REPLACE_WITH_MIA_WEBHOOK).
 *
 * *** VERSION 3 ***
 * UPDATES FROM V2:
 * - Popup enlarged again: min(650px, 96vw) x min(900px, 92vh) so the
 *   scrollbar disappears on standard monitors (small screens still
 *   scroll gracefully - accepted trade-off).
 *
 * *** VERSION 2 ***
 * UPDATES FROM V1 (all caught in first sandbox test):
 * - FIX: portrait circles rendered giant — .ot-dock-circle spans were
 *   inline, so width/height were ignored. display:flex added (the tool
 *   circles already had it, which is why only they rendered correctly).
 * - FIX: phone read as empty — the real GHL label is "Phone (Primary)",
 *   not "Phone". Primary tried first, plain "Phone" kept as fallback.
 * - Popup enlarged: min(560px, 94vw) × min(800px, 90vh).
 * - Circles 44px → 48px.
 *
 * *** VERSION 1 ***
 *
 * FILE: ot-team-dock.js
 * PURPOSE: The navy "Team Dock" bar that replaces the three header buttons
 *          and the lead strip. Circular portraits for the SMRT AI Team
 *          (Sam, Mia active · Ruby, Tate in training) plus circular tool
 *          chips (Deal Analyzer, Get Comps, The Closer), with the lead
 *          name/address chip at the left end of the bar.
 *
 *          Clicking Mia dims the CRM and opens the central Mia page in a
 *          popup frame, animated as if her circle enlarges to life.
 *
 * EDIT THIS WHEN: Changing dock layout/labels, activating Ruby or Tate,
 *                 changing the Mia URL contract, or swapping portraits.
 *
 * DEPENDS ON: ot-autotabs.js (OT_TABS_READY + 'ot-tabs-ready' event),
 *             ot-panels.js (otToggleCalculatorPanel / otToggleCompsPanel),
 *             ot-closer.js (otOpenTheCloser).
 *
 * SELF-CONTAINED ON PURPOSE: styles, elements, popup, and updates all live
 * in this one file — removing the feature is deleting one line from the
 * loader (and restoring the old buttons + leadstrip lines).
 *
 * MIA URL CONTRACT (central page, one page for all subscribers):
 *   https://www.offertermz.com/mia
 *     ?contact=...                 contact ID (from the page URL)
 *     &location_id=...             subaccount ID (from the page URL)
 *     &first_name=...              lead's first name (First Name field)
 *     &phone=...                   lead phone, normalized to +1XXXXXXXXXX
 *     &street_name_and_suffix=...  derived from Street Address (mirrors the
 *                                  GHL workflow code exactly — house number
 *                                  and unit designators dropped; NOTE:
 *                                  directionals are kept, same as workflow)
 *     &assigned_user=...           owner's first name; UNASSIGNED when none
 *     &company=...                 subaccount company name, scraped from the
 *                                  sidebar location switcher; text inside
 *                                  parentheses when present, else full text
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_TEAMDOCK_LOADED) return;
  window.OT_TEAMDOCK_LOADED = true;

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  var DOCK_ID = 'ot-team-dock';
  var POPUP_ID = 'ot-mia-popup';
  var OVERLAY_ID = 'ot-mia-overlay';
  var REFRESH_EVERY_MS = 500;

  var MIA_URL = 'https://www.offertermz.com/mia';

  // V4: Sam toggle backend — a small Make scenario (webhook -> Airtable
  // token lookup by location_id -> GHL PUT of the AI Team Status field).
  // MUST be replaced with the real webhook URL before Sam's toggle works.
  var SAM_WEBHOOK = 'https://hook.us1.make.com/0p6jeo2v4praotvltnzpmodkfwvmba27';

  // V4: the exact customer-facing dropdown values (D17 — character-for-
  // character; the reader whitelists these and treats anything else as
  // empty = everything off).
  var STATUS = {
    SAM_ON: 'Sam On',
    SAM_OFF: 'Sam Off',
    MIA_SAM_STANDBY: 'Mia Following Up & Sam On Standby',
    MIA_SAM_OFF: 'Mia Following Up & Sam Off'
  };
  var STATUS_FIELD_LABEL = 'AI Team Status';

  var IMG = {
    sam:  'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771a32ae01952f74ab5f2.webp',
    // V11/V13: state faces for Sam's popup — swap in real URLs when generated.
    // Fallback chain: state face -> base portrait. POPUP ONLY — the dock
    // pill always wears the professional headshot.
    samOn: '',       // e.g. confident/engaged expression
    samStandby: '',  // breakroom / coffee mug
    // V13/V14: off-the-clock wardrobe — one entry picked at RANDOM per
    // popup open. Each entry themes the image, headline, flavor line, and
    // CTA label (the CTA always performs Turn Sam On). Empty = defaults.
    samOffPool: [
      { url: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a98a233a1f3f48f4ba51753.png',
        say: 'Sam\u2019s out and about.', flavor: 'Errands, sunshine, who knows.',
        cta: 'Call Sam back to the office' },
      { url: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a98a241a1f3f48f4ba5187b.png',
        say: 'Sam\u2019s gone fishing.', flavor: 'The bass are allegedly biting.',
        cta: 'Put the fish down, Sam \u2014 we\u2019ve got deals to close' },
      { url: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a98a2510ba3728cefe01fbc.png',
        say: 'Sam\u2019s manning the grill.', flavor: 'Medium-rare, as always.',
        cta: 'Turn the grill off, Sam \u2014 and bring the steaks' },
      { url: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a98a2d98a50b9d88a21e703.png',
        say: 'Sam\u2019s on the back nine.', flavor: 'He swears this is networking.',
        cta: 'Drop the putter, Sam \u2014 deals don\u2019t close themselves' },
      { url: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a98a2e78a50b9d88a21e81c.png',
        say: 'Sam\u2019s on vacation.', flavor: 'Somewhere with a beach, probably.',
        cta: 'Cut it short, Sam \u2014 the office is calling' }
    ],
    mia:  'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a97717bef6af944f0041ade.webp',
    ruby: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771c1ef6af944f0041e25.webp',
    tate: 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771e49b2eaead5c292992.webp'
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DEBUG LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  function log(message) {
    if (window.OT_DEBUG) {
      console.log(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS (same patterns as ot-closer.js / ot-leadstrip.js)
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

  // ═══════════════════════════════════════════════════════════════════════
  // VALUE READERS
  // ═══════════════════════════════════════════════════════════════════════

  function getContactId() {
    var match = window.location.pathname.match(/\/contacts\/detail\/([^\/]+)/);
    return match ? match[1] : '';
  }

  function getLocationId() {
    var match = window.location.pathname.match(/\/location\/([^\/]+)/);
    return match ? match[1] : '';
  }

  // Owner's first name — anchored to #owner-dropdown-trigger, NEVER
  // #hr-ellipsis-id (GHL duplicates that id). Unassigned → 'UNASSIGNED'.
  // Same logic as ot-closer.js v4.
  function getAssignedUserFirstName() {
    var wrap = document.querySelector('#owner-dropdown-trigger');
    if (!wrap) {
      log('TeamDock: owner area not found — sending no assigned_user');
      return '';
    }
    var nameEl = wrap.querySelector('.hr-ellipsis');
    var text = ((nameEl ? nameEl.textContent : wrap.textContent) || '')
      .replace(/[<>]/g, '').trim();
    if (!text || text.toLowerCase().indexOf('unassigned') !== -1) {
      return 'UNASSIGNED';
    }
    return firstWord(text);
  }

  // Company name from the sidebar location switcher. The DOM keeps the
  // FULL text even when the display truncates it. Parentheses rule:
  // "Amanda Gill (Desert Lily Homes LLC)" → "Desert Lily Homes LLC";
  // no parentheses → the whole name as-is.
  function getCompanyName() {
    var el = document.querySelector('.hl_switcher-loc-name');
    if (!el) return '';
    var text = (el.textContent || '').replace(/[<>]/g, '').trim();
    if (!text) return '';
    var match = text.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : text;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // AI TEAM STATUS READER (V4)
  // GHL dropdowns are custom widgets: the selected value is TEXT in
  // .hr-base-selection-overlay__wrapper; the inner <input> is empty.
  // ═══════════════════════════════════════════════════════════════════════

  // Optimistic override after a confirmed toggle (GHL may not re-render
  // the field immediately after an API write).
  var statusOverride = { contactId: '', value: '', ts: 0 };
  var OVERRIDE_TTL_MS = 90000;

  // V10: last successfully READ truth, per contact. When the user switches
  // the side panel to DND/Actions, GHL unmounts the field folders — without
  // this memory every ring would go falsely gray ("my AI died!"). Stale for
  // seconds is honest; false-off is a lie. Cleared implicitly on lead hop
  // (cache is keyed by contactId).
  var statusCache = { contactId: '', value: '' };
  var chipCache = { contactId: '', text: '' };

  function fieldLabelExists(labelText) {
    var labels = document.querySelectorAll('span.hr-form-item-label__text');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim().toLowerCase() === labelText.toLowerCase()) return true;
    }
    return false;
  }

  // Canary: if First Name isn't mounted, the whole field panel is away
  // (DND/Actions tab) — absence of data, not data of absence.
  function fieldsMounted() {
    return fieldLabelExists('First Name');
  }

  function getAITeamStatusRaw() {
    var labels = document.querySelectorAll('span.hr-form-item-label__text');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === STATUS_FIELD_LABEL) {
        var container = labels[i].closest('.hr-form-item__container');
        if (container) {
          var overlay = container.querySelector('.hr-base-selection-overlay__wrapper');
          if (overlay) {
            var t = (overlay.textContent || '').trim();
            if (t) return t;
          }
          var titled = container.querySelector('.hr-base-selection-label[title]');
          if (titled) {
            var t2 = (titled.getAttribute('title') || '').trim();
            if (t2) return t2;
          }
        }
      }
    }
    // Last-resort anchor: the field's own id (observed in the live DOM)
    var byId = document.getElementById('contact.ai_team_status');
    if (byId) {
      var o = byId.querySelector('.hr-base-selection-overlay__wrapper');
      if (o) {
        var t3 = (o.textContent || '').trim();
        if (t3) return t3;
      }
    }
    return '';
  }

  function getAITeamStatus() {
    var cid = getContactId();
    if (statusOverride.contactId === cid &&
        (Date.now() - statusOverride.ts) < OVERRIDE_TTL_MS) {
      statusCache = { contactId: cid, value: statusOverride.value }; // V10: seed the memory
      return statusOverride.value;
    }
    var raw = getAITeamStatusRaw();
    for (var key in STATUS) {
      if (STATUS[key] === raw) {
        statusCache = { contactId: cid, value: raw }; // V10: remember the truth
        return raw;
      }
    }
    // V10: fields unmounted (DND/Actions) + we have this contact's truth
    // in memory => show the remembered state instead of a false all-off.
    if (!fieldsMounted() && statusCache.contactId === cid && statusCache.value) {
      return statusCache.value;
    }
    return ''; // truly empty on a mounted panel => everything off (D18)
  }

  // Lead phone, normalized toward +1XXXXXXXXXX (US). Falls back to the
  // trimmed raw value when the digits don't fit a US shape.
  // V2: the real GHL label is "Phone (Primary)" — sandbox testing caught
  // the exact-match miss. Try it first, then plain "Phone" as fallback.
  function getLeadPhone() {
    var raw = getFieldByLabel('Phone (Primary)') || getFieldByLabel('Phone');
    if (!raw) return '';
    var digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
    return raw;
  }

  // street_name_and_suffix — EXACT mirror of the GHL workflow code that
  // populates the hidden custom field. Do not "improve" this without
  // changing the workflow too; the two must always agree.
  function deriveStreetNameAndSuffix() {
    var streetAddress = (getFieldByLabel('Street Address') || '').trim();
    var street = '';
    if (streetAddress) {
      // Drop the leading house number / range (e.g. "123", "123A", "100-102")
      street = streetAddress.replace(/^\s*\d+[A-Za-z]?(?:-\d+[A-Za-z]?)?\s+/, '');
      // Drop a trailing unit designator (Apt, Ste, Unit, #, Fl, Lot, etc.) and anything after it
      street = street.replace(/\s+(?:#|apt|apartment|ste|suite|unit|fl|floor|rm|room|bldg|building|lot|trlr|trailer|space|spc|dept)\b.*$/i, '');
      // Tidy whitespace
      street = street.replace(/\s+/g, ' ').trim();
    }
    return street;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MIA URL BUILDER
  // ═══════════════════════════════════════════════════════════════════════

  function buildMiaURL() {
    var params = [];

    var contactId = getContactId();
    if (contactId) params.push('contact=' + encodeURIComponent(contactId));

    var locationId = getLocationId();
    if (locationId) params.push('location_id=' + encodeURIComponent(locationId));

    var firstName = firstWord(getFieldByLabel('First Name'));
    if (firstName) params.push('first_name=' + encodeURIComponent(firstName));

    var phone = getLeadPhone();
    if (phone) params.push('phone=' + encodeURIComponent(phone));

    var street = deriveStreetNameAndSuffix();
    if (street) params.push('street_name_and_suffix=' + encodeURIComponent(street));

    var assignedUser = getAssignedUserFirstName();
    if (assignedUser) params.push('assigned_user=' + encodeURIComponent(assignedUser));

    var company = getCompanyName();
    if (company) params.push('company=' + encodeURIComponent(company));

    return MIA_URL + '?' + params.join('&');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STYLES (injected once — hardcoded hex, GHL-armored, no CSS variables)
  // ═══════════════════════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('ot-team-dock-styles')) return;

    // V11: Mia-page fonts for the popup family (Playfair headline, Jakarta body)
    if (!document.getElementById('ot-team-dock-fonts')) {
      var fonts = document.createElement('link');
      fonts.id = 'ot-team-dock-fonts';
      fonts.rel = 'stylesheet';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@500;600;800&display=swap';
      document.head.appendChild(fonts);
    }

    var style = document.createElement('style');
    style.id = 'ot-team-dock-styles';
    style.textContent =
      '#' + DOCK_ID + ' {' +
        'position: fixed;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'z-index: 999;' +
        'display: none;' +
        'align-items: center;' +
        'gap: 14px;' +
        'padding: 8px 18px 6px 12px;' +
        'border-radius: 999px;' +
        'background: linear-gradient(135deg, #1E3A5F 0%, #2a5080 100%);' +
        'box-shadow: 0 4px 14px rgba(30,58,95,0.35);' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'white-space: nowrap;' +
      '}' +

      /* ── Lead chip (the old lead strip, graduated) ── */
      '#' + DOCK_ID + ' .ot-dock-lead {' +
        'display: none;' +
        'align-items: center;' +
        'gap: 7px;' +
        'padding: 5px 12px 5px 9px;' +
        'border-radius: 999px;' +
        'background: rgba(255,255,255,0.12);' +
        'font-size: 12px;' +
        'font-weight: 600;' +
        'color: #ffffff;' +
        'letter-spacing: 0.2px;' +
        'max-width: 220px;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-lead .ot-dock-lead-text {' +
        'overflow: hidden;' +
        'text-overflow: ellipsis;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-dot {' +
        'width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto;' +
        'background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%);' +
      '}' +

      /* ── Circles ── */
      '#' + DOCK_ID + ' .ot-dock-item {' +
        'display: flex; flex-direction: column; align-items: center;' +
        'gap: 2px; border: none; background: none; padding: 0; margin: 0;' +
        'cursor: pointer;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-circle {' +
        'display: flex; align-items: center; justify-content: center;' + /* v2: without display:flex, spans ignore width/height and portraits render giant */
        'width: 48px; height: 48px; border-radius: 50%;' +
        'border: 2.5px solid #E85A33;' +
        'background: #2a5080;' +
        'overflow: hidden;' +
        'position: relative;' +
        'box-sizing: border-box;' +
        'transition: transform 0.15s ease, box-shadow 0.15s ease;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item:hover .ot-dock-circle {' +
        'transform: scale(1.08);' +
        'box-shadow: 0 0 0 3px rgba(232,90,51,0.35);' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-circle img {' +
        'width: 100%; height: 100%; display: block; object-fit: cover;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-label {' +
        'font-size: 10px; font-weight: 600; color: #ffffff;' +
        'letter-spacing: 0.3px;' +
      '}' +

      /* ── Online dot (positioned on the wrapper so it isn't clipped) ── */
      '#' + DOCK_ID + ' .ot-dock-avatar-wrap {' +
        'position: relative;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-online {' +
        'position: absolute; bottom: 0; right: 0;' +
        'width: 11px; height: 11px; border-radius: 50%;' +
        'background: #16a34a; border: 2px solid #1E3A5F;' +
      '}' +

      /* ── Training (Ruby, Tate) ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training {' +
        'cursor: default;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training .ot-dock-circle {' +
        'border-color: #8896a5;' +
        'background: #3d4a5c;' +
        'opacity: 0.55;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training .ot-dock-circle img {' +
        'filter: grayscale(1);' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training:hover .ot-dock-circle {' +
        'transform: none; box-shadow: none;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-training .ot-dock-label {' +
        'color: #8896a5;' +
      '}' +

      /* ── Sam: present, online, but not clickable in v1 ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-passive {' +
        'cursor: default;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-passive:hover .ot-dock-circle {' +
        'transform: none; box-shadow: none;' +
      '}' +

      /* ── Tool chips ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-tool .ot-dock-circle {' +
        'background: #ffffff;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-tool svg {' +
        'width: 20px; height: 20px; stroke: #1E3A5F; fill: none;' +
        'stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;' +
      '}' +

      /* ── Divider between team and tools ── */
      '#' + DOCK_ID + ' .ot-dock-divider {' +
        'width: 1px; height: 40px; background: rgba(255,255,255,0.25);' +
      '}' +

      /* ── Loading / disabled ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-dock-waiting .ot-dock-circle {' +
        'animation: ot-dock-pulse 1.2s ease-in-out infinite;' +
      '}' +
      '@keyframes ot-dock-pulse {' +
        '0%, 100% { opacity: 1; }' +
        '50% { opacity: 0.45; }' +
      '}' +

      /* ── Mia overlay + popup ── */
      '#' + OVERLAY_ID + ' {' +
        'position: fixed; inset: 0; z-index: 99998;' +
        'background: rgba(14,26,43,0.72);' +
        'opacity: 0;' +
        'transition: opacity 0.25s ease;' +
      '}' +
      '#' + OVERLAY_ID + '.ot-shown { opacity: 1; }' +
      '#' + POPUP_ID + ' {' +
        'position: fixed; z-index: 99999;' +
        'top: 50%; left: 50%;' +
        'width: min(650px, 96vw); height: min(900px, 92vh);' + /* v3: sized so the scrollbar disappears on standard monitors; small screens scroll gracefully */
        'background: #1E3A5F;' +
        'border-radius: 18px;' +
        'box-shadow: 0 20px 60px rgba(0,0,0,0.45);' +
        'overflow: hidden;' +
        'display: flex; flex-direction: column;' +
        'transform: translate(-50%, -50%) scale(0.1);' +
        'opacity: 0;' +
        'transition: transform 0.32s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.22s ease;' +
      '}' +
      '#' + POPUP_ID + '.ot-shown {' +
        'transform: translate(-50%, -50%) scale(1);' +
        'opacity: 1;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-head {' +
        'display: flex; align-items: center; gap: 10px;' +
        'padding: 10px 14px;' +
        'background: #1E3A5F;' +
        'flex: 0 0 auto;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-avatar {' +
        'width: 40px; height: 40px; border-radius: 50%;' +
        'border: 2.5px solid #E85A33; background: #2a5080;' +
        'overflow: hidden; box-sizing: border-box; flex: 0 0 auto;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-avatar img {' +
        'width: 100%; height: 100%; display: block; object-fit: cover;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-title {' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'color: #ffffff; font-size: 14px; font-weight: 700; line-height: 1.2;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-sub {' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'color: #c8d0da; font-size: 11px; font-weight: 500;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-close {' +
        'margin-left: auto;' +
        'border: none; background: rgba(255,255,255,0.12);' +
        'color: #ffffff; font-size: 16px; line-height: 1;' +
        'width: 28px; height: 28px; border-radius: 50%;' +
        'cursor: pointer;' +
      '}' +
      '#' + POPUP_ID + ' .ot-mia-popup-close:hover {' +
        'background: rgba(255,255,255,0.25);' +
      '}' +
      '#' + POPUP_ID + ' iframe {' +
        'border: none; width: 100%; flex: 1 1 auto; background: #0e1a2b;' +
      '}' +

      /* ── V4: live status states (traffic-light) ── */
      '#' + DOCK_ID + ' .ot-dock-item.ot-state-standby .ot-dock-online {' +
        'background: #f59e0b;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-state-idle .ot-dock-online {' +
        'display: none;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-state-idle .ot-dock-circle {' +
        'border-color: #8896a5;' +
        'background: #3d4a5c;' +
      '}' +
      '#' + DOCK_ID + ' .ot-dock-item.ot-state-idle .ot-dock-circle img {' +
        'filter: grayscale(1); opacity: 0.55;' +
      '}' +

      /* ── V11: Sam popup — Mia's design language ── */
      '#ot-sam-overlay {' +
        'position: fixed; inset: 0; z-index: 99998;' +
        'background: rgba(14,26,43,0.72);' +
      '}' +
      '#ot-sam-popup {' +
        'position: fixed; z-index: 99999; top: 50%; left: 50%;' +
        'transform: translate(-50%, -50%);' +
        'width: min(650px, 96vw);' +
        'height: min(900px, 92vh);' + /* v15: EXACT Mia-popup dimensions — true twins */
        'display: flex; flex-direction: column;' +
        'overflow-y: auto; overflow-x: hidden;' +
        'background: linear-gradient(170deg, #1E3A5F 0%, #0d1f38 62%);' +
        'border-radius: 22px;' +
        'box-shadow: 0 20px 60px rgba(0,0,0,0.45);' +
        'padding: 0;' + /* v12: header strip is flush; body carries its own padding */
        'font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
        'text-align: center;' +
      '}' +
      /* v12: the same header chrome Mia's popup frame wears */
      '#ot-sam-popup .ot-samp-head {' +
        'display: flex; align-items: center; gap: 10px;' +
        'padding: 10px 14px;' +
        'background: #1E3A5F;' +
        'text-align: left;' +
      '}' +
      '#ot-sam-popup .ot-samp-head-avatar {' +
        'width: 40px; height: 40px; border-radius: 50%;' +
        'border: 2.5px solid #E85A33; background: #2a5080;' +
        'overflow: hidden; box-sizing: border-box; flex: 0 0 auto;' +
      '}' +
      '#ot-sam-popup .ot-samp-head-avatar img {' +
        'width: 100%; height: 100%; display: block; object-fit: cover;' +
      '}' +
      '#ot-sam-popup .ot-samp-head-title {' +
        'color: #ffffff; font-size: 14px; font-weight: 700; line-height: 1.2;' +
      '}' +
      '#ot-sam-popup .ot-samp-head-sub {' +
        'color: #c8d0da; font-size: 11px; font-weight: 500;' +
      '}' +
      '#ot-sam-popup .ot-samp-body {' +
        'padding: 16px 26px 30px;' +
        'flex: 1 1 auto; display: flex; flex-direction: column;' + /* v15: Mia's skeleton — CTA anchors bottom */
      '}' +
      '#ot-sam-popup .ot-samp-cta {' +
        'margin-top: auto; padding-top: 18px;' +
      '}' +
      '#ot-sam-popup .ot-samp-portrait {' +
        'position: relative; height: clamp(230px, 34vh, 330px);' + /* v15: Mia's portrait scale */
        'margin: 4px auto 2px; flex-shrink: 0; width: 100%;' +
      '}' +
      '#ot-sam-popup .ot-samp-glow {' +
        'position: absolute; inset: -30% -35%;' +
        'background: radial-gradient(50% 55% at 50% 62%, rgba(232,90,51,.30), transparent 70%);' +
        'pointer-events: none;' +
      '}' +
      '#ot-sam-popup .ot-samp-portrait img {' +
        'position: relative; height: 100%; width: auto; max-width: 80%;' +
        'object-fit: contain; display: block; margin: 0 auto;' +
      '}' +
      '#ot-sam-popup .ot-samp-status {' +
        'display: inline-flex; align-items: center; gap: 9px;' +
        'font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,.7);' +
        'margin: 10px 0 12px;' +
      '}' +
      '#ot-sam-popup .ot-samp-dot {' +
        'width: 9px; height: 9px; border-radius: 50%; display: inline-block;' +
      '}' +
      '#ot-sam-popup .ot-samp-say {' +
        'font-family: "Playfair Display", Georgia, serif;' +
        'font-size: clamp(24px, 5vw, 30px); font-weight: 700;' +
        'line-height: 1.18; letter-spacing: -0.012em; color: #ffffff;' +
        'margin: 0 6px 14px;' +
      '}' +
      '#ot-sam-popup .ot-samp-bubble {' +
        'background: rgba(255,255,255,.07);' +
        'border: 1px solid rgba(255,255,255,.22);' +
        'border-radius: 22px;' +
        'padding: 18px 22px;' +
        'box-shadow: 0 24px 70px rgba(0,0,0,.35);' +
        'color: rgba(255,255,255,.85);' +
        'font-size: 15px; font-weight: 500; line-height: 1.55;' +
        'text-align: left; margin-bottom: 18px;' +
      '}' +
      '#ot-sam-popup .ot-sam-warn {' +
        'color: #f9b47a; font-size: 13px; line-height: 1.5; margin: -8px 4px 14px; text-align: left;' +
      '}' +
      '#ot-sam-popup .ot-sam-btn {' +
        'display: block; width: 100%; border: none; cursor: pointer;' +
        'font-family: inherit; font-size: 17px; font-weight: 800;' +
        'color: #ffffff;' +
        'background: linear-gradient(135deg, #E85A33, #c94820);' +
        'border-radius: 14px; padding: 17px 30px; margin-top: 10px;' +
        'box-shadow: 0 14px 40px rgba(232,90,51,.4);' +
        'transition: transform .2s, opacity .2s;' +
      '}' +
      '#ot-sam-popup .ot-sam-btn:hover { transform: translateY(-1px); }' +
      '#ot-sam-popup .ot-sam-btn--secondary {' +
        'background: rgba(255,255,255,.10);' +
        'box-shadow: none; font-weight: 600; font-size: 15px;' +
      '}' +
      '#ot-sam-popup .ot-sam-btn:disabled {' +
        'opacity: 0.6; cursor: default; transform: none;' +
      '}' +
      '#ot-sam-popup .ot-sam-close {' +
        'margin-left: auto;' + /* v12: lives in the header strip now */
        'border: none; background: rgba(255,255,255,0.12);' +
        'color: #ffffff; font-size: 16px; line-height: 1;' +
        'width: 28px; height: 28px; border-radius: 50%; cursor: pointer;' +
      '}';
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ICONS (inline SVG — no icon library dependency inside GHL)
  // ═══════════════════════════════════════════════════════════════════════

  var ICONS = {
    calculator:
      '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/>' +
      '<line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="8" y2="11.01"/>' +
      '<line x1="12" y1="11" x2="12" y2="11.01"/><line x1="16" y1="11" x2="16" y2="11.01"/>' +
      '<line x1="8" y1="15" x2="8" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/>' +
      '<line x1="16" y1="15" x2="16" y2="18"/><line x1="8" y1="18" x2="8" y2="18.01"/>' +
      '<line x1="12" y1="18" x2="12" y2="18.01"/></svg>',
    house:
      '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8"/>' +
      '<path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DOCK ELEMENT
  // ═══════════════════════════════════════════════════════════════════════

  function buildItem(opts) {
    // opts: { id, label, kind: 'member'|'tool', img?, icon?, online?,
    //         training?, passive?, title?, onClick? }
    var item = document.createElement('button');
    item.type = 'button';
    item.id = opts.id;
    item.className = 'ot-dock-item' +
      (opts.kind === 'tool' ? ' ot-dock-tool' : '') +
      (opts.training ? ' ot-dock-training' : '') +
      (opts.passive ? ' ot-dock-passive' : '');
    if (opts.title) item.title = opts.title;

    var wrap = document.createElement('span');
    wrap.className = 'ot-dock-avatar-wrap';

    var circle = document.createElement('span');
    circle.className = 'ot-dock-circle';
    if (opts.img) {
      circle.innerHTML = '<img src="' + opts.img + '" alt="' + opts.label + '">';
    } else if (opts.icon) {
      circle.innerHTML = opts.icon;
    }
    wrap.appendChild(circle);

    if (opts.online) {
      var dot = document.createElement('span');
      dot.className = 'ot-dock-online';
      wrap.appendChild(dot);
    }

    var label = document.createElement('span');
    label.className = 'ot-dock-label';
    label.textContent = opts.label;

    item.appendChild(wrap);
    item.appendChild(label);

    if (opts.onClick) {
      item.addEventListener('click', opts.onClick);
    }

    return item;
  }

  function getOrCreateDock() {
    var dock = document.getElementById(DOCK_ID);
    if (dock) return dock;

    injectStyles();

    dock = document.createElement('div');
    dock.id = DOCK_ID;

    // Lead chip
    var lead = document.createElement('div');
    lead.className = 'ot-dock-lead';
    lead.innerHTML =
      '<span class="ot-dock-dot"></span>' +
      '<span class="ot-dock-lead-text" id="ot-dock-lead-text"></span>';
    dock.appendChild(lead);

    // ── Team ──
    dock.appendChild(buildItem({
      id: 'ot-dock-sam', label: 'Sam', kind: 'member', img: IMG.sam,
      online: true,
      title: 'Sam · Acquisitionist — click to see or change his status',
      onClick: onSamClick
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-mia', label: 'Mia', kind: 'member', img: IMG.mia,
      online: true,
      title: 'Mia · Followup Specialist — click to hand off this lead',
      onClick: onMiaClick
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-ruby', label: 'Ruby', kind: 'member', img: IMG.ruby,
      training: true,
      title: 'Ruby · Dispositionist — in training, coming soon'
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-tate', label: 'Tate', kind: 'member', img: IMG.tate,
      training: true,
      title: 'Tate · CRM Support — in training, coming soon'
    }));

    // ── Divider ──
    var divider = document.createElement('span');
    divider.className = 'ot-dock-divider';
    dock.appendChild(divider);

    // ── Tools ──
    dock.appendChild(buildItem({
      id: 'ot-dock-analyzer', label: 'Analyzer', kind: 'tool',
      icon: ICONS.calculator, title: 'Deal Analyzer',
      onClick: toolHandler('otToggleCalculatorPanel', 'Deal Analyzer')
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-comps', label: 'Comps', kind: 'tool',
      icon: ICONS.house, title: 'Get Comps',
      onClick: toolHandler('otToggleCompsPanel', 'Get Comps')
    }));

    dock.appendChild(buildItem({
      id: 'ot-dock-closer', label: 'Closer', kind: 'tool',
      icon: ICONS.phone, title: 'The Closer',
      onClick: toolHandler('otOpenTheCloser', 'The Closer')
    }));

    document.body.appendChild(dock);
    log('✅ TeamDock: dock built');
    return dock;
  }

  function toolHandler(fnName, toolName) {
    return function() {
      if (!window.OT_MODULES_READY) {
        alert('OfferTermz is still loading. Please wait a moment and try again.');
        return;
      }
      var fn = window[fnName];
      if (typeof fn === 'function') {
        fn();
      } else {
        alert('Something went wrong. Please refresh the page and try again.');
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // POSITIONING — centered horizontally; vertical anchor just below the
  // GHL header, in the white space of the page's tab row (where the lead
  // strip used to float). Re-measured every refresh.
  // ═══════════════════════════════════════════════════════════════════════

  function positionDock(dock) {
    var header = document.querySelector('.hl_header--controls');
    if (!header) return false;
    var rect = header.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    dock.style.top = (rect.bottom + 6) + 'px';
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // REFRESH LOOP — visibility, lead chip text, ready-state pulses
  // ═══════════════════════════════════════════════════════════════════════

  function refresh() {
    var dock = document.getElementById(DOCK_ID);

    // Dock lives on contact records only (the tools were contact-only
    // in the button world anyway — this keeps every other screen clean)
    if (!isOnContactPage()) {
      if (dock) dock.style.display = 'none';
      return;
    }

    dock = getOrCreateDock();

    // Lead chip: LEAD first name + street (the old strip's job).
    // V10: rides the same cached-truth memory as the rings — when the
    // field panel unmounts (DND/Actions), the chip keeps showing this
    // contact's remembered text instead of blinking away.
    var leadEl = dock.querySelector('.ot-dock-lead');
    var cid = getContactId();
    if (tabsReady()) {
      var leadFirstName = getFieldByLabel('First Name');
      var street = getFieldByLabel('Street Address');
      var text = '';
      if (leadFirstName && street) text = leadFirstName + ', ' + street;
      else text = leadFirstName || street;

      if (!text && !fieldsMounted() && chipCache.contactId === cid && chipCache.text) {
        text = chipCache.text; // remembered truth while the panel is away
      }

      var textEl = document.getElementById('ot-dock-lead-text');
      if (text) {
        chipCache = { contactId: cid, text: text };
        if (textEl && textEl.textContent !== text) {
          textEl.textContent = text;
          log('📍 TeamDock lead chip: ' + text);
        }
        leadEl.style.display = 'flex';
      } else {
        leadEl.style.display = 'none';
      }
    } else {
      leadEl.style.display = 'none';
    }

    // Ready-state pulses: Mia + Closer need the lead's fields (tabs);
    // Analyzer + Comps just need the modules.
    var waitFieldItems = [
      document.getElementById('ot-dock-mia'),
      document.getElementById('ot-dock-closer')
    ];
    waitFieldItems.forEach(function(item) {
      if (!item) return;
      if (tabsReady()) item.classList.remove('ot-dock-waiting');
      else item.classList.add('ot-dock-waiting');
    });

    // V4: live status rings for Sam & Mia (readable once tabs are open)
    if (tabsReady()) {
      applyStatusRings();
    }

    var waitModuleItems = [
      document.getElementById('ot-dock-analyzer'),
      document.getElementById('ot-dock-comps')
    ];
    waitModuleItems.forEach(function(item) {
      if (!item) return;
      if (window.OT_MODULES_READY) item.classList.remove('ot-dock-waiting');
      else item.classList.add('ot-dock-waiting');
    });

    if (positionDock(dock)) {
      dock.style.display = 'flex';
    } else {
      dock.style.display = 'none';
    }
  }

  setInterval(refresh, REFRESH_EVERY_MS);
  document.addEventListener('ot-tabs-ready', refresh);

  // ═══════════════════════════════════════════════════════════════════════
  // STATUS RINGS (V4) — the dock as a live status board.
  // Truth table (D17):
  //   Sam On                              -> Sam green,  Mia dim
  //   Sam Off                             -> Sam dim,    Mia dim
  //   Mia Following Up & Sam On Standby   -> Sam amber,  Mia green
  //   Mia Following Up & Sam Off          -> Sam dim,    Mia green
  //   (empty / unknown)                   -> all dim (D18)
  // ═══════════════════════════════════════════════════════════════════════

  function setMemberState(id, state) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('ot-state-on', 'ot-state-standby', 'ot-state-idle');
    el.classList.add('ot-state-' + state);
  }

  function applyStatusRings() {
    var status = getAITeamStatus();

    var samState = (status === STATUS.SAM_ON) ? 'on'
      : (status === STATUS.MIA_SAM_STANDBY) ? 'standby'
      : 'idle';
    var miaState = (status === STATUS.MIA_SAM_STANDBY ||
                    status === STATUS.MIA_SAM_OFF) ? 'on' : 'idle';

    setMemberState('ot-dock-sam', samState);
    setMemberState('ot-dock-mia', miaState);

    var samLabel = document.querySelector('#ot-dock-sam .ot-dock-label');
    if (samLabel) {
      var want = (samState === 'standby') ? 'Sam · standby' : 'Sam';
      if (samLabel.textContent !== want) samLabel.textContent = want;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SAM TOGGLE POPUP (V4) — built-in, no external page.
  // Writes { contact, location_id, value } to SAM_WEBHOOK; the Make
  // scenario PUTs the AI Team Status field; the GHL workflow on that
  // field change flips the Conversation AI + writes the dated note.
  // ═══════════════════════════════════════════════════════════════════════

  function onSamClick() {
    if (!isOnContactPage()) {
      alert('Please open a contact record first to manage Sam.');
      return;
    }
    if (!tabsReady()) {
      alert('One second — still loading this lead\'s details. Try again in a moment.');
      return;
    }
    openSamPopup();
  }

  function samLeadName() {
    var n = firstWord(getFieldByLabel('First Name'));
    return n || 'the lead';
  }

  // V13/V14: the wardrobe entry chosen for THIS popup session — rolled
  // once per open so nothing flickers mid-view, re-rolled next open.
  var samOffPick = null;

  function rollSamOffPick() {
    if (!samOffPick && IMG.samOffPool && IMG.samOffPool.length) {
      samOffPick = IMG.samOffPool[Math.floor(Math.random() * IMG.samOffPool.length)];
    }
    return samOffPick;
  }

  function samStateFace(state) {
    if (state === 'on' && IMG.samOn) return IMG.samOn;
    if (state === 'standby' && IMG.samStandby) return IMG.samStandby;
    return IMG.sam;
  }

  function openSamPopup() {
    if (document.getElementById('ot-sam-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'ot-sam-overlay';
    overlay.addEventListener('click', closeSamPopup);
    document.body.appendChild(overlay);

    var card = document.createElement('div');
    card.id = 'ot-sam-popup';
    document.body.appendChild(card);
    document.addEventListener('keydown', samEscHandler);

    renderSamView('main');
  }

  function renderSamView(view) {
    var card = document.getElementById('ot-sam-popup');
    if (!card) return;

    var status = getAITeamStatus();
    var lead = samLeadName();

    // Per-view stage pieces
    var face, dotColor, say, body, buttons;

    if (view === 'main') {
      if (status === STATUS.SAM_ON) {
        face = samStateFace('on'); dotColor = '#22c55e';
        say = 'Sam\u2019s on the clock for ' + lead + '.';
        body = 'The moment ' + lead + ' texts, he\u2019s on it \u2014 working the conversation to book you a call. Turn him off and he steps aside; you become the person in charge of this lead.';
        buttons = '<button type="button" class="ot-sam-btn" data-act="off">Turn Sam Off</button>';
      } else if (status === STATUS.MIA_SAM_STANDBY) {
        face = samStateFace('standby'); dotColor = '#f59e0b';
        say = 'Sam might be in the breakroom.';
        body = 'Mia\u2019s tagging him in the second ' + lead + ' texts back. Until then, he\u2019s on standby.';
        buttons =
          '<button type="button" class="ot-sam-btn" data-act="standby-on">Turn Sam On</button>' +
          '<button type="button" class="ot-sam-btn ot-sam-btn--secondary" data-act="standby-off">Turn Sam Off</button>';
      } else {
        var pick = rollSamOffPick();
        face = (pick && pick.url) || IMG.sam;
        dotColor = '#8896a5';
        say = (pick && pick.say) || ('Sam\u2019s off the clock for ' + lead + '.');
        var flavor = (pick && pick.flavor) ? (pick.flavor + ' ') : '';
        body = flavor + 'You\u2019re the person in charge of this lead right now. Turn him on and he\u2019ll engage the moment ' + lead + ' texts \u2014 working to book you a call.';
        var ctaLabel = (pick && pick.cta) || 'Turn Sam On';
        buttons = '<button type="button" class="ot-sam-btn" data-act="on">' + ctaLabel + '</button>';
      }
    } else if (view === 'standby-on') {
      face = samStateFace('standby'); dotColor = '#f59e0b';
      say = 'Well\u2026 he kinda IS on.';
      body = 'He might just really be in the breakroom. The second ' + lead + ' responds, Sam grabs it. Give him a break \uD83D\uDE09';
      buttons = '<button type="button" class="ot-sam-btn" data-act="close">Fair enough</button>';
    } else if (view === 'standby-off') {
      face = samStateFace('standby'); dotColor = '#f59e0b';
      say = 'Hold on \u2014 what about Mia?';
      body = 'What\u2019s Mia supposed to do when ' + lead + ' responds? If Sam\u2019s off and you\u2019re not notified\u2026 who takes care of the lead?';
      buttons =
        '<button type="button" class="ot-sam-btn" data-act="close">Keep Sam on Standby</button>' +
        '<button type="button" class="ot-sam-btn ot-sam-btn--secondary" data-act="off-notify">Turn Sam Off \u2014 just notify me when ' + lead + ' responds</button>';
    }

    card.innerHTML =
      '<div class="ot-samp-head">' +
        '<span class="ot-samp-head-avatar"><img src="' + IMG.sam + '" alt="Sam"></span>' +
        '<span>' +
          '<div class="ot-samp-head-title">Sam</div>' +
          '<div class="ot-samp-head-sub">Acquisitionist</div>' +
        '</span>' +
        '<button type="button" class="ot-sam-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="ot-samp-body">' +
        '<div class="ot-samp-portrait">' +
          '<div class="ot-samp-glow"></div>' +
          '<img src="' + face + '" alt="Sam">' +
        '</div>' +
        '<div class="ot-samp-status">' +
          '<span class="ot-samp-dot" style="background:' + dotColor + ';"></span>' +
          '<strong style="color:#fff;">Sam</strong>&nbsp;Acquisitionist' +
        '</div>' +
        '<div class="ot-samp-say">' + say + '</div>' +
        '<div class="ot-samp-bubble">' + body + '</div>' +
        '<div class="ot-samp-cta">' + buttons + '</div>' +
      '</div>';

    card.querySelector('.ot-sam-close').addEventListener('click', closeSamPopup);

    var btns = card.querySelectorAll('[data-act]');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          var act = btn.getAttribute('data-act');
          if (act === 'close') closeSamPopup();
          else if (act === 'on') setSamStatus(STATUS.SAM_ON, btn,
            'Heading back to the office\u2026 be there in a second', true);
          else if (act === 'off') setSamStatus(STATUS.SAM_OFF, btn,
            'Clocking Sam out\u2026', false);
          else if (act === 'standby-on') renderSamView('standby-on');
          else if (act === 'standby-off') renderSamView('standby-off');
          else if (act === 'off-notify') setSamStatus(STATUS.MIA_SAM_OFF, btn,
            'Updating the plan\u2026', false);
        });
      })(btns[i]);
    }
  }

  function samEscHandler(e) {
    if (e.key === 'Escape') closeSamPopup();
  }

  function closeSamPopup() {
    samOffPick = null; // V13/V14: next open re-rolls the off-duty wardrobe
    document.removeEventListener('keydown', samEscHandler);
    var overlay = document.getElementById('ot-sam-overlay');
    var card = document.getElementById('ot-sam-popup');
    if (card && card.parentNode) card.parentNode.removeChild(card);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  // V9: logged-in user via GHL's official AppUtils.Utilities.getCurrentUser()
  // Returns { id, name, firstName, lastName, email, type, role }.
  // Any failure resolves to UNKNOWN so the toggle itself never breaks.
  function getLoggedInUser() {
    try {
      if (window.AppUtils && window.AppUtils.Utilities &&
          typeof window.AppUtils.Utilities.getCurrentUser === 'function') {
        return window.AppUtils.Utilities.getCurrentUser().then(function(u) {
          return {
            id: (u && u.id) || 'UNKNOWN',
            name: (u && u.name) || 'UNKNOWN',
            email: (u && u.email) || 'UNKNOWN'
          };
        }).catch(function() {
          return { id: 'UNKNOWN', name: 'UNKNOWN', email: 'UNKNOWN' };
        });
      }
    } catch (e) { /* fall through */ }
    return Promise.resolve({ id: 'UNKNOWN', name: 'UNKNOWN', email: 'UNKNOWN' });
  }

  // V8: human-readable Sam state for the audit trail
  function samStateLabel(status) {
    if (status === STATUS.SAM_ON) return 'On';
    if (status === STATUS.MIA_SAM_STANDBY) return 'Standby';
    return 'Off'; // Sam Off, Mia & Sam Off, empty — Sam-wise it's Off
  }

  // V16: off-duty Sam fades into professional Sam while he "heads back"
  function fadePortraitToWork() {
    var wrap = document.querySelector('#ot-sam-popup .ot-samp-portrait');
    if (!wrap) return;
    var oldImg = wrap.querySelector('img');
    var workFace = samStateFace('on');
    if (!oldImg || oldImg.src === workFace) return;
    var fresh = document.createElement('img');
    fresh.src = workFace;
    fresh.style.cssText =
      'position:absolute;inset:0;margin:auto;height:100%;width:auto;max-width:80%;' +
      'object-fit:contain;opacity:0;transition:opacity .6s ease;';
    oldImg.style.transition = 'opacity .6s ease';
    wrap.appendChild(fresh);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        fresh.style.opacity = '1';
        oldImg.style.opacity = '0';
      });
    });
  }

  function setSamStatus(value, btn, workingLabel, fadeToWork) {
    if (SAM_WEBHOOK.indexOf('REPLACE') === 0) {
      alert('Sam\'s toggle backend isn\'t connected yet (webhook placeholder). No changes were made.');
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = workingLabel || 'Working\u2026'; }
    if (fadeToWork) fadePortraitToWork();

    var action = samStateLabel(getAITeamStatus()) + ' to ' + samStateLabel(value);

    // V9: the person at the keyboard, via GHL's official AppUtils API
    // (verified available in the whitelabel custom-code context).
    // Resolves to a safe fallback if AppUtils ever goes missing —
    // the toggle must never break over a nice-to-have audit column.
    getLoggedInUser().then(function(user) {
      return fetch(SAM_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'contactId': getContactId(),
          'Location ID': getLocationId(),
          'value': value,
          'assigned_user': getAssignedUserFirstName() || 'UNASSIGNED',
          'timestamp': new Date().toISOString(),
          'action': action,
          'logged_in_user': user.name,
          'logged_in_user_id': user.id,
          'logged_in_user_email': user.email
        })
      });
    }).then(function(res) {
      if (res.ok) {
        statusOverride = { contactId: getContactId(), value: value, ts: Date.now() };
        applyStatusRings();
        closeSamPopup();
      } else {
        throw new Error('HTTP ' + res.status);
      }
    }).catch(function(err) {
      log('Sam toggle failed: ' + err.message);
      renderSamView('main');
      alert('Couldn\'t update Sam right now. Nothing was changed \u2014 please try again.');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MIA POPUP — dim the CRM, enlarge Mia's circle into a centered frame
  // loading the central Mia page with this lead's values.
  // ═══════════════════════════════════════════════════════════════════════

  function onMiaClick() {
    if (!isOnContactPage()) {
      alert('Please open a contact record first to hand a lead to Mia.');
      return;
    }
    if (!tabsReady()) {
      alert('One second — still loading this lead\'s details. Try again in a moment.');
      return;
    }
    openMiaPopup();
  }

  function openMiaPopup() {
    if (document.getElementById(OVERLAY_ID)) return; // already open

    var url = buildMiaURL();
    log('TeamDock: opening Mia → ' + url);

    // Overlay
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.addEventListener('click', closeMiaPopup);
    document.body.appendChild(overlay);

    // Popup
    var popup = document.createElement('div');
    popup.id = POPUP_ID;
    popup.innerHTML =
      '<div class="ot-mia-popup-head">' +
        '<span class="ot-mia-popup-avatar"><img src="' + IMG.mia + '" alt="Mia"></span>' +
        '<span>' +
          '<div class="ot-mia-popup-title">Mia</div>' +
          '<div class="ot-mia-popup-sub">Followup Specialist</div>' +
        '</span>' +
        '<button type="button" class="ot-mia-popup-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<iframe src="' + url + '" title="Mia — Followup Specialist"></iframe>';
    popup.querySelector('.ot-mia-popup-close').addEventListener('click', closeMiaPopup);
    document.body.appendChild(popup);

    // "Comes to life": start the popup collapsed at Mia's circle, then
    // release it to the center on the next frame so the transition runs.
    var miaItem = document.getElementById('ot-dock-mia');
    if (miaItem) {
      var r = miaItem.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      popup.style.transformOrigin = 'center center';
      popup.style.transform = 'translate(calc(' + (cx - window.innerWidth / 2) + 'px - 50%), ' +
        'calc(' + (cy - window.innerHeight / 2) + 'px - 50%)) scale(0.1)';
    }

    // ESC closes
    document.addEventListener('keydown', escHandler);

    // Two frames: first paints the collapsed state, second releases it
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        overlay.classList.add('ot-shown');
        popup.style.transform = '';
        popup.classList.add('ot-shown');
      });
    });
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeMiaPopup();
  }

  function closeMiaPopup() {
    var overlay = document.getElementById(OVERLAY_ID);
    var popup = document.getElementById(POPUP_ID);
    document.removeEventListener('keydown', escHandler);
    if (popup) {
      popup.classList.remove('ot-shown');
    }
    if (overlay) {
      overlay.classList.remove('ot-shown');
    }
    setTimeout(function() {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 280);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_TeamDock = {
    refresh: refresh,
    getAITeamStatus: getAITeamStatus,
    applyStatusRings: applyStatusRings,
    openSamPopup: openSamPopup,
    closeSamPopup: closeSamPopup,
    buildMiaURL: buildMiaURL,
    getCompanyName: getCompanyName,
    getLeadPhone: getLeadPhone,
    deriveStreetNameAndSuffix: deriveStreetNameAndSuffix,
    getAssignedUserFirstName: getAssignedUserFirstName,
    openMiaPopup: openMiaPopup,
    closeMiaPopup: closeMiaPopup
  };

  log('✅ ot-team-dock.js v1 loaded');

})();
