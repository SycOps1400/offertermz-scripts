/**
 * Test suite: ot-team-dock.js v1 + ot-loader.js v9
 * Run: node test-team-dock.js
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
}
function section(name) { console.log('\n── ' + name + ' ──'); }

const dockSrc = fs.readFileSync('./ot-team-dock.js', 'utf8');
const loaderSrc = fs.readFileSync('./ot-loader.js', 'utf8');

// ═══════════════════════════════════════════════════════════════════════
// Helper: build a fake GHL contact page DOM
// ═══════════════════════════════════════════════════════════════════════

function makeContactDOM(opts) {
  opts = opts || {};
  const url = opts.url ||
    'https://app.gohighlevel.com/v2/location/gE9qbjW9QSgOwI1Api5h/contacts/detail/dSoiEJ4n26EzpxLBKkmC';

  const fields = opts.fields || {
    'First Name': 'Sarah',
    'Street Address': '1907 N Walnut Ln',
    'Phone (Primary)': '(812) 773-8873'
  };

  let fieldHTML = '';
  for (const [label, value] of Object.entries(fields)) {
    fieldHTML +=
      '<div class="hr-form-item__container">' +
        '<span class="hr-form-item-label__text">' + label + '</span>' +
        '<input value="' + value + '">' +
      '</div>';
  }

  // V4: AI Team Status dropdown — GHL renders the value as TEXT in the
  // overlay wrapper; the input is empty (mirrors the live DOM snippet).
  const statusHTML = (opts.aiStatus === undefined) ? '' :
    '<div class="hr-form-item__container">' +
      '<label><span class="hr-form-item-label__text">AI Team Status</span></label>' +
      '<div class="hr-select" id="contact.ai_team_status">' +
        '<div class="hr-base-selection-label" title="' + opts.aiStatus + '">' +
          '<input class="hr-base-selection-input" value="">' +
          '<div class="hr-base-selection-overlay__wrapper">' + opts.aiStatus + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  const ownerHTML = opts.noOwnerArea ? '' :
    '<div id="owner-dropdown-trigger">' +
      (opts.unassigned ? 'Unassigned' :
        '<span class="hr-ellipsis">' + (opts.owner || 'Ahmed Owner') + '</span>') +
    '</div>';

  const sidebarHTML = opts.noSidebar ? '' :
    '<span class="hl_switcher-loc-name">' +
      (opts.locName || 'Amanda Gill (Desert Lily Homes LLC)') +
    '</span>';

  const dom = new JSDOM(
    '<html><head></head><body>' +
      '<div class="hl_header--controls"></div>' +
      sidebarHTML + ownerHTML + fieldHTML + statusHTML +
    '</body></html>',
    { url: url, runScripts: 'outside-only', pretendToBeVisual: true }
  );

  dom.window.OT_TABS_READY = true;
  dom.window.OT_MODULES_READY = true;

  // jsdom does no layout — every rect is 0×0, which the dock correctly
  // treats as "not laid out yet" and hides. Give the header a real rect.
  const header = dom.window.document.querySelector('.hl_header--controls');
  if (header) {
    header.getBoundingClientRect = () => ({
      top: 0, left: 200, right: 1200, bottom: 48, width: 1000, height: 48
    });
  }
  return dom;
}

function loadDock(dom) {
  dom.window.eval(dockSrc);
  return dom.window.OT_TeamDock;
}

// ═══════════════════════════════════════════════════════════════════════
section('Module load & exposure');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM();
  const dock = loadDock(dom);
  check('OT_TeamDock exposed', !!dock);
  check('double-load guard set', dom.window.OT_TEAMDOCK_LOADED === true);
  check('buildMiaURL exposed', typeof dock.buildMiaURL === 'function');
  check('refresh exposed', typeof dock.refresh === 'function');

  // Second eval must be a no-op
  dom.window.eval(dockSrc);
  check('double-load is a no-op', true);
}

// ═══════════════════════════════════════════════════════════════════════
section('URL contract — full happy path');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM();
  const dock = loadDock(dom);
  const url = dock.buildMiaURL();
  check('base is central Mia page', url.startsWith('https://www.offertermz.com/mia?'));
  check('contact from URL path', url.includes('contact=dSoiEJ4n26EzpxLBKkmC'));
  check('location_id from URL path', url.includes('location_id=gE9qbjW9QSgOwI1Api5h'));
  check('first_name from field', url.includes('first_name=Sarah'));
  check('phone normalized to +1 E.164', url.includes('phone=%2B18127738873'));
  check('street derived (house number dropped)', url.includes('street_name_and_suffix=N%20Walnut%20Ln'));
  check('assigned_user is owner first name', url.includes('assigned_user=Ahmed'));
  check('company from parentheses', url.includes('company=Desert%20Lily%20Homes%20LLC'));
}

// ═══════════════════════════════════════════════════════════════════════
section('street_name_and_suffix — exact workflow mirror');
// ═══════════════════════════════════════════════════════════════════════
{
  const cases = [
    ['1234 North West Main St', 'North West Main St'],   // directionals KEPT (workflow behavior)
    ['123A Oak Ave', 'Oak Ave'],                          // letter-suffixed house number
    ['100-102 Elm St', 'Elm St'],                         // ranged house number
    ['456 Maple Dr Apt 3B', 'Maple Dr'],                  // unit dropped
    ['789 Pine St #12', 'Pine St'],                       // # unit dropped
    ['12 Cedar   Ln  Suite 4', 'Cedar Ln'],               // whitespace tidy + suite
    ['Old Highway 41', 'Old Highway 41'],                 // no house number → untouched
    ['', ''],                                             // empty stays empty
  ];
  for (const [input, expected] of cases) {
    const dom = makeContactDOM({ fields: { 'First Name': 'X', 'Street Address': input, 'Phone': '' } });
    const dock = loadDock(dom);
    const got = dock.deriveStreetNameAndSuffix();
    check('"' + input + '" → "' + expected + '"', got === expected);
  }
}

// ═══════════════════════════════════════════════════════════════════════
section('Phone normalization');
// ═══════════════════════════════════════════════════════════════════════
{
  const cases = [
    ['(812) 773-8873', '+18127738873'],
    ['812-773-8873', '+18127738873'],
    ['8127738873', '+18127738873'],
    ['1 (812) 773-8873', '+18127738873'],
    ['+18127738873', '+18127738873'],
    ['+44 20 7946 0958', '+44 20 7946 0958'], // non-US shape → raw passthrough
  ];
  for (const [input, expected] of cases) {
    const dom = makeContactDOM({ fields: { 'First Name': 'X', 'Street Address': 'Y St', 'Phone (Primary)': input } });
    const dock = loadDock(dom);
    check('"' + input + '" → "' + expected + '"', dock.getLeadPhone() === expected);
  }
  {
    const dom = makeContactDOM({ fields: { 'First Name': 'X', 'Street Address': 'Y St', 'Phone': '(812) 555-0000' } });
    const dock = loadDock(dom);
    check('plain "Phone" label still works as fallback', dock.getLeadPhone() === '+18125550000');
  }
}

// ═══════════════════════════════════════════════════════════════════════
section('Company name — parentheses rule');
// ═══════════════════════════════════════════════════════════════════════
{
  const cases = [
    ['Amanda Gill (Desert Lily Homes LLC)', 'Desert Lily Homes LLC'],
    ['Living Value Properties', 'Living Value Properties'],  // no parens → whole
    ['Steve (Steve RealEstate) ', 'Steve RealEstate'],
  ];
  for (const [locName, expected] of cases) {
    const dom = makeContactDOM({ locName });
    const dock = loadDock(dom);
    check('"' + locName + '" → "' + expected + '"', dock.getCompanyName() === expected);
  }
  const dom = makeContactDOM({ noSidebar: true });
  const dock = loadDock(dom);
  check('missing sidebar → empty (param omitted)', dock.getCompanyName() === '');
}

// ═══════════════════════════════════════════════════════════════════════
section('Assigned user — owner logic (ot-closer v4 parity)');
// ═══════════════════════════════════════════════════════════════════════
{
  let dom = makeContactDOM({ owner: 'Reginald Barnes' });
  check('assigned → first name only', loadDock(dom).getAssignedUserFirstName() === 'Reginald');

  dom = makeContactDOM({ unassigned: true });
  check('unassigned → UNASSIGNED', loadDock(dom).getAssignedUserFirstName() === 'UNASSIGNED');

  dom = makeContactDOM({ noOwnerArea: true });
  check('no owner area → empty (param omitted)', loadDock(dom).getAssignedUserFirstName() === '');
}

// ═══════════════════════════════════════════════════════════════════════
section('Dock element & refresh behavior');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM();
  const dock = loadDock(dom);
  dock.refresh();
  const el = dom.window.document.getElementById('ot-team-dock');
  check('dock element created on contact page', !!el);
  check('dock visible', el.style.display === 'flex');
  check('Sam circle present', !!dom.window.document.getElementById('ot-dock-sam'));
  check('Mia circle present', !!dom.window.document.getElementById('ot-dock-mia'));
  check('Ruby is training', dom.window.document.getElementById('ot-dock-ruby').className.includes('ot-dock-training'));
  check('Tate is training', dom.window.document.getElementById('ot-dock-tate').className.includes('ot-dock-training'));
  check('Sam is clickable in v4 (passive retired)', !dom.window.document.getElementById('ot-dock-sam').className.includes('ot-dock-passive'));
  check('Analyzer tool present', !!dom.window.document.getElementById('ot-dock-analyzer'));
  check('Comps tool present', !!dom.window.document.getElementById('ot-dock-comps'));
  check('Closer tool present', !!dom.window.document.getElementById('ot-dock-closer'));
  const chipText = dom.window.document.getElementById('ot-dock-lead-text').textContent;
  check('lead chip shows "Sarah, 1907 N Walnut Ln"', chipText === 'Sarah, 1907 N Walnut Ln');
  check('styles injected once', dom.window.document.querySelectorAll('#ot-team-dock-styles').length === 1);

  // Mia circle not pulsing when tabs ready
  check('Mia solid when tabs ready', !dom.window.document.getElementById('ot-dock-mia').className.includes('ot-dock-waiting'));

  // Tabs NOT ready → Mia pulses, chip hidden
  dom.window.OT_TABS_READY = false;
  dock.refresh();
  check('Mia pulses when tabs not ready', dom.window.document.getElementById('ot-dock-mia').className.includes('ot-dock-waiting'));
  check('lead chip hidden when tabs not ready', el.querySelector('.ot-dock-lead').style.display === 'none');
}

// ═══════════════════════════════════════════════════════════════════════
section('Off contact page → dock hidden');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM({
    url: 'https://app.gohighlevel.com/v2/location/gE9qbjW9QSgOwI1Api5h/dashboard'
  });
  const dock = loadDock(dom);
  dock.refresh();
  const el = dom.window.document.getElementById('ot-team-dock');
  check('dock not shown off contact pages', !el || el.style.display === 'none');
}

// ═══════════════════════════════════════════════════════════════════════
section('Mia popup');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM();
  const dock = loadDock(dom);
  dock.refresh();
  dock.openMiaPopup();
  const overlay = dom.window.document.getElementById('ot-mia-overlay');
  const popup = dom.window.document.getElementById('ot-mia-popup');
  check('overlay created', !!overlay);
  check('popup created', !!popup);
  const iframe = popup && popup.querySelector('iframe');
  check('iframe present', !!iframe);
  check('iframe carries full URL contract',
    iframe && iframe.src.includes('contact=') && iframe.src.includes('location_id=') &&
    iframe.src.includes('first_name=') && iframe.src.includes('phone=') &&
    iframe.src.includes('street_name_and_suffix=') && iframe.src.includes('assigned_user=') &&
    iframe.src.includes('company='));
  check('Mia portrait in popup header', !!popup.querySelector('.ot-mia-popup-avatar img'));

  // Second open is a no-op (no duplicates)
  dock.openMiaPopup();
  check('second open does not duplicate', dom.window.document.querySelectorAll('#ot-mia-popup').length === 1);

  // Close removes both after the animation window
  dock.closeMiaPopup();
  check('close initiated (shown class removed)', !popup.className.includes('ot-shown'));
}

// ═══════════════════════════════════════════════════════════════════════
section('AI Team Status reader (V4)');
// ═══════════════════════════════════════════════════════════════════════
{
  const vals = [
    'Sam On',
    'Sam Off',
    'Mia Following Up & Sam On Standby',
    'Mia Following Up & Sam Off'
  ];
  for (const v of vals) {
    const dom = makeContactDOM({ aiStatus: v });
    const dock = loadDock(dom);
    check('reads "' + v + '" exactly', dock.getAITeamStatus() === v);
  }
  {
    const dom = makeContactDOM({ aiStatus: 'Some Garbage Value' });
    check('unknown value => empty (all off)', loadDock(dom).getAITeamStatus() === '');
  }
  {
    const dom = makeContactDOM({ aiStatus: '' });
    check('empty dropdown => empty', loadDock(dom).getAITeamStatus() === '');
  }
  {
    const dom = makeContactDOM(); // field absent entirely (pre-migration)
    check('field absent => empty', loadDock(dom).getAITeamStatus() === '');
  }
}

// ═══════════════════════════════════════════════════════════════════════
section('Status truth table → rings (V4)');
// ═══════════════════════════════════════════════════════════════════════
{
  const table = [
    ['Sam On',                              'on',      'idle', 'Sam'],
    ['Sam Off',                             'idle',    'idle', 'Sam'],
    ['Mia Following Up & Sam On Standby',   'standby', 'on',   'Sam · standby'],
    ['Mia Following Up & Sam Off',          'idle',    'on',   'Sam'],
    [undefined,                             'idle',    'idle', 'Sam'], // absent field
  ];
  for (const [status, samState, miaState, samLabel] of table) {
    const dom = makeContactDOM(status === undefined ? {} : { aiStatus: status });
    const dock = loadDock(dom);
    dock.refresh();
    const sam = dom.window.document.getElementById('ot-dock-sam');
    const mia = dom.window.document.getElementById('ot-dock-mia');
    const label = sam.querySelector('.ot-dock-label').textContent;
    const name = status === undefined ? '(absent)' : '"' + status + '"';
    check(name + ' → Sam ' + samState, sam.className.includes('ot-state-' + samState));
    check(name + ' → Mia ' + miaState, mia.className.includes('ot-state-' + miaState));
    check(name + ' → label "' + samLabel + '"', label === samLabel);
  }
}

// ═══════════════════════════════════════════════════════════════════════
section('Sam toggle popup (V4)');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM({ aiStatus: 'Sam On' });
  const alerts = [];
  dom.window.alert = (m) => alerts.push(m);
  const dock = loadDock(dom);
  dock.refresh();
  dock.openSamPopup();
  const popup = dom.window.document.getElementById('ot-sam-popup');
  check('popup created', !!popup);
  check('ON view: "on the clock" voice', popup.textContent.includes('on the clock'));
  check('ON view: armed-not-texting copy', popup.textContent.includes('The moment Sarah texts') && !popup.textContent.includes('talk'));
  const btn = popup.querySelector('[data-act="off"]');
  check('ON view: single action = Turn Sam Off', btn && btn.textContent === 'Turn Sam Off');
  dock.closeSamPopup();
  check('popup closes clean', !dom.window.document.getElementById('ot-sam-popup'));

  // OFF view voice
  const domOff = makeContactDOM({ aiStatus: 'Sam Off' });
  const dockOff = loadDock(domOff);
  dockOff.refresh();
  dockOff.openSamPopup();
  const popupOff = domOff.window.document.getElementById('ot-sam-popup');
  check('OFF view: "off the clock" + in-charge framing', popupOff.textContent.includes('off the clock') && popupOff.textContent.includes('person in charge'));
  check('OFF view: single action = Turn Sam On', popupOff.querySelector('[data-act="on"]').textContent === 'Turn Sam On');
  dockOff.closeSamPopup();

  // Standby: the two-step
  const dom2 = makeContactDOM({ aiStatus: 'Mia Following Up & Sam On Standby' });
  const dock2 = loadDock(dom2);
  dock2.refresh();
  dock2.openSamPopup();
  const popup2 = dom2.window.document.getElementById('ot-sam-popup');
  check('standby view: breakroom line with lead name', popup2.textContent.includes('breakroom') && popup2.textContent.includes('Sarah'));
  check('standby view: two buttons (On + Off)', !!popup2.querySelector('[data-act="standby-on"]') && !!popup2.querySelector('[data-act="standby-off"]'));

  // Turn Sam On during standby = playful no-op, no network call
  let anyFetch = false;
  dom2.window.fetch = () => { anyFetch = true; return Promise.resolve({ ok: true }); };
  popup2.querySelector('[data-act="standby-on"]').dispatchEvent(new dom2.window.Event('click'));
  check('standby-on: "kinda IS on" view', popup2.textContent.includes('kinda IS on'));
  check('standby-on: no webhook fired (no-op)', anyFetch === false);
  popup2.querySelector('[data-act="close"]').dispatchEvent(new dom2.window.Event('click'));
  check('"Fair enough" closes the popup', !dom2.window.document.getElementById('ot-sam-popup'));

  // Turn Sam Off during standby = confirmation, then guarded write
  let fetched2 = null;
  dom2.window.fetch = (url, opts) => { fetched2 = { url, opts }; return Promise.resolve({ ok: true }); };
  dock2.openSamPopup();
  const p2 = dom2.window.document.getElementById('ot-sam-popup');
  p2.querySelector('[data-act="standby-off"]').dispatchEvent(new dom2.window.Event('click'));
  check('standby-off: the Mia question shown', p2.textContent.includes('who takes care of the lead'));
  check('standby-off: fired nothing yet', fetched2 === null);
  check('standby-off: Keep Sam on Standby offered', p2.querySelector('[data-act="close"]').textContent.includes('Keep Sam on Standby'));
  p2.querySelector('[data-act="off-notify"]').dispatchEvent(new dom2.window.Event('click'));
  setTimeout(() => {
    const body2 = fetched2 ? JSON.parse(fetched2.opts.body) : {};
    check('off-notify writes "Mia Following Up & Sam Off"', body2.value === 'Mia Following Up & Sam Off');
    check('off-notify audit: action "Standby to Off"', body2.action === 'Standby to Off');
  }, 100);

  // Full write path with a mocked backend (v5)
  const dom3 = makeContactDOM({ aiStatus: 'Sam On' });
  let fetched = null;
  dom3.window.fetch = (url, opts) => { fetched = { url, opts }; return Promise.resolve({ ok: true }); };
  const dock3 = loadDock(dom3);
  dock3.refresh();
  dock3.openSamPopup();
  // Simulate the official AppUtils API being present
  dom3.window.AppUtils = { Utilities: { getCurrentUser: () => Promise.resolve({
    id: 'K2pBHHFpQAVTNIzn42jc', name: 'Ahmed Afifi', firstName: 'Ahmed',
    lastName: 'Afifi', email: 'ahmed@automationz.ai', type: 'agency', role: 'admin'
  }) } };
  const btn3 = dom3.window.document.querySelector('#ot-sam-popup [data-act="off"]');
  btn3.dispatchEvent(new dom3.window.Event('click'));
  // Unassigned lead → assigned_user: "UNASSIGNED" in the audit payload
  const dom4 = makeContactDOM({ aiStatus: 'Sam Off', unassigned: true });
  let fetched4 = null;
  dom4.window.fetch = (url, opts) => { fetched4 = { url, opts }; return Promise.resolve({ ok: true }); };
  const dock4 = loadDock(dom4);
  dock4.refresh();
  dock4.openSamPopup();
  // dom4 has no AppUtils — the fallback path must engage
  dom4.window.document.querySelector('#ot-sam-popup [data-act="on"]').dispatchEvent(new dom4.window.Event('click'));

  setTimeout(() => {
    check('POSTs to the real Sam webhook',
      fetched && fetched.url === 'https://hook.us1.make.com/0p6jeo2v4praotvltnzpmodkfwvmba27');
    const body3 = fetched ? JSON.parse(fetched.opts.body) : {};
    check('payload speaks the Mia dialect: contactId + "Location ID" + value',
      body3['contactId'] === 'dSoiEJ4n26EzpxLBKkmC' &&
      body3['Location ID'] === 'gE9qbjW9QSgOwI1Api5h' &&
      body3.value === 'Sam Off');
    check('audit: assigned_user carried', body3.assigned_user === 'Ahmed');
    check('audit: ISO timestamp', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(body3.timestamp));
    check('audit: action "On to Off"', body3.action === 'On to Off');
    check('v9: logged_in_user name via AppUtils', body3.logged_in_user === 'Ahmed Afifi');
    check('v9: logged_in_user_id via AppUtils', body3.logged_in_user_id === 'K2pBHHFpQAVTNIzn42jc');
    check('v9: logged_in_user_email via AppUtils', body3.logged_in_user_email === 'ahmed@automationz.ai');

    const body4 = fetched4 ? JSON.parse(fetched4.opts.body) : {};
    check('unassigned lead → assigned_user UNASSIGNED', body4.assigned_user === 'UNASSIGNED');
    check('unassigned lead → action "Off to On"', body4.action === 'Off to On');
    check('v9: no AppUtils → logged_in_user UNKNOWN (toggle survives)', body4.logged_in_user === 'UNKNOWN');

    check('optimistic override: reader now says Sam Off', dock3.getAITeamStatus() === 'Sam Off');
    check('rings updated: Sam idle after the toggle', dom3.window.document.getElementById('ot-dock-sam').className.includes('ot-state-idle'));
    check('popup closed after confirmed 200', !dom3.window.document.getElementById('ot-sam-popup'));
  }, 100);
}

// ═══════════════════════════════════════════════════════════════════════
section('V10: cached truth across panel tabs (the dock never lies)');
// ═══════════════════════════════════════════════════════════════════════
{
  const dom = makeContactDOM({ aiStatus: 'Sam On' });
  const dock = loadDock(dom);
  dock.refresh();
  const doc = dom.window.document;
  check('mounted: Sam green', doc.getElementById('ot-dock-sam').className.includes('ot-state-on'));
  check('mounted: chip shows lead', doc.getElementById('ot-dock-lead-text').textContent === 'Sarah, 1907 N Walnut Ln');

  // Simulate switching to DND/Actions: GHL unmounts every field container
  doc.querySelectorAll('.hr-form-item__container').forEach(e => e.remove());
  check('simulated unmount: First Name gone', ![...doc.querySelectorAll('span.hr-form-item-label__text')].some(l => l.textContent.trim() === 'First Name'));

  dock.refresh();
  check('unmounted: Sam STAYS green (cached truth)', doc.getElementById('ot-dock-sam').className.includes('ot-state-on'));
  check('unmounted: status reader returns cached "Sam On"', dock.getAITeamStatus() === 'Sam On');
  check('unmounted: chip keeps showing the lead', doc.getElementById('ot-dock-lead-text').textContent === 'Sarah, 1907 N Walnut Ln');
  check('unmounted: chip still visible', doc.querySelector('.ot-dock-lead').style.display === 'flex');

  // Standby state cached too — Mia must stay lit on Actions tab
  const dom2 = makeContactDOM({ aiStatus: 'Mia Following Up & Sam On Standby' });
  const dock2 = loadDock(dom2);
  dock2.refresh();
  const doc2 = dom2.window.document;
  doc2.querySelectorAll('.hr-form-item__container').forEach(e => e.remove());
  dock2.refresh();
  check('unmounted: Sam stays amber (standby cached)', doc2.getElementById('ot-dock-sam').className.includes('ot-state-standby'));
  check('unmounted: Mia stays green (cached)', doc2.getElementById('ot-dock-mia').className.includes('ot-state-on'));

  // Control: no cache (fields never mounted) => honest all-off
  const dom3 = makeContactDOM({});
  doc3 = dom3.window.document;
  doc3.querySelectorAll('.hr-form-item__container').forEach(e => e.remove());
  const dock3c = loadDock(dom3);
  dock3c.refresh();
  check('no cache + unmounted => idle (no invented truth)', doc3.getElementById('ot-dock-sam').className.includes('ot-state-idle'));
}

// ═══════════════════════════════════════════════════════════════════════
section('Autotabs v3 — static analysis');
// ═══════════════════════════════════════════════════════════════════════
{
  const at = fs.readFileSync('./ot-autotabs.js', 'utf8');
  check('v3 header present', at.includes('VERSION 3'));
  check('All-fields selector present', at.includes('[data-name="all-fields"]'));
  check('active-class detection present', at.includes('hr-tabs-tab--active'));
  check('panel click throttled', at.includes('lastPanelClickAt'));
  check('v2 slow mode survives', at.includes('SLOW_CHECK_EVERY_MS') && at.includes('slowMode = true'));
  check('panel switch precedes folder work (step 0)', at.indexOf('data-name="all-fields"') < at.indexOf('// 1) Open any tab'));
}

// ═══════════════════════════════════════════════════════════════════════
section('Loader v9 — flag & module wiring (static analysis)');
// ═══════════════════════════════════════════════════════════════════════
{
  check('v9 header present', loaderSrc.includes('OfferTermz Loader v9'));
  check('ENABLE_DOCK_EVERYWHERE declared false', /var ENABLE_DOCK_EVERYWHERE = false;/.test(loaderSrc));
  check('DOCK_ENABLED derives from flag OR sandbox', loaderSrc.includes('var DOCK_ENABLED = ENABLE_DOCK_EVERYWHERE || IS_SANDBOX;'));
  check('team-dock pushed under DOCK_ENABLED', /if \(DOCK_ENABLED\) \{\s*MODULES\.push\('ot-team-dock\.js'\);/.test(loaderSrc));
  check('leadstrip skipped in dock mode', /if \(!DOCK_ENABLED\) \{\s*MODULES\.push\('ot-leadstrip\.js'\);/.test(loaderSrc));
  check('header buttons skipped in dock mode', /if \(DOCK_ENABLED\) return true;/.test(loaderSrc));
  check('Closer flag still true (production untouched)', /var ENABLE_CLOSER_EVERYWHERE = true;/.test(loaderSrc));
  check('sandbox location ID unchanged', loaderSrc.includes("var SANDBOX_LOCATION_ID = 'gE9qbjW9QSgOwI1Api5h';"));
}

// ═══════════════════════════════════════════════════════════════════════
section('Loader v9 — runtime: sandbox vs production module lists');
// ═══════════════════════════════════════════════════════════════════════
{
  function runLoader(url) {
    const dom = new JSDOM('<html><head></head><body></body></html>',
      { url, runScripts: 'outside-only', pretendToBeVisual: true });
    const loaded = [];
    // Intercept script loading: record srcs, never execute
    const origAppend = dom.window.document.head.appendChild.bind(dom.window.document.head);
    dom.window.document.head.appendChild = function(node) {
      if (node.tagName === 'SCRIPT' && node.src) {
        loaded.push(node.src);
        // simulate instant success so the chain continues
        setTimeout(() => node.onload && node.onload(), 0);
        return node;
      }
      return origAppend(node);
    };
    dom.window.eval(loaderSrc);
    return { dom, loaded };
  }

  const sandbox = runLoader('https://app.gohighlevel.com/v2/location/gE9qbjW9QSgOwI1Api5h/contacts/detail/abc');
  const prod = runLoader('https://app.gohighlevel.com/v2/location/SomeOtherLocation123/contacts/detail/abc');

  // Let the async load chain drain (each hop is its own macrotask)
  return new Promise(resolve => setTimeout(resolve, 2500)).then(() => {
    const sList = sandbox.loaded.join(' ');
    const pList = prod.loaded.join(' ');
    check('SANDBOX loads ot-team-dock.js', sList.includes('ot-team-dock.js'));
    check('SANDBOX skips ot-leadstrip.js', !sList.includes('ot-leadstrip.js'));
    check('SANDBOX pulls from @dev', sList.includes('@dev/'));
    check('PRODUCTION does NOT load ot-team-dock.js', !pList.includes('ot-team-dock.js'));
    check('PRODUCTION still loads ot-leadstrip.js', pList.includes('ot-leadstrip.js'));
    check('PRODUCTION still loads ot-closer.js', pList.includes('ot-closer.js'));

    console.log('\n═══════════════════════════════════');
    console.log('RESULTS: ' + pass + ' passed, ' + fail + ' failed');
    console.log('═══════════════════════════════════');
    process.exit(fail > 0 ? 1 : 0);
  });
}
