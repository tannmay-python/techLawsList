#!/usr/bin/env python3
"""
build-data.py — Lex Digitalis data pipeline.

Parses /data/India_Technology_Laws_Compendium.xlsx into src/data/laws.json.

The sheet has three columns (Name, Date, Description) and mixes two kinds of
rows: SECTION HEADER rows (a name, no date, no description) that establish the
parent-statute / domain context, and DATA rows (an actual instrument). There
are 149 data rows.

Every derivation rule below is documented in README.md so mis-tagged rows can
be corrected by editing the OVERRIDES tables here and re-running this script.

Run:  python3 scripts/build-data.py
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl required:  pip install openpyxl")

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "data" / "India_Technology_Laws_Compendium.xlsx"
OUT = ROOT / "src" / "data" / "laws.json"

# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------
DOMAINS = [
    "IT & Cyber Security",
    "Banking & Finance",
    "Healthcare",
    "Telecom",
    "Broadcasting & Media",
    "Data Protection & Privacy",
    "Identity/Aadhaar",
    "E-governance",
]

# Section-header text -> (parentStatute, default domain) context that flows
# down to the rows beneath it, until the next header.
HEADER_CONTEXT = {
    "INFORMATION TECHNOLOGY ACT, 2000": ("IT Act 2000", "IT & Cyber Security"),
    "Rules / Regulations on the IT Act": ("IT Act 2000", "IT & Cyber Security"),
    "Notifications on the IT Act": ("IT Act 2000", "IT & Cyber Security"),
    "Cyber Security": ("Standalone", "IT & Cyber Security"),
    "Banking and Financial Sector": ("Standalone", "Banking & Finance"),
    "Healthcare Sector": ("Standalone", "Healthcare"),
    "TELECOMMUNICATIONS ACT": ("Telecom Act 2023", "Telecom"),
    "Rules on the Telecommunications Act": ("Telecom Act 2023", "Telecom"),
    "Notifications on the Telecommunications Act": ("Telecom Act 2023", "Telecom"),
    "TELECOM REGULATORY AUTHORITY OF INDIA (TRAI) ACT, 1997": ("TRAI Act 1997", "Telecom"),
    "TRAI Rules": ("TRAI Act 1997", "Telecom"),
    "TELEGRAPH ACT": ("Telegraph Act 1885", "Telecom"),
    "Telegraph Act Notifications": ("Telegraph Act 1885", "Telecom"),
    "Telecommunications / Broadcasting Sector": ("Standalone", "Broadcasting & Media"),
    "Indian Telegraph Right of Way (RoW) Rules, 2016": ("Telegraph Act 1885", "Telecom"),
    "E-governance and Digital Services": ("Standalone", "E-governance"),
    "CERT-In Guidelines (all guidelines at cert-in.org.in)": ("Standalone", "IT & Cyber Security"),
    "Data Protection and Privacy Regulations": ("Standalone", "Data Protection & Privacy"),
    "AADHAAR ACT": ("Aadhaar Act 2016", "Identity/Aadhaar"),
    "Rules / Regulations on the Aadhaar Act": ("Aadhaar Act 2016", "Identity/Aadhaar"),
    "Notifications on the Aadhaar Act": ("Aadhaar Act 2016", "Identity/Aadhaar"),
    "MeitY Gazettes": ("Standalone", "E-governance"),
}

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11,
    "december": 12,
}

DATE_PREFIXES = re.compile(
    r"^\s*(enacted|commenced|released|enforced|notified|passed by parliament|"
    r"passed|effective|public consultation)\s*(on)?\s*[:\-]?\s*",
    re.IGNORECASE,
)

# Known gazette-date corrections. sheet date -> real gazette date + note.
# keyed by a substring of the title.
GAZETTE_OVERRIDES = {
    "Telecom Cyber Security": ("2024-11-21", "Gazette date 21 Nov 2024 (sheet shows a later working date)."),
    "Critical Telecommunication Infrastructure": ("2024-11-22", "Gazette date 22 Nov 2024."),
    "Temporary Suspension of Services": ("2024-11-22", "Gazette date 22 Nov 2024."),
    "Lawful Interception of Messages": ("2024-12-06", "Gazette date 6 Dec 2024 (sheet shows 3 Jan 2025)."),
}


def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:60]


def parse_date(raw):
    """Return (iso, display, status_hint) — iso may be None for text dates."""
    if raw is None:
        return None, None, None
    raw = str(raw).strip()
    if not raw:
        return None, None, None

    lower = raw.lower()
    status_hint = None
    if "not yet in force" in lower or "proposed" in lower:
        status_hint = "Draft/Proposed"
    if "public consultation" in lower or "draft" in lower:
        status_hint = "Draft/Proposed"

    cleaned = DATE_PREFIXES.sub("", raw).strip()

    # Pure text with no digits -> no date
    if not re.search(r"\d", cleaned):
        return None, None, status_hint

    # "10 February 2017"
    m = re.match(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$", cleaned)
    if m:
        d, mon, y = int(m.group(1)), MONTHS.get(m.group(2).lower()), int(m.group(3))
        if mon:
            return iso(y, mon, d), display(y, mon, d), status_hint

    # dd/mm/yyyy or M/D/YYYY (US) — disambiguate by which part exceeds 12
    m = re.match(r"(\d{1,2})[/.](\d{1,2})[/.](\d{4})", cleaned)
    if m:
        a, b, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if a > 12 and b <= 12:          # dd/mm
            d, mon = a, b
        elif b > 12 and a <= 12:        # US M/D (e.g. IT Act 10/17/2000)
            d, mon = b, a
        else:                            # ambiguous -> Indian dd/mm default
            d, mon = a, b
        try:
            return iso(y, mon, d), display(y, mon, d), status_hint
        except ValueError:
            return None, None, status_hint

    # bare year
    m = re.search(r"(\d{4})", cleaned)
    if m:
        y = int(m.group(1))
        return f"{y}-01-01", str(y), status_hint

    return None, None, status_hint


def iso(y, m, d):
    date(y, m, d)  # validate
    return f"{y:04d}-{m:02d}-{d:02d}"


def display(y, m, d):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
              "Oct", "Nov", "Dec"]
    return f"{d} {months[m-1]} {y}"


def classify_instrument(title):
    """Priority: notification-verbs beat the noun, so 'Declaration ... under
    the Aadhaar Act' is a Notification, not an Act."""
    t = title.lower()
    # 1. Action/notification verbs win first — the title is an act OF doing
    #    something under a statute, not the statute itself.
    if re.search(
        r"declar|notif|appoint|establish|extension|corrigendum|enforcement|"
        r"commencement|target date|amendment to|further amendment|designat|"
        r"authoris|power to|licensee|process|proof of|use of|permitted|entitled|"
        r"constitution|powers and functions|bringing|rescind",
        t,
    ):
        return "Notification"
    # 2. Then the instrument nouns.
    if "regulations" in t:
        return "Regulation"
    if re.search(r"\brules\b", t):
        return "Rule"
    if re.search(r"\border\b", t):
        return "Order"
    if re.search(r"policy|framework|guidelines|mission|licen[cs]e|scheme|standard", t):
        return "Policy/Framework"
    # 3. A statute in its own right.
    if re.search(r"\bact\b[\s,(]*\d{4}", t) or t.strip().endswith("act"):
        return "Act"
    return "Notification"


