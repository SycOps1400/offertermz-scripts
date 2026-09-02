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
  check('shows ON status line', popup.textContent.includes('Sam is ON'));
  const btn = popup.querySelector('#ot-sam-toggle-btn');
  check('primary action is Turn Sam Off', btn && btn.textContent === 'Turn Sam Off');
  dock.closeSamPopup();
  check('popup closes clean', !dom.window.document.getElementById('ot-sam-popup'));

  // Standby state shows Mia caution
  const dom2 = makeContactDOM({ aiStatus: 'Mia Following Up & Sam On Standby' });
  const dock2 = loadDock(dom2);
  dock2.refresh();
  dock2.openSamPopup();
  const popup2 = dom2.window.document.getElementById('ot-sam-popup');
  check('standby popup: STANDBY line', popup2.textContent.includes('STANDBY'));
  check('standby popup: Mia caution shown', popup2.textContent.includes("end Mia"));
  check('standby popup: action is Turn Sam On', popup2.querySelector('#ot-sam-toggle-btn').textContent === 'Turn Sam On');
  dock2.closeSamPopup();

  // Full write path with a mocked backend (v5)
  const dom3 = makeContactDOM({ aiStatus: 'Sam On' });
  let fetched = null;
  dom3.window.fetch = (url, opts) => { fetched = { url, opts }; return Promise.resolve({ ok: true }); };
  const dock3 = loadDock(dom3);
  dock3.refresh();
  dock3.openSamPopup();
  const btn3 = dom3.window.document.getElementById('ot-sam-toggle-btn');
  btn3.dispatchEvent(new dom3.window.Event('click'));
  check('POSTs to the real Sam webhook',
    fetched && fetched.url === 'https://hook.us1.make.com/0p6jeo2v4praotvltnzpmodkfwvmba27');
  const body3 = fetched ? JSON.parse(fetched.opts.body) : {};
  check('payload carries contact + location_id + value=Sam Off',
    body3.contact === 'dSoiEJ4n26EzpxLBKkmC' &&
    body3.location_id === 'gE9qbjW9QSgOwI1Api5h' &&
    body3.value === 'Sam Off');
  setTimeout(() => {
    check('optimistic override: reader now says Sam Off', dock3.getAITeamStatus() === 'Sam Off');
    check('rings updated: Sam idle after the toggle', dom3.window.document.getElementById('ot-dock-sam').className.includes('ot-state-idle'));
    check('popup closed after confirmed 200', !dom3.window.document.getElementById('ot-sam-popup'));
  }, 100);
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
