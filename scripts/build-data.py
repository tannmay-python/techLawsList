#!/usr/bin/env python3
"""
build-data.py — India's Tech Laws data pipeline (v2).

Parses data/techLaws.xlsx (17 analytical columns, 213 instruments across 37
sections) into src/data/laws.json. Most facets are supplied in the sheet; this
script normalises them, parses dates, and derives the extra fields the portal
needs (colour group, parent statute, empowering section, compliance-duty flags,
coercion rank, international regimes, source links, amendment lineages).

Run:  python3 scripts/build-data.py   (or  npm run data)
"""
import json, re, sys
from datetime import date
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("pip install openpyxl")

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "data" / "techLaws.xlsx"
OUT = ROOT / "src" / "data" / "laws.json"
META_OUT = ROOT / "src" / "data" / "meta.json"

# ---------------------------------------------------------------------------
# Colour groups — 8 super-domains anchored by Llama (#620d3c) + Marigold.
# Each raw Domain value maps to one group (used for node colour everywhere).
# ---------------------------------------------------------------------------
GROUP_OF = {
    "IT Act & Cyber": "Core IT & Cyber",
    "Cyber Security": "Core IT & Cyber",
    "Digital Identity (Aadhaar)": "Digital Identity",
    "Telecom": "Telecom & Media",
    "Broadcasting & Media": "Telecom & Media",
    "Data Protection": "Data & Privacy",
    "Health Data": "Data & Privacy",
    "Geospatial": "Data & Privacy",
    "Financial-sector Cyber": "Finance & Fintech",
    "Fintech & Payments": "Finance & Fintech",
    "AI": "Frontier Tech",
    "Quantum & Compute": "Frontier Tech",
    "Semiconductors": "Frontier Tech",
    "Space": "Frontier Tech",
    "Biotech": "Frontier Tech",
    "Online Gaming": "Frontier Tech",
    "Drones": "Frontier Tech",
    "E-Commerce": "Frontier Tech",
    "Nuclear": "Strategic & Deep-Tech",
    "Export Controls": "Strategic & Deep-Tech",
    "Critical Minerals": "Strategic & Deep-Tech",
    "Standards": "Strategic & Deep-Tech",
    "Research": "Strategic & Deep-Tech",
    "E-Governance / Electronics": "E-Governance",
    "E-Governance": "E-Governance",
}
DEFAULT_GROUP = "Core IT & Cyber"

MONTHS = {m: i + 1 for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july",
     "august", "september", "october", "november", "december"])}

DATE_PREFIX = re.compile(
    r"^\s*(commenced on|assented|enacted on|enacted|released on|enforced on|"
    r"notified on|notified|passed by parliament on|passed|effective|w\.e\.f\.?|"
    r"in force|approved on|approved|introduced|draft|public consultation)\s*[:\-]?\s*",
    re.I)


def slugify(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:64]


def parse_date(raw, year):
    """Return (iso, display, approx). Uses the sheet Year as the anchor."""
    yr = int(year) if year and str(year).isdigit() else None
    if not raw:
        return (f"{yr}-07-01" if yr else None, str(year) if year else "Undated", bool(yr))
    raw = str(raw).strip()
    # find an explicit dd/mm/yyyy or M/D/YYYY anywhere (last one = "in force" date)
    dmy = re.findall(r"(\d{1,2})[/.](\d{1,2})[/.](\d{4})", raw)
    if dmy:
        a, b, y = map(int, dmy[-1])
        if a > 12 and b <= 12:      # dd/mm
            d, m = a, b
        elif b > 12 and a <= 12:    # US M/D (e.g. IT Act 10/17/2000)
            d, m = b, a
        else:
            d, m = a, b             # ambiguous -> Indian dd/mm
        try:
            date(y, m, d)
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                      "Sep", "Oct", "Nov", "Dec"]
            return f"{y:04d}-{m:02d}-{d:02d}", f"{d} {months[m-1]} {y}", False
        except ValueError:
            pass
    # "10 February 2017"
    m = re.search(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", raw)
    if m and m.group(2).lower() in MONTHS:
        d, mm, y = int(m.group(1)), MONTHS[m.group(2).lower()], int(m.group(3))
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                  "Sep", "Oct", "Nov", "Dec"]
        return f"{y:04d}-{mm:02d}-{d:02d}", f"{d} {months[mm-1]} {y}", False
    # "Month YYYY"
    m = re.search(r"([A-Za-z]+)\s+(\d{4})", raw)
    if m and m.group(1).lower() in MONTHS:
        mm, y = MONTHS[m.group(1).lower()], int(m.group(2))
        return f"{y:04d}-{mm:02d}-15", raw, False
    # fall back to the Year column, place mid-year (approximate)
    disp = raw if not re.fullmatch(r"\d{4}", raw) else raw
    return (f"{yr}-07-01" if yr else None, disp if raw else str(year), bool(yr))


