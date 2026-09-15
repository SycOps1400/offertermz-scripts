/* ot-smartlists.js — OfferTermz Pro Lists builder
 * Renders a banner on the Contacts page when any of the five recommended smart
 * lists are missing, and builds + globally shares the missing ones on click.
 *
 * Verified against the live API 2026-09-15. See claude/smartlist-api-spec.md.
 *
 * REVIEW PATCH 2026-09-15 (pre-ship, on the 318-line base):
 * - Existence re-checked at click time (no duplicates on retry/double-click/two admins).
 * - Field resolution: exact name/key first, loose contains as fallback.
 * - Banner rendered for admin/agency users only.
 */
(function () {
  'use strict';

  if (window.__otSmartlists) return;
  window.__otSmartlists = true;

  var S = 'https://services.leadconnectorhq.com';
  var A = 'https://api.leadconnectorhq.com';

  /* ---------- column sets ---------- */
  function cols(keys, w, lastW) {
    return keys.map(function (k, i) {
      return { key: k, value: k, width: i === keys.length - 1 ? lastW : w, order: i };
    });
  }
  var STD = cols(['name','address_1','phone','lastNote','lastActivity','dateAdded','source'], 278, 287);
  var DND = cols(['name','address_1','dnd','lastActivity','dateAdded','source'], 325, 330);

  function sortBy(field) { return [{ fieldName: field, direction: 'desc', isCustomField: false }]; }
  function eq(field, value) { return { field: field, operator: 'eq', value: value, options: { minimumMatch: 'all' } }; }
  function notEq(field, value) { return { field: field, operator: 'not_eq', value: value, options: { minimumMatch: 'all' } }; }
  function notExists(field) { return { field: field, operator: 'not_exists' }; }
  var OPEN_OPP = {
    field: 'opportunities', operator: 'nested',
    value: [{ field: 'status', operator: 'eq', value: 'open', uiMeta: { fieldAlias: 'pipeline_status' } }]
  };
  function spec(andGroups) {
    return {
      filters: [{ group: 'OR', filters: andGroups.map(function (g) { return { group: 'AND', filters: g }; }) }],
      page: 1, limit: 20
    };
  }

  /* ---------- the five ---------- */
  function definitions(f) {           // f = { status: '<id>', type: '<id>' }
    var ST = 'custom_fields.' + f.status;
    var TY = 'custom_fields.' + f.type;
    return [
      { name: '⚪ Waiting on You', order: 0, columns: STD, sort: sortBy('dateAdded'),
        spec: spec([
          [OPEN_OPP, eq(ST, 'Sam Off'), eq(TY, 'Seller')],
          [OPEN_OPP, eq(ST, 'Sam Off'), eq(TY, 'Buyer')],
          [eq(ST, 'Sam Off'), notExists(TY)]
        ]) },
      { name: '🟢 Sam is Booking Appointments', order: 1, columns: STD, sort: sortBy('dateAdded'),
        spec: spec([[eq(ST, 'Sam On')]]) },
      { name: '🔵 Mia is Following up with..', order: 2, columns: STD, sort: sortBy('dateAdded'),
        spec: spec([
          [eq(ST, 'Mia Following Up & Sam Off')],
          [eq(ST, 'Mia Following Up & Sam On Standby')]
        ]) },
      { name: '🚫 Asked to Stop', order: 3, columns: DND, sort: sortBy('lastActivity'),
        spec: spec([
          [eq('dnd_settings.SMS.status', 'true')],
          [eq('dnd_settings.Call.status', 'true')]
        ]) },
      { name: '🔎 Other Contacts', order: 4, columns: STD, sort: sortBy('dateAdded'),
        spec: spec([[notEq(TY, 'Seller'), notEq(TY, 'Buyer')]]) },
    ];
  }

  /* ---------- plumbing ---------- */
  function token() {
    return new Promise(function (res, rej) {
      var q = indexedDB.open('firebaseLocalStorageDb');
      q.onerror = function () { rej(new Error('firebase db unavailable')); };
      q.onsuccess = function () {
        var all = q.result.transaction('firebaseLocalStorage', 'readonly')
                    .objectStore('firebaseLocalStorage').getAll();
        all.onerror = function () { rej(new Error('token read failed')); };
        all.onsuccess = function () {
          for (var i = 0; i < all.result.length; i++) {
            var r = all.result[i];
            var t = r && r.value && r.value.stsTokenManager && r.value.stsTokenManager.accessToken;
            if (t) return res(t);
          }
          rej(new Error('no token'));
        };
      };
    });
  }

  function locationId() {
    var m = location.pathname.match(/\/location\/([A-Za-z0-9]+)/);
    return m ? m[1] : null;
  }

  function claims(tok) {
    try { return JSON.parse(atob(tok.split('.')[1])) || {}; } catch (e) { return {}; }
  }
  function userId(tok) { return claims(tok).user_id || null; }
  function isAdmin(tok) {
    var c = claims(tok);
    return c.role === 'admin' || c.type === 'agency';
  }

  // services.* requires the version header; api.* must not have it.
  function headers(tok, host) {
    var h = {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      channel: 'APP', source: 'WEB_USER', 'token-id': tok
    };
    if (host === S) h.version = '2021-07-28';
    return h;
  }

  function api(host, path, tok, opts) {
    opts = opts || {};
    return fetch(host + path, {
      method: opts.method || 'GET',
      headers: headers(tok, host),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = JSON.parse(t); } catch (e) {}
        if (!r.ok) throw new Error(path + ' -> ' + r.status + ' ' + t.slice(0, 160));
        return j;
      });
    });
  }

  /* ---------- resolve per-location custom field ids ---------- */
  function norm(s) { return (s || '').toLowerCase().replace(/^\*\s*/, '').trim(); }

  // Exact name/key first; loose contains only as a fallback. A customer adding
  // "Secondary Contact Type" to their own folder must never hijack the lists.
  function pick(list, exact, loose) {
    var hit = list.find(function (f) {
      var n = norm(f.name), k = norm(f.fieldKey);
      return exact.some(function (e) { return n === e || k === e || k === 'contact.' + e; });
    });
    if (hit) return hit;
    return list.find(function (f) {
      var hay = norm(f.name) + ' ' + norm(f.fieldKey);
      return loose.some(function (l) { return hay.indexOf(l) !== -1; });
    });
  }

  function resolveFields(tok, loc) {
    return api(S, '/locations/' + loc + '/customFields', tok).then(function (j) {
      var list = (j && j.customFields) || [];
      var status = pick(list, ['ai team status', 'ai_team_status'], ['ai team status', 'ai_team_status']);
      var type = pick(list, ['primary contact type', 'primary_contact_type', 'contact type', 'contact_type'],
                            ['contact type', 'contact_type']);
      if (!status || !type) {
        throw new Error('Could not find the AI Team Status and Contact Type fields in this account. ' +
                        'Nothing was built.');
      }
      return { status: status.id, type: type.id };
    });
  }

  /* ---------- which of the five exist ---------- */
  // The search response envelope isn't pinned down, so pull every object that
  // carries a listName rather than depending on one key name.
  function harvestNames(node, out, depth) {
    if (!node || depth > 4) return out;
    if (Array.isArray(node)) {
      node.forEach(function (n) { harvestNames(n, out, depth + 1); });
      return out;
    }
    if (typeof node !== 'object') return out;
    if (typeof node.listName === 'string') {
      out.push({ name: node.listName.trim(), id: node.id || node._id || node.smartListId || null });
    }
    Object.keys(node).forEach(function (k) { harvestNames(node[k], out, depth + 1); });
    return out;
  }

  function existingLists(tok, loc, uid) {
    return api(S, '/contacts/smartlist/search?locationId=' + loc + '&userId=' + uid +
                  '&globals=true&transform=true', tok)
      .then(function (j) { return harvestNames(j, [], 0); });
  }
  function existing(tok, loc, uid) {
    return existingLists(tok, loc, uid).then(function (L) { return L.map(function (x) { return x.name; }); });
  }

  /* ---------- force the order: Waiting → Sam → Mia → Stop → Other ---------- */
  // Captured from the UI drag: PUT /contacts/smartlist/{id} {displayOrder, locationId}.
  // Runs after every build so restores land in the right slot, not at the end.
  // Best-effort: an ordering hiccup must never fail a successful build.
  function reorder(tok, loc, uid) {
    var defs = definitions({ status: 'x', type: 'x' });
    return existingLists(tok, loc, uid).then(function (L) {
      return defs.reduce(function (chain, d) {
        return chain.then(function () {
          var hit = L.find(function (x) { return x.name === d.name && x.id; });
          if (!hit) return;
          return api(S, '/contacts/smartlist/' + hit.id, tok, {
            method: 'PUT', body: { displayOrder: d.order, locationId: loc }
          }).catch(function (e) { console.warn('[ot-smartlists] reorder skipped for ' + d.name, e.message); });
        });
      }, Promise.resolve());
    }).catch(function (e) { console.warn('[ot-smartlists] reorder pass skipped', e.message); });
  }

  /* ---------- build one ---------- */
  function buildOne(tok, loc, def) {
    return api(S, '/contacts/smartlist', tok, {
      method: 'POST',
      body: {
        listName: def.name,
        locationId: loc,
        displayOrder: def.order,   // your flow: Waiting → Sam → Mia → Stop → Other
        columns: def.columns,
        sortSpecs: def.sort,
        filterSpecs: def.spec
      }
    }).then(function (j) {
      var id = j && j.smartList && j.smartList.id;
      if (!id) throw new Error('no id returned for ' + def.name);
      // share immediately — never cache this id, sharing changes what search returns
      return api(A, '/smartlist/share_with_all', tok, {
        method: 'POST', body: { smartlist_id: id }
      }).then(function () { return def.name; });
    });
  }

  /* ---------- UI ---------- */
  var TATE_IMG = 'https://assets.cdn.filesafe.space/i4rM5yzyWVChiudy75qX/media/6a9771e49b2eaead5c292992.webp';
  var CSS = [
    '#ot-sl-bar{position:relative;z-index:50;margin:0 0 14px;padding:14px 18px;border-radius:14px;',
    'background:#1E3A5F;color:#fff;display:flex;align-items:center;gap:16px;flex-wrap:wrap;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    'border:1px solid rgba(255,255,255,.08);box-shadow:0 8px 24px rgba(15,31,51,.25)}',
    '#ot-sl-bar.ot-float{position:fixed;top:14px;left:50%;transform:translateX(-50%);',
    'width:min(920px,calc(100vw - 28px));margin:0;z-index:9999}',
    '#ot-sl-bar .ot-av{flex-shrink:0;width:48px;height:48px;border-radius:50%;object-fit:cover;',
    'border:2px solid #E85A33;box-shadow:0 4px 12px rgba(0,0,0,.3)}',
    '#ot-sl-bar .ot-t{flex:1 1 320px;min-width:0}',
    '#ot-sl-bar .ot-who{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;',
    'color:#E85A33;margin-bottom:3px;display:flex;align-items:center;gap:6px}',
    '#ot-sl-bar .ot-dot{width:7px;height:7px;border-radius:50%;background:#E85A33;display:inline-block}',
    '#ot-sl-bar.ot-busy .ot-dot{background:#f5a623;animation:otSlPulse 1s ease-in-out infinite}',
    '#ot-sl-bar.ot-ok .ot-dot{background:#22c55e}',
    '#ot-sl-bar.ot-err .ot-dot{background:#ef4444}',
    '@keyframes otSlPulse{0%,100%{opacity:.4}50%{opacity:1}}',
    '#ot-sl-bar .ot-t b{display:block;font-size:15px;font-weight:800;margin-bottom:2px;color:#fff}',
    '#ot-sl-bar .ot-t span{font-size:13px;color:rgba(255,255,255,.7);line-height:1.45}',
    '#ot-sl-bar.ot-err .ot-t span{color:#fca5a5}',
    '#ot-sl-go{flex-shrink:0;border:0;border-radius:50px;cursor:pointer;padding:12px 22px;',
    'font:800 14px/1 inherit;background:#E85A33;color:#fff;box-shadow:0 4px 14px rgba(232,90,51,.35);',
    'transition:background .18s,transform .18s}',
    '#ot-sl-go:hover:not(:disabled){background:#f06c46;transform:translateY(-1px)}',
    '#ot-sl-go:disabled{opacity:.55;cursor:default;transform:none}',
    '#ot-sl-bar.ot-ok #ot-sl-go{background:#22c55e;box-shadow:0 4px 14px rgba(34,197,94,.3)}'
  ].join('');

  function styleOnce() {
    if (document.getElementById('ot-sl-css')) return;
    var s = document.createElement('style');
    s.id = 'ot-sl-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function mountPoint() {
    // sit above the contacts table; fall back to the top of the main panel
    var el = document.querySelector('.hl_contacts--body') ||
             document.querySelector('#contacts-list') ||
             document.querySelector('.hl-main-content') ||
             document.querySelector('main');
    if (el) return { host: el, floating: false };
    return { host: document.body, floating: true };   // never silently fail to render
  }

  function render(missingCount, onGo) {
    styleOnce();
    var host = mountPoint();
    var old = document.getElementById('ot-sl-bar');
    if (old) old.remove();

    var all = missingCount === 5;
    var bar = document.createElement('div');
    bar.id = 'ot-sl-bar';
    bar.innerHTML =
      '<img class="ot-av" src="' + TATE_IMG + '" alt="Tate">' +
      '<div class="ot-t">' +
        '<div class="ot-who"><span class="ot-dot"></span>Tate &middot; CRM Support</div>' +
        '<b>' + (all ? 'Hey \u2014 your 5 Pro Lists aren\u2019t set up yet.'
                     : 'Hey \u2014 you\u2019re missing ' + missingCount + ' of your 5 Pro Lists.') + '</b>' +
        '<span>' + (all ? 'They show you who Sam is booking, who Mia\u2019s chasing, and who\u2019s waiting on you. I\u2019ll build and share them with your whole team \u2014 consider it handled.'
                        : 'I\u2019ll restore the missing ones and share them with your team. Nothing else gets touched.') + '</span>' +
      '</div>' +
      '<button id="ot-sl-go">' + (all ? 'Let Tate build them' : 'Restore ' + missingCount + ' lists') + '</button>';
    if (host) { host.insertBefore(bar, host.firstChild); }
    else { bar.classList.add('ot-float'); document.body.appendChild(bar); }
    document.getElementById('ot-sl-go').addEventListener('click', onGo);
    return bar;
  }

  function setBar(state, title, sub, busy) {
    var bar = document.getElementById('ot-sl-bar');
    if (!bar) return;
    var keepFloat = bar.classList.contains('ot-float');
    bar.className = (state || '') + (keepFloat ? ' ot-float' : '');
    bar.querySelector('.ot-t b').textContent = title;
    bar.querySelector('.ot-t span').textContent = sub || '';
    var btn = document.getElementById('ot-sl-go');
    if (btn) { btn.disabled = !!busy; if (busy) btn.textContent = 'Building\u2026'; }
  }

  /* ---------- run ---------- */
  function start() {
    var loc = locationId();
    if (!loc) return;

    token().then(function (tok) {
      var uid = userId(tok);
      if (!uid) throw new Error('no user id in token');
      if (!isAdmin(tok)) return;            // plain users: never show the banner

      return existing(tok, loc, uid).then(function (names) {
        var missing = definitions({ status: 'x', type: 'x' })
          .filter(function (d) { return names.indexOf(d.name) === -1; });
        if (!missing.length) return;          // all five present — render nothing

        render(missing.length, function () {
          setBar('ot-busy', 'On it \u2014 building your lists\u2026', 'Give me a few seconds.', true);

          // Re-check what exists RIGHT NOW — never trust the page-load snapshot.
          // A retry after a partial failure, a double-click, or a second admin
          // building at the same moment would otherwise create duplicates.
          Promise.all([resolveFields(tok, loc), existing(tok, loc, uid)]).then(function (r) {
            var f = r[0], nowNames = r[1];
            var defs = definitions(f).filter(function (d) { return nowNames.indexOf(d.name) === -1; });
            if (!defs.length) return [];
            var done = [];
            return defs.reduce(function (chain, d) {
              return chain.then(function () {
                return buildOne(tok, loc, d).then(function (n) { done.push(n); });
              });
            }, Promise.resolve()).then(function () {
              return reorder(tok, loc, uid).then(function () { return done; });
            });
          }).then(function (done) {
            setBar('ot-ok', 'Done \u2014 ' + done.length + ' list' + (done.length === 1 ? '' : 's') + ' built and shared with your team.',
                   'Refresh the page and they\u2019re yours.', true);
            var btn = document.getElementById('ot-sl-go');
            if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; btn.onclick = function () { location.reload(); }; }
          }).catch(function (e) {
            console.error('[ot-smartlists]', e);
            setBar('ot-err', 'Hit a snag building your lists.',
                   (e && e.message ? e.message : 'Unknown error') + ' \u2014 nothing was changed by the failed step. Try again, or ping support and I\u2019ll sort it.', false);
            var btn = document.getElementById('ot-sl-go');
            if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
          });
        });
      });
    }).catch(function (e) { console.error('[ot-smartlists]', e); });
  }

  /* ---------- only on the contacts area, and survive SPA nav ---------- */
  var lastPath = '';
  function tick() {
    var p = location.pathname;
    if (p === lastPath) return;
    lastPath = p;
    var bar = document.getElementById('ot-sl-bar');
    if (bar) bar.remove();
    if (!/\/contacts(\/|$)/.test(p)) return;
    window.__otSmartlistsRan = false;
    setTimeout(function () {
      if (window.__otSmartlistsRan) return;
      window.__otSmartlistsRan = true;
      start();
    }, 1200);
  }
  setInterval(tick, 800);
  tick();
})();