SECTION_PATTERNS = [
    (re.compile(r"section 70a|section 70\b|s\.?\s*70a?|protected system", re.I), "s.70"),
    (re.compile(r"section 79a|s\.?\s*79a|examiner of electronic evidence", re.I), "s.79A"),
    (re.compile(r"section 69a|s\.?\s*69a|blocking", re.I), "s.69A"),
    (re.compile(r"section 69b|s\.?\s*69b", re.I), "s.69B"),
    (re.compile(r"section 46|s\.?\s*46|adjudicating officer", re.I), "s.46"),
    (re.compile(r"section 88|s\.?\s*88|advisory committee", re.I), "s.88"),
    (re.compile(r"section 7\b|under section 7|s\.?\s*7\b", re.I), "s.7"),
]


def classify_section(title, desc):
    text = f"{title} {desc}"
    for pat, sec in SECTION_PATTERNS:
        if pat.search(text):
            return sec
    return None


ENTITY_PATTERNS = [
    ("HDFC Bank", r"HDFC"),
    ("ICICI Bank", r"ICICI"),
    ("NPCI", r"National Payments Corporation|NPCI"),
    ("LIC", r"Life Insurance Corporation|LIC"),
    ("Union Bank of India", r"Union Bank"),
    ("Punjab National Bank", r"Punjab National Bank"),
    ("Bank of Baroda", r"Bank of Baroda"),
    ("State Bank of India", r"State Bank of India"),
    ("Axis Bank", r"Axis Bank"),
    ("Kotak Mahindra Bank", r"Kotak"),
    ("Canara Bank", r"Canara Bank"),
    ("Bank of India", r"Bank of India\b"),
    ("Central Bank of India", r"Central Bank of India"),
    ("Paytm Payments Bank", r"Paytm"),
    ("YES Bank", r"YES Bank"),
    ("IDBI Bank", r"IDBI"),
    ("Indian Bank", r"Indian Bank\b"),
    ("AIIMS New Delhi", r"AIIMS|All India Institute of Medical Sciences"),
    ("NCRB", r"National Crime Records Bureau|NCRB"),
    ("NIA", r"National Investigation Agency|NIA\b"),
    ("Kfin Technologies", r"Kfin"),
    ("CAMS", r"Computer Age Management|CAMS"),
    ("CERSAI", r"CERSAI|Central Registry of Securitisation"),
    ("Airports Authority of India", r"Airports Authority"),
    ("NIC", r"National Informatics Centre|NIC email"),
    ("UIDAI CIDR", r"UIDAI-CIDR|Central Identities Data Repository|CIDR"),
    ("Govt of NCT Delhi (TETRA)", r"TETRA"),
    ("Telecom Service Providers", r"Licensed Telecom service providers|licensed telecom"),
]