def parent_statute(legal_basis, name, section_ctx):
    lb = (legal_basis or "").lower()
    n = name.lower()
    if "aadhaar" in lb or "aadhaar" in n:
        return "Aadhaar Act 2016"
    if "it act" in lb or "70b" in lb:
        return "IT Act 2000"
    if "telegraph" in lb:
        return "Telegraph Act 1885"
    if "telecom" in lb or "row rules, 2024" in lb:
        return "Telecom Act 2023"
    if "trai" in lb:
        return "TRAI Act 1997"
    if "dpdp" in lb:
        return "DPDP Act 2023"
    if "mmdr" in lb:
        return "MMDR Act 1957"
    if "pss act" in lb or "rbi act" in lb:
        return "PSS Act 2007"
    # header context for the giants
    return section_ctx or "Standalone"


# Explicit patterns (an actual "section NN" reference) always win.
SECTION_EXPLICIT = [
    (re.compile(r"section 70b|s\.?70b", re.I), "s.70B"),
    (re.compile(r"section 70a|s\.?70a|section 70\b", re.I), "s.70"),
    (re.compile(r"section 79a", re.I), "s.79A"),
    (re.compile(r"section 69a", re.I), "s.69A"),
    (re.compile(r"section 69b", re.I), "s.69B"),
    (re.compile(r"section 69\b", re.I), "s.69"),
    (re.compile(r"section 46\b", re.I), "s.46"),
    (re.compile(r"section 88\b", re.I), "s.88"),
    (re.compile(r"section 7\b|under section 7", re.I), "s.7"),
]
# Loose keyword patterns only apply when the instrument sits under the IT Act,
# so e.g. "blocking of platforms" in a standalone gaming Act is NOT tagged s.69A.
SECTION_LOOSE = [
    (re.compile(r"cert-in", re.I), "s.70B"),
    (re.compile(r"protected system|critical information infra", re.I), "s.70"),
    (re.compile(r"examiner of electronic evidence", re.I), "s.79A"),
    (re.compile(r"\bblocking\b", re.I), "s.69A"),
    (re.compile(r"traffic data", re.I), "s.69B"),
    (re.compile(r"interception, monitoring and decryption", re.I), "s.69"),
    (re.compile(r"adjudicating officer", re.I), "s.46"),
    (re.compile(r"advisory committee", re.I), "s.88"),
]


def empowering_section(name, desc, legal_basis):
    text = f"{name} {desc} {legal_basis or ''}"
    for pat, sec in SECTION_EXPLICIT:
        if pat.search(text):
            return sec
    it_context = "it act" in (legal_basis or "").lower() or "70b" in (legal_basis or "").lower()
    if it_context:
        for pat, sec in SECTION_LOOSE:
            if pat.search(text):
                return sec
    return None


ENTITY_PATTERNS = [
    ("HDFC Bank", r"HDFC"), ("ICICI Bank", r"ICICI"),
    ("NPCI", r"NPCI|National Payments"), ("LIC", r"\bLIC\b|Life Insurance"),
    ("Union Bank of India", r"Union Bank"), ("Punjab National Bank", r"Punjab National"),
    ("Bank of Baroda", r"Bank of Baroda"), ("State Bank of India", r"State Bank of India"),
    ("Axis Bank", r"Axis Bank"), ("Kotak Mahindra Bank", r"Kotak"),
    ("Canara Bank", r"Canara"), ("Bank of India", r"Bank of India\b"),
    ("Central Bank of India", r"Central Bank of India"), ("Paytm Payments Bank", r"Paytm"),
    ("YES Bank", r"YES Bank"), ("IDBI Bank", r"IDBI"), ("Indian Bank", r"Indian Bank\b"),
    ("AIIMS New Delhi", r"AIIMS"), ("NCRB", r"NCRB|Crime Records"),
    ("NIA", r"National Investigation Agency|\bNIA\b"), ("Kfin Technologies", r"Kfin"),
    ("CAMS", r"\bCAMS\b|Computer Age"), ("CERSAI", r"CERSAI|Securitisation"),
    ("Airports Authority of India", r"Airports Authority"),
    ("NIC", r"National Informatics Centre|NIC email"),
    ("UIDAI CIDR", r"UIDAI-CIDR|Central Identities Data|CIDR"),
    ("Govt of NCT Delhi (TETRA)", r"TETRA"),
    ("Telecom service providers", r"Licensed Telecom service providers"),
]


