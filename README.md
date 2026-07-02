# India's Tech Laws · 1885–2025

An offline-first, single-page interactive atlas of **324 central-government instruments**
governing India's digital, cyber, telecom, data, identity, frontier/strategic-technology and
clean-tech domains — from the 1885 Telegraph Act to 2025. Each instrument is coded on 16
analytical fields, so the corpus can be filtered, pivoted and cross-tabbed.

**Live:** https://tannmay-python.github.io/techLawsList/

## Four ways in

- **Overview** — the landing view: headline stats, the regulatory-velocity chart, the nine
  domain worlds, and guided insights that jump straight to a finding.
- **Atlas** — one animated node-canvas that re-organises under seven lenses (Timeline,
  Domain, Family, Power, Instrument, Status, Hard-vs-soft), with play-through-time, a time
  brush, and a full filter rail. Nodes keep identity + colour across lenses.
- **Dashboard** — the analytics the data unlocks: regulatory velocity, hard-vs-soft-law
  ratio, domain distribution, a ministry turf map, a penalty-type breakdown, an
  extraterritoriality list, a contestation map (landmark litigation), and an India↔global
  regime linkage view.
- **Explore** — the full repository as a sortable, searchable, deep-linkable table with
  CSV export.

A rich **detail drawer** (all 16 facets, a penalty meter, compliance-burden flags, judicial
status, international linkages, a primary-source link, and related-instrument navigation) is
available from every view. **⌘/Ctrl-K** opens a command palette; every view + filter +
selection is encoded in the URL for sharing.

## Design

- Single colour scheme — **Llama** `#620d3c` + **Marigold** `#f1a222` on a pale-yellow
  `#fffbe2` / white ground. Nine harmonious super-domain hues anchored by the two brand
  colours. No dark mode.
- Fraunces (display serif), Inter (UI), JetBrains Mono (dates/sections). Purposeful motion
  only; honours `prefers-reduced-motion`.

## Run

```bash
npm install
npm run data      # (optional) re-parse data/India_Technology_Laws_Compendium_1.xlsx → src/data/{laws,meta}.json
npm run dev       # dev server
npm run build     # static, offline-ready bundle in dist/
npm run preview
```

The app ships pre-built JSON, so `npm run dev` works without Python.

## Data pipeline & derivation rules

Source of truth: `data/India_Technology_Laws_Compendium_1.xlsx` (17 columns, 324 instruments
across 46 sections, plus an About sheet). This edition follows the source's "widest reading"
of tech law — beyond core digital/cyber, it also covers navigation/PNT, subsea cables,
spectrum & 5G/6G, electric mobility & batteries, clean energy, advanced manufacturing,
deep-tech & digital markets, agritech, medtech and fintech-regtech.
`scripts/build-data.py` (Python + openpyxl) normalises it into `src/data/laws.json` and
aggregates `src/data/meta.json`.

Most facets are supplied in the sheet. The script derives the extras:

- **group** — each raw Domain maps to one of nine colour super-domains (Core IT & Cyber,
  Digital Identity, Telecom & Media, Data & Privacy, Finance & Fintech, Frontier Tech,
  Strategic & Deep-Tech, Industrial & Clean-Tech, E-Governance).
- **parentStatute** — from Legal basis (IT Act, Aadhaar Act, Telegraph/Telecom Act, TRAI,
  DPDP, MMDR, PSS) with section-header fallback.
- **empoweringSection** — explicit "section NN" references always win; loose keyword
  matches (protected system, blocking, examiner…) apply only in IT-Act context, so a
  standalone Act that merely mentions "blocking" is not mis-tagged.
- **hardLaw / coercionRank** — binding force → hard vs soft; penalty regime → a 0–3 rank.
- **complianceFlags** — parsed from the compliance column (reporting, data localisation,
  mandatory officer, registration/licensing, audit, consent).
- **intlRegimes** — the international-linkage column split into individual regimes.
- **sourceUrl / sourceExact** — a verified direct government URL where one has been
  individually researched and checked (see `scripts/link-overrides.json`); otherwise a
  precise official-source search that lands on the exact document. No URLs fabricated —
  every "exact" link has been checked with a real HTTP request, not assumed from a search
  result appearing plausible.
- **lineageId / entity** — amendment chains (RoW rules, S.O. 371(E), IT Rules 2021, MMDR,
  offshore minerals, biodiversity, Aadhaar authentication) and protected-system entities.

**Date parsing** strips prefixes (Enacted/Commenced/Assented/Notified…), handles US `M/D/Y`
(the IT Act's `10/17/2000` = 17 Oct 2000), and anchors on the sheet's Year column when only
a year is given.

### Verifying links

`sourceExact: true` means the URL was individually checked with a real HTTP request (status
+ content size, not just "curl returned 200") — some Indian government sites are
client-rendered SPA shells that return an identical 200 for both real and fabricated URLs,
so a bare status check is not sufficient; see the git history for the verification method.
`sourceExact: false` means the entry uses a precise official-source search instead, which is
common for individual gazette notifications that have no stable public deep link. To upgrade
a link, add a verified URL to `scripts/link-overrides.json` keyed by instrument `id` and
re-run `npm run data`.

### Caveats (from the source's own methodology note)

Descriptive fields are drawn from primary/official material; the coded facets are a
structured first pass — reliable for filtering and pattern-spotting, to be spot-checked
before citation. Judicial status flags well-known cases only. Central-government instruments
only; state laws excluded by design. A few items are administrative directives without a
single consolidated gazette instrument (flagged as such in their description); drafts are
marked Draft/Proposed. To correct a mis-tagged row, edit the tables at the top of
`build-data.py` and re-run `npm run data`.

## Deployment

Pushed to `main`, the GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and
publishes `dist/` to GitHub Pages. The Vite `base` is relative, so the bundle also runs from
any static path or fully offline (`open dist/index.html`).

## Tech

Vite · React · TypeScript · Tailwind · D3 (scales/shape) · Framer Motion · Fuse.js ·
Zustand. SVG canvas (324 nodes — no WebGL). Fully static.