# Financial entities whose protected-system rows should count as Banking & Finance
FINANCE_ENTITIES = {
    "HDFC Bank", "ICICI Bank", "NPCI", "LIC", "Union Bank of India",
    "Punjab National Bank", "Bank of Baroda", "State Bank of India",
    "Axis Bank", "Kotak Mahindra Bank", "Canara Bank", "Bank of India",
    "Central Bank of India", "Paytm Payments Bank", "YES Bank", "IDBI Bank",
    "Indian Bank", "Kfin Technologies", "CAMS", "CERSAI",
}
HEALTH_ENTITIES = {"AIIMS New Delhi"}


def extract_entity(title):
    for name, pat in ENTITY_PATTERNS:
        if re.search(pat, title, re.I):
            return name
    return None


def classify_status(title, desc, hint):
    if hint:
        return hint
    text = f"{title} {desc}".lower()
    if title.lower().startswith("consolidated") or "consolidated text" in text:
        return "Consolidated"
    if "as amended in" in title.lower():
        return "Consolidated"
    if re.search(r"rescind|withdraw", text):
        return "Superseded/Rescinded"
    if "later rescinded" in text or "was later rescinded" in text:
        return "Superseded/Rescinded"
    return "In force"


def make_tags(title, desc, section, instr, entity, status):
    tags = set()
    t = f"{title} {desc}".lower()
    if section == "s.70":
        tags.add("protected system")
    if section == "s.79A":
        tags.add("examiner of evidence")
    if section == "s.69A":
        tags.add("blocking")
    if section == "s.69B":
        tags.add("monitoring")
    if section == "s.46":
        tags.add("adjudication")
    if section == "s.88":
        tags.add("advisory")
    if section == "s.7":
        tags.add("aadhaar authentication")
    if "amendment" in t:
        tags.add("amendment")
    if "consolidated" in t:
        tags.add("consolidated")
    if "right of way" in t or "row" in title.lower().split():
        tags.add("right of way")
    if "extension" in t or "deadline" in t:
        tags.add("deadline extension")
    if "cyber security" in t or "cybersecurity" in t:
        tags.add("cyber security")
    if entity:
        tags.add("named entity")
    return sorted(tags)