def extract_entity(name):
    for label, pat in ENTITY_PATTERNS:
        if re.search(pat, name, re.I):
            return label
    return None


def compliance_flags(text):
    if not text or text == "-":
        return []
    t = text.lower()
    flags = []
    if re.search(r"report|incident|notif|breach|monthly", t):
        flags.append("reporting")
    if re.search(r"in india|localis|store .*india|retain|data only in india|residency", t):
        flags.append("data localisation")
    if re.search(r"officer|ciso|dpo|committee|nodal|grievance officer|steering", t):
        flags.append("mandatory officer")
    if re.search(r"regist|certif|licen[cs]|dlt", t):
        flags.append("registration/licensing")
    if re.search(r"audit|dpia", t):
        flags.append("audit")
    if re.search(r"consent", t):
        flags.append("consent")
    return flags


def coercion(regime, maxpen):
    r = (regime or "").lower()
    if "criminal & civil" in r:
        return 3, "Criminal + civil"
    if "criminal" in r:
        return 2, "Criminal"
    if r == "civil":
        return 1, "Civil"
    return 0, "None / non-binding"


def source_link(src):
    if not src or src == "-":
        return None
    s = src.strip()
    if s.startswith("http"):
        return s
    # bare domain like indiacode.nic.in
    if re.match(r"^[a-z0-9.\-]+\.[a-z]{2,}(/\S*)?$", s, re.I):
        return "https://" + s
    return None


def lineage(name, legal_basis):
    n = name.lower()
    if "right of way" in n:
        return "row-rules"
    if "371(e)" in n or "371 (e)" in n or ("aadhaar" in n and ("deadline" in n or "d/o food" in n or "nfsa" in n)):
        return "so-371e"
    if "intermediary guidelines" in n:
        return "it-rules-2021"
    if "mines and minerals" in n:
        return "mmdr"
    if "offshore areas mineral" in n:
        return "offshore-minerals"
    if "biological diversity" in n:
        return "biodiversity"
    if "authentication" in n and "aadhaar" in (legal_basis or "").lower():
        return "aadhaar-auth"
    return None


