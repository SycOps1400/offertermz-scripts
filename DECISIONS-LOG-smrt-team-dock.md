# DECISIONS LOG — SMRT Team Dock & AI Status System

Running record of everything agreed in design discussions. Only settled decisions and items explicitly parked for later. Updated as discussions continue.

Last updated: Sep 2, 2026 — D1–D20 locked. Shipped to sandbox: dock v6 (status rings + Sam three-voice popup + live webhook), loader v9, chooser. Sam's Make scenario live. Next: v6 sandbox test, then Mia-side workflow wiring (field-change → Conversation AI + Mia conclusion rewrites). Shipped to sandbox: dock v3, loader v9, whitelabel chooser. Sam toggle build starts after D17/D18 close.

---

## DECIDED

### D1 — One central Mia page (per-subaccount pages abandoned)
- Mia (and future Ruby/Tate pages) live on ONE central page: **www.offertermz.com/mia** (HQ-hosted in GHL).
- Per-subaccount Mia pages are dead: the button supplies everything the page can't read for itself.
- Fix a bug once, every subscriber gets it. No Mia page in the snapshot, no per-domain deploys.

### D2 — The button supplies all context via URL
Full contract the dock builds on every Mia click:
`?contact=…&location_id=…&first_name=…&phone=…&street_name_and_suffix=…&assigned_user=…&company=…`
- contact + location_id: read from the CRM page URL.
- first_name / phone: read from rendered fields. Phone label is **"Phone (Primary)"** (plain "Phone" kept as fallback) — sandbox caught the exact-match miss.
- assigned_user: owner dropdown (#owner-dropdown-trigger, never #hr-ellipsis-id); UNASSIGNED nudge inherited from ot-closer v4.
- company: scraped from sidebar `.hl_switcher-loc-name` (DOM holds full untruncated text).

### D3 — Company parentheses rule + "working for"
- Subaccount naming convention "Person (Company LLC)": text inside parentheses when present, else the whole name.
- Mia page wording changed to "Followup Specialist **for** {company}" — reads fine even unparsed.

### D4 — street_name_and_suffix is DERIVED, not scraped
- The hidden AI-values custom field is never read (its folder will be hidden).
- The dock mirrors the GHL workflow's transformation code EXACTLY (drop house number/range, drop trailing unit designators, tidy whitespace).
- Known & accepted: directionals are KEPT ("1234 North West Main St" → "North West Main St") — that is what the workflow truly does. Change requires updating both places together.
- Make scenario unchanged — already looks up subscribers by Location ID.

### D5 — Team Dock replaces buttons + lead strip
- The navy dock pill replaces the three header buttons AND the floating lead pill.
- Lead pill survives as a compact chip INSIDE the dock (left end) — same First Name + Street Address read, updates every lead hop.
- Contact-record pages only (tools were functionally contact-only anyway).
- Sam & Mia: color portraits, orange ring. Ruby & Tate: grayscale + gray ring, "in training." Tools (Analyzer / Comps / Closer): white circles, navy icons, same ring family.
- Portraits: 512×512 WebP on GHL CDN (assets.cdn.filesafe.space), ~117KB total for all four. Identical crop recipe (square from y=80, LANCZOS).
- Sam is passive in v1 — presence only, no click action.

### D6 — Mia click = dim + enlarge popup
- Dim overlay (navy-tinted rgba(14,26,43,0.72)) + centered popup frame loading the central Mia URL in an iframe.
- Animation: popup starts collapsed at Mia's circle position and scales to center — "she comes to life."
- Verified: GHL-hosted pages allow iframe embedding (tested in live CRM before building).
- Popup sizing (v3): min(650px, 96vw) × min(900px, 92vh) — no scrollbar on standard monitors; small screens scroll gracefully (accepted).

### D7 — Whitelabel loader chooser (sandbox is self-testing)
- The agency whitelabel code box now runs a chooser: sandbox location → `@dev/ot-loader.js` + Date.now() cache-buster; every other subaccount → pinned release tag.
- The sandbox now tests the ENTIRE stack (loader included) before anything is tagged. True sandbox-first, permanently.
- Production go-live lever unchanged: bump the pinned tag in the chooser.

### D8 — Purge rule, corrected
- The chooser's cache-buster only saves the LOADER from purges.
- **Module-file commits to dev still require a jsDelivr purge, every time** — jsDelivr internally pins @dev to a commit for up to 12 hours regardless of query strings.
- Rule: every commit to dev = purge the changed module files before testing.

### D9 — Dock rollout flag (loader v9)
- `ENABLE_DOCK_EVERYWHERE = false` → dock is sandbox-only; production keeps the exact v8 experience (buttons + lead strip).
- In dock mode the loader skips creating header buttons and skips loading ot-leadstrip.js. Nothing deleted; all restorable.
- Rollout = flip the flag in a release tag (same playbook as ENABLE_CLOSER_EVERYWHERE).

### D10 — AI status moves from tags to ONE dropdown field
- A single dropdown custom field in the Contact folder (always visible) becomes the AI active-status source of truth.
- Readable by the dock via the same label-reader as every other field; writable via the same GHL API PUT plumbing Mia already uses.
- Tags retire from status duty. Rationale: tag chips collapse/truncate and are hostage to user habits (two dozen tags = unreadable).

### D11 — One field, two lanes
- A lead is never both seller and buyer in one record → the SAME field governs Sam (seller lane) and Ruby (buyer lane).
- Ruby's status architecture is inherited for free the day she wakes up.

### D12 — Sam has THREE states
- **On** — actively conversing (GHL Conversation AI active).
- **Standby** — armed, waiting: exists ONLY via Mia's "give it to Sam when the lead responds" handoff. Sam is doing nothing until the lead replies.
- **Off** — benched; Conversation AI off.

### D13 — Dock status visual language (traffic-light instinct)
- On = bright portrait + orange ring + **green dot**.
- Standby = bright portrait + orange ring + **amber dot** (label "standby").
- Off = dimmed portrait, no dot (still clickable → toggle popup).
- Training = grayscale (unchanged).
- The dock is the customer's status board: one glance answers "who's working this lead?" No tag/field archaeology.

### D14 — Mia's conclusions write the field deliberately
- "Give it to Sam when the lead responds" → **Sam Standby**.
- "Stop talking and text me" → **Sam Off**.
- "Stop talking, I'll read it when I log in" → **Sam Off**.
- Never left untouched — all three endings set the field.
- The GHL workflow triggered on the field change does the machinery: activate/deactivate Conversation AI + dated note (same jobs the tag workflows do today).

### D15 — "Sam Standby" doubles as the Mia-active signal
- Standby can ONLY exist while Mia is mid-followup with a handoff armed → the dock lights Mia bright from that single value.
- Gap: the two "stop talking" endings leave Mia invisible in the dropdown. Until her 4 fields are hidden, her ring reads those fields directly.
- **Flag planted:** hiding the Mia fields folder requires a new always-visible Mia breadcrumb FIRST (e.g., Mia flavor in the dropdown values).

### D16 — Accepted risk: manual dropdown fiddling
- A customer can manually set "Sam Standby," falsely lighting Mia, then file a ticket.
- Rare, self-inflicted, 10-second diagnosis. Revisit only if tickets prove otherwise.

### D19 — Sam's popup: built-in, three voices, standby two-step
- Sam's popup stays BUILT-IN (no hosted page): he does one thing forever, so instant beats extensible. The Mia-style hosted-page pattern is reserved for employees whose functionality earns it.
- Language law: Sam TEXTS — never "talks," never "on the phones." (Enforced by test.)
- ON view: "on the clock… texting with {lead} and working to book you a call." Off = "you become the person in charge" (taking the wheel, not losing a feature). One button.
- OFF view: mirror framing, one button (Turn Sam On).
- STANDBY view: breakroom line + TWO buttons:
  - "Turn Sam On" → playful no-op ("he kinda IS on… give him a break 😉"). Architecturally correct: Sam only responds to inbound, so going fully On during standby only ends Mia's nurturing for zero benefit.
  - "Turn Sam Off" → confirmation ("who takes care of the lead?") with Keep Sam on Standby (no change) or "Turn Sam Off — just notify me when {lead} responds" → writes **Mia Following Up & Sam Off**; the field-change workflow rewrites Mia's conclusion to notify-me so a forgotten toggle can never ghost-tag Sam back in or silently lose a deal.
- Write failure → popup returns to main view, nothing changes, honest alert.

### D20 — Panel-tab reality: All-fields autoswitch + cached truth
- GHL only mounts the field folders under the side panel's "All fields" tab; DND/Actions unmount them entirely. Two consequences, two fixes:
- **Autotabs v3:** on load/lead-hop, ensure the All-fields tab is active FIRST (.hr-tabs-tab[data-name="all-fields"], active class hr-tabs-tab--active, throttled click) before opening folders. Loop stops at READY, so users are never yanked back from DND/Actions afterward. (Autotabs v2 en route: fast 400ms window ~10s, then patient 3s retries forever — the old permanent give-up caused the refresh-fixes-it pulsing.)
- **Dock v10 — cached truth:** the dock remembers the last successfully READ status + lead-chip text per contact; when the panel is away (canary: First Name label absent), it shows the remembered state instead of false-gray rings and a vanishing chip. Keyed by contactId — never the wrong lead. No cache = honest all-dim (no invented truth).
- Accepted edge: a workflow changing status while the user sits on DND/Actions shows the cached value until return or lead hop. Seconds of staleness beats guaranteed false-off on every tab switch.

---

## PENDING DECISIONS

*(D18 moved to DECIDED — see below in place)*

### D17 — Exact strings (LOCKED — customer-facing, character-for-character)
- Field label: **AI Team Status** (Contact folder — always rendered, autotabs guarantees it open).
- Values:
  1. **Sam On**
  2. **Sam Off**
  3. **Mia Following Up & Sam On Standby**
  4. **Mia Following Up & Sam Off**
  5. (future) **Ruby On** / **Ruby Off** join the same field.
- Values 3–4 make the field Mia-complete: the dropdown alone tells the whole story with zero inference — chosen deliberately for the user base. This fully unblocks P1 (hiding the Mia fields folder): the dropdown IS Mia's breadcrumb now.
- Mia conclusion mapping: "give it to Sam when the lead responds" → 3; "text me, I'll take it from here" → 4; "I'll read it when I log in" → 4.
- Dock truth table: 1 = Sam green / Mia dim · 2 = both dim · 3 = Sam amber "standby" / Mia green · 4 = Sam dim / Mia green · empty = all dim (pre-migration only).
- Ampersand "&" (not "and"), capitalization as written — hardcoded in dock reader, Make scenario, Mia page writes, and GHL workflows.
- NEW QUESTION spawned (see P3): when the lead responds and Mia goes quiet, the on-response workflow must move value 3 → "Sam On" and value 4 → "Sam Off" so the field never goes stale.

### D18 — Empty-field default: everything off (LOCKED)
- **The field is written at lead creation:** existing automations (updated from tag-adds to field-writes) set the value at birth — "Sam On" by default, or "Sam Off" when the subscriber's custom value opts out of Sam-on-creation. The bot must be on pre-inbound, so creation workflows already run this logic today via tags.
- **Empty = Sam off AND Ruby off.** Empty only exists on pre-migration leads; the system never produces it going forward.
- Accepted caveat: pre-migration leads where Sam is truly on (old tag) show him dim until touched. Fix if it ever matters: one-time bulk backfill. Not now.
- Ahmed's task: update the creation/on-off automations to write the dropdown instead of adding tags.

---

## PARKED FOR LATER

- **P1 — Hide "Mia AI Followup+" folder in GHL** (original Step 4 item). UNBLOCKED by D17 — the dropdown is now Mia's complete breadcrumb.
- **P2 — Retire the old per-subaccount mia.html on the sandbox** so nobody ever hits the stale copy.
- **P3 — Mia turn-off story:** largely answered by D17 — the on-response machinery gains one field-update action (value 3 → "Sam On", value 4 → "Sam Off"). Remaining design: customer manually stopping followup mid-stream (lead leaves workflow + field update path).
- **P4 — Tate's on/off structure:** undecided entirely.
- **P5 — Ruby & Tate hover teasers** ("Dispositionist · coming soon") — free marketing real estate, currently plain titles.
- **P6 — Release runway (when ready):** PR dev→main (file-count check: 3 files — ot-loader.js modified, ot-team-dock.js new, test-team-dock.js new) → tag v1.2.11 → bump pinned URL in the chooser. Dock stays flag-off in production until a separate flip tag. Possible CCC demo first.
- **P8 — audit-log for toggles: RESOLVED in dock v8+v9.** Every Sam toggle payload now carries: contactId, Location ID, value, assigned_user (UNASSIGNED fallback), ISO timestamp, action transition ("Off to On" / "Standby to Off" …), and logged_in_user + id + email via GHL's OFFICIAL AppUtils.Utilities.getCurrentUser() (documented Custom JS wrapper — verified live in the whitelabel custom-code context; falls back to UNKNOWN so the toggle never breaks). Source IP remains capturable server-side by Make. Ahmed's Airtable toggle-log table maps these directly.
- **P9 — AppUtils treasures for future refactors:** the official Custom JS wrappers also expose getCompany() → {id, name}, getCurrentLocation() → {id, name, address} (candidate replacement for the sidebar company scrape), and routeLoaded/routeChangeEvent window events (candidate replacement for the dock's URL-polling loop). Docs: marketplace.gohighlevel.com/docs/marketplace-modules/custom-js.
- **P7 — reconcile the local tools-offertermz project** (uncommitted calculator.html change + untracked design spec; repo not publicly on GitHub — verify remote or accept live GHL pages as source of truth).

---

## STANDING RULES (established this project)

- Sandbox-first always: dev branch + chooser → test → PR → tag → whitelabel bump. Rollback = revert the pinned URL in one save.
- Every dev commit = purge changed module files (loader exempt via chooser).
- File-count check before every commit AND every PR merge.
- The dock never lies: a ring state must always reflect a readable truth on the page. When a source of truth is about to be hidden, a replacement breadcrumb ships first.
- Derived values (street) must mirror their workflow twins exactly — change both or neither.
- OfferTermz brand system throughout (navy #1E3A5F, orange #E85A33, GHL-armored hardcoded hex).