def assign_lineage(title, section):
    t = title.lower()
    if "right of way" in t or "telegraph right of way" in t:
        return "row-rules"
    if "371(e)" in t or "371 (e)" in t:
        return "so-371e"
    if "d/o food" in t or "nfsa" in t or ("aadhaar" in t and "submission deadline" in t):
        return "so-371e"
    return None


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb.active
    parent, domain_ctx = "Standalone", "IT & Cyber Security"
    laws = []
    seen_slugs = {}

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue
        name = row[0]
        raw_date = row[1] if len(row) > 1 else None
        desc = row[2] if len(row) > 2 else None
        if name is None:
            continue
        name = str(name).strip()

        # Header row?
        is_header = (raw_date is None) and (desc is None)
        if is_header:
            if name in HEADER_CONTEXT:
                parent, domain_ctx = HEADER_CONTEXT[name]
            continue

        desc = str(desc).strip() if desc else ""
        iso_d, disp, hint = parse_date(raw_date)
        year = int(iso_d[:4]) if iso_d else None
        decade = f"{(year // 10) * 10}s" if year else None

        instr = classify_instrument(name)
        section = classify_section(name, desc)
        entity = extract_entity(name)
        status = classify_status(name, desc, hint)

        # Domain overrides
        domain = domain_ctx
        if section == "s.70" and entity:
            if entity in FINANCE_ENTITIES:
                domain = "Banking & Finance"
            elif entity in HEALTH_ENTITIES:
                domain = "Healthcare"
            elif entity == "UIDAI CIDR":
                domain = "Identity/Aadhaar"
            else:
                domain = "IT & Cyber Security"

        tags = make_tags(name, desc, section, instr, entity, status)
        lineage = assign_lineage(name, section)

        # gazette override
        gazette_note = None
        for key, (gdate, note) in GAZETTE_OVERRIDES.items():
            if key in name:
                gazette_note = note
                break

        base = slugify(name) or f"instrument-{i}"
        if base in seen_slugs:
            seen_slugs[base] += 1
            slug = f"{base}-{seen_slugs[base]}"
        else:
            seen_slugs[base] = 0
            slug = base

        laws.append({
            "id": slug,
            "title": name,
            "description": desc,
            "dateISO": iso_d,
            "dateDisplay": disp or (str(raw_date).strip() if raw_date else "Undated"),
            "rawDate": str(raw_date).strip() if raw_date else None,
            "year": year,
            "decade": decade,
            "instrumentType": instr,
            "domain": domain,
            "parentStatute": parent,
            "empoweringSection": section,
            "status": status,
            "entity": entity,
            "tags": tags,
            "lineageId": lineage,
            "gazetteNote": gazette_note,
        })

    # sanity checks
    bad = [l for l in laws if l["year"] and l["year"] > 2025]
    if bad:
        print("WARNING future dates:", [(l["title"], l["year"]) for l in bad])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(laws, ensure_ascii=False, indent=2))

    # summary
    from collections import Counter
    print(f"Wrote {len(laws)} instruments -> {OUT.relative_to(ROOT)}")
    print("  domains   :", dict(Counter(l["domain"] for l in laws)))
    print("  instrument:", dict(Counter(l["instrumentType"] for l in laws)))
    print("  section   :", dict(Counter(l["empoweringSection"] for l in laws)))
    print("  status    :", dict(Counter(l["status"] for l in laws)))
    print("  parent    :", dict(Counter(l["parentStatute"] for l in laws)))
    print("  no date   :", sum(1 for l in laws if not l["dateISO"]))


if __name__ == "__main__":
    main()