def hard_law(bf):
    b = (bf or "").lower()
    if "primary" in b or "subordinate" in b or "statutory" in b:
        return True
    return False


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["India Tech Laws"]
    rows = list(ws.iter_rows(values_only=True))
    hdrs = [str(h).strip() if h else "" for h in rows[0]]
    idx = {h: i for i, h in enumerate(hdrs)}

    def get(r, col):
        v = r[idx[col]] if col in idx and idx[col] < len(r) else None
        if v is None:
            return None
        s = str(v).strip()
        return None if s in ("", "-", "–") else s

    # section-header → parent statute context
    HEADER_PARENT = {
        "INFORMATION TECHNOLOGY ACT, 2000": "IT Act 2000",
        "Rules / Regulations under the IT Act": "IT Act 2000",
        "Notifications on the IT Act": "IT Act 2000",
        "TELECOMMUNICATIONS ACT": "Telecom Act 2023",
        "Rules on the Telecommunications Act": "Telecom Act 2023",
        "Notifications on the Telecommunications Act": "Telecom Act 2023",
        "TELECOM REGULATORY AUTHORITY OF INDIA (TRAI) ACT, 1997": "TRAI Act 1997",
        "TRAI Rules / Regulations": "TRAI Act 1997",
        "TELEGRAPH ACT": "Telegraph Act 1885",
        "Telegraph Act Notifications": "Telegraph Act 1885",
        "AADHAAR ACT": "Aadhaar Act 2016",
        "Rules / Regulations on the Aadhaar Act": "Aadhaar Act 2016",
        "Notifications on the Aadhaar Act": "Aadhaar Act 2016",
    }

    laws = []
    section = None
    section_parent = None
    seen = {}

    for r in rows[1:]:
        name = r[0]
        if name is None:
            continue
        name = str(name).strip()
        is_header = all(c is None for c in r[1:])
        if is_header:
            section = name
            for key, p in HEADER_PARENT.items():
                if key.lower() in name.lower():
                    section_parent = p
                    break
            else:
                section_parent = None
            continue

        domain = get(r, "Domain") or "IT Act & Cyber"
        group = GROUP_OF.get(domain, DEFAULT_GROUP)
        year = get(r, "Year")
        raw_date = get(r, "Date (as recorded)")
        iso, disp, approx = parse_date(raw_date, year)
        yr = int(year) if year and str(year).isdigit() else (int(iso[:4]) if iso else None)
        decade = f"{(yr // 10) * 10}s" if yr else None

        desc = get(r, "Description (what it does)") or ""
        legal_basis = get(r, "Legal basis")
        binding = get(r, "Binding force") or "Subordinate / statutory instrument"
        regime = get(r, "Penalty regime")
        maxpen = get(r, "Max penalty (headline)")
        crank, clabel = coercion(regime, maxpen)
        judicial = get(r, "Judicial status")
        compliance = get(r, "Key compliance obligations")
        intl = get(r, "International linkage")
        src = get(r, "Primary source")
        admin = get(r, "Administering body") or "—"
        territorial = get(r, "Territorial reach") or "India"

        section_code = empowering_section(name, desc, legal_basis)
        parent = parent_statute(legal_basis, name, section_parent)
        entity = extract_entity(name)
        cflags = compliance_flags(compliance)
        regimes = []
        if intl:
            regimes = [x.strip() for x in re.split(r"[;/]", intl) if x.strip() and x.strip() not in (".", "-")]

        base = slugify(name) or "instrument"
        if base in seen:
            seen[base] += 1
            sid = f"{base}-{seen[base]}"
        else:
            seen[base] = 0
            sid = base

        laws.append({
            "id": sid,
            "title": name,
            "description": desc,
            "section": section,
            "dateISO": iso,
            "dateDisplay": disp,
            "rawDate": raw_date,
            "approxDate": approx,
            "year": yr,
            "decade": decade,
            "type": get(r, "Type") or "Notification",
            "domain": domain,
            "group": group,
            "parentStatute": parent,
            "empoweringSection": section_code,
            "bindingForce": binding,
            "hardLaw": hard_law(binding),
            "status": get(r, "Status") or "In force",
            "adminBody": admin,
            "adminMinistry": admin.split("/")[0].strip() if admin else "—",
            "legalBasis": legal_basis,
            "territorial": territorial,
            "extraterritorial": territorial == "Extraterritorial",
            "penaltyRegime": regime or "None",
            "maxPenalty": maxpen,
            "coercionRank": crank,
            "coercionLabel": clabel,
            "judicialStatus": judicial,
            "contested": bool(judicial),
            "compliance": compliance,
            "complianceFlags": cflags,
            "international": intl,
            "intlRegimes": regimes,
            "source": src,
            "sourceUrl": source_link(src),
            "entity": entity,
            "lineageId": lineage(name, legal_basis),
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(laws, ensure_ascii=False, indent=1))

    # aggregate meta for the dashboard / overview
    from collections import Counter
    def dist(key):
        c = Counter(l[key] for l in laws)
        return [{"key": k, "count": v} for k, v in c.most_common()]
    by_year = Counter(l["year"] for l in laws if l["year"])
    meta = {
        "total": len(laws),
        "sections": len(set(l["section"] for l in laws if l["section"])),
        "domains": dist("domain"),
        "groups": dist("group"),
        "types": dist("type"),
        "statuses": dist("status"),
        "binding": dist("bindingForce"),
        "ministries": dist("adminMinistry"),
        "parents": dist("parentStatute"),
        "byYear": [{"year": y, "count": by_year[y]} for y in range(1885, 2027)],
        "extraterritorial": sum(1 for l in laws if l["extraterritorial"]),
        "contested": sum(1 for l in laws if l["contested"]),
        "hardLaw": sum(1 for l in laws if l["hardLaw"]),
        "softLaw": sum(1 for l in laws if not l["hardLaw"]),
        "withIntl": sum(1 for l in laws if l["intlRegimes"]),
        "s70count": sum(1 for l in laws if l["empoweringSection"] == "s.70"),
        "minYear": min(l["year"] for l in laws if l["year"]),
        "maxYear": max(l["year"] for l in laws if l["year"]),
    }
    META_OUT.write_text(json.dumps(meta, ensure_ascii=False, indent=1))

    print(f"Wrote {len(laws)} instruments -> {OUT.relative_to(ROOT)}")
    print("  groups   :", {g['key']: g['count'] for g in meta['groups']})
    print("  types    :", {t['key']: t['count'] for t in meta['types']})
    print("  binding  : hard", meta['hardLaw'], "soft", meta['softLaw'])
    print("  contested:", meta['contested'], "| extraterritorial:", meta['extraterritorial'],
          "| intl-linked:", meta['withIntl'], "| s.70:", meta['s70count'])
    print("  no date  :", sum(1 for l in laws if not l['dateISO']))


if __name__ == "__main__":
    main()
