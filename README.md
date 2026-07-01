# Lex Digitalis — India's Tech-Law Atlas (1885–2025)

An offline-first, single-page interactive atlas of **149 Indian technology, cyber,
telecom, data-protection and identity instruments**, rendered as **one animated
node-canvas that re-organises itself under five analytical lenses**.

Every instrument is a node. Switching lenses re-lays-out every node with a smooth
transition — nodes keep their identity and colour across lenses. The data tells three
stories, and the structure is engineered to surface all three:

1. **The big bang** — a century of near-silence, then an explosion after 2016. The
   *Timeline* lens + *play-through-time* scrubber makes it visceral.
2. **Few powers, many exercises** — the *Power* lens collapses dozens of notifications
   into a handful of statutory levers and lays bare that ~30 are the *same move*
   (s.70 protected-system designations) repeated bank by bank.
3. **Genealogy** — the *Family* lens shows the IT Act and Aadhaar Act as giants spawning
   rules spawning notifications, plus the amendment chains (Right-of-Way rules; the
   S.O. 371(E) series).

## The five lenses

| Lens | Layout |
| --- | --- |
| **Timeline** (default) | x = date (1885→2025), horizontal swim-lanes by domain, a regulatory-velocity area chart behind the lanes, inflection annotations. Undated / proposed instruments park in a right-hand gutter. |
| **Family** | clustered by parent statute (IT Act 2000, Aadhaar Act 2016, Telecom Act 2023, Telegraph Act 1885, TRAI Act 1997, Standalone). |
| **Power** | clustered by empowering section (s.70, s.79A, s.69A, s.69B, s.46, s.88, s.7, none). |
| **Instrument** | clustered by Act / Rule / Regulation / Notification / Policy-Framework / Order. |
| **Status** | In force / Draft-Proposed / Superseded-Rescinded / Consolidated. |

Colour = domain (consistent everywhere). Node size = instrument weight
(Act > Rule/Regulation > Policy > Notification/Order).

## Features

- **Play-through-time** — animate nodes appearing in chronological order, driving the
  velocity chart forward. Scrubber + speed control. Respects `prefers-reduced-motion`.
- **Cross-filter** — a left filter rail (domain, section, instrument, status, decade) and
  a **time brush** on the Timeline lens. Filtering dims non-matching nodes live across
  every lens.
- **Search + Command palette** — fuzzy search (Fuse.js) over title/description/entity/tags,
  plus **⌘/Ctrl-K** to jump to any instrument, switch lens, or run a command.
- **Detail drawer** — full metadata + a *Related* list (same section, same family, same
  amendment lineage); clicking a related item navigates within the drawer.
- **Story mode** — five curated insight cards that set the right lens + filter to reveal a
  finding.
- **Deep links** — lens + filters + selected node are encoded in the URL (shareable).
- **Export** — the current filtered set to CSV.
- **Dark mode**, full keyboard navigation, ARIA labels, WCAG-AA-minded contrast, and a
  responsive mobile/tablet grouped-list fallback.

## Colour theme

- Brand: **Llama** `#620d3c` (deep plum) + **Marigold** `#f1a222`.
- Backgrounds: white / pale yellow `#fffbe2`. Dark mode on a near-black ink ground.
- Eight muted, harmonious, colourblind-distinguishable domain hues anchored by the two
  brand colours.

## Run

```bash
npm install
npm run data      # (optional) re-parse the xlsx → src/data/laws.json
npm run dev       # dev server
npm run build     # static, offline-ready bundle in dist/
npm run preview
```

The app ships a pre-built `src/data/laws.json`, so `npm run dev` works without Python.

## Data pipeline & derivation rules

Source of truth: `data/India_Technology_Laws_Compendium.xlsx`. The build script
`scripts/build-data.py` (Python + openpyxl) parses it into `src/data/laws.json`.

The sheet mixes **section-header rows** (a name, no date, no description) that establish
context, and **data rows** (149 actual instruments). Derivations — **please eyeball and
correct**; every rule lives in editable tables at the top of `build-data.py`:

- **domain** — carried down from the section header the row sits under, then overridden for
  protected-system rows: bank/insurer/registrar declarations → **Banking & Finance**
  (tagged `protected system` so they still cluster under s.70); AIIMS → **Healthcare**;
  UIDAI-CIDR → **Identity/Aadhaar**; other govt/critical-infra → **IT & Cyber Security**.
- **instrumentType** — notification *verbs* win first ("Declaration of… under the X Act" is
  a Notification, not an Act), then instrument nouns (Rules/Regulations/Order/Policy), then
  a bare statute → Act.
- **empoweringSection** — regex for s.70/70A (protected systems), s.79A (examiner of
  evidence), s.69A (blocking), s.69B (monitoring), s.46 (adjudication), s.88 (advisory),
  s.7 (Aadhaar). s.70A is folded into the s.70 cluster.
- **status** — Draft/Proposed ("not yet in force", "public consultation"); Superseded/
  Rescinded ("rescind"/"withdraw"); Consolidated ("consolidated text"/"as amended in");
  else In force.
- **entity** — extracted from protected-system titles (HDFC, ICICI, NPCI, LIC, AAI, AIIMS,
  NCRB, NIA, CAMS, Kfin, CERSAI, …).
- **lineageId** — groups the Indian Telegraph Right-of-Way 2016 + amendments, and the
  S.O. 371(E) / NFSA Aadhaar-deadline chain.

### Date parsing caveats (the sheet is inconsistent)

- Prefixes stripped: *Enacted/Commenced/Released/Enforced/Notified/Passed by* …
- Most dates are `dd/mm/yyyy`; a few are US `M/D/Y` (e.g. IT Act `10/17/2000` = 17 Oct 2000).
  Disambiguated by which component exceeds 12; ambiguous cases default to Indian `dd/mm`.
- Text values ("Proposed / Not yet in force") set a status and park the node off-timeline.
- A small **gazette-date override** table flags known corrections (Telecom Cyber Security
  Rules 21 Nov 2024; Critical Telecom Infra & Temporary Suspension 22 Nov 2024; Lawful
  Interception 6 Dec 2024) — the drawer shows the sheet date plus a gazette note.

## Two editorial defaults (flip freely)

- **Default lens = Timeline** (story-first).
- **Bank protected-system rows = Banking & Finance** domain + an `s.70` tag (so they colour
  by sector but still cluster under the Power lens).

## Tech

Vite · React · TypeScript · Tailwind · D3 (scales/shape) · Framer Motion (FLIP transitions
& drawer) · Fuse.js · Zustand. SVG canvas (149 nodes — no WebGL needed). Fully static.

## Licence

Data compiled for reference; code released for educational/analytical use.
