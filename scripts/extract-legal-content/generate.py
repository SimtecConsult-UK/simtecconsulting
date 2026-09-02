"""Emit the typed content modules consumed by app/policies and app/terms."""
import json, re, sys, unicodedata

OUT = "/Users/cataliniovu/Documents/simtec/.claude/worktrees/hot-deal-marking-f7c187/app/lib/legal"

CATALOG = [
    ("security-it", "Security & IT", "Governance of systems, devices, and access", [
        ("Access Control", "access-control-policy.pdf"),
        ("Acceptable Use", "acceptable-use-policy.pdf"),
        ("AI Use", "ai-use-policy.pdf"),
        ("Approved Software and Cloud Services", "approved-software-and-cloud-services-policy.pdf"),
        ("Asset and Change Management", "asset-and-change-management-policy.pdf"),
        ("Backup and Business Continuity", "backup-and-business-continuity-policy.pdf"),
        ("Cyber Governance", "cyber-governance-policy.pdf"),
        ("Firewall Management", "firewall-management-policy.pdf"),
        ("Incident and Compromise Response", "incident-and-compromise-response-policy.pdf"),
        ("Malware Protection", "malware-protection-policy.pdf"),
        ("Passwords and MFA", "passwords-and-mfa-policy.pdf"),
        ("Remote and BYOD Working", "remote-and-byod-working-policy.pdf"),
        ("Secure Configuration", "secure-configuration-policy.pdf"),
        ("Secure Software Development", "secure-software-development-policy.pdf"),
        ("Security Update", "security-update-policy.pdf"),
        ("Supplier and Cloud Service Security", "supplier-and-cloud-service-security-policy.pdf"),
    ]),
    ("data-protection", "Data protection", "How client and personal data is handled", [
        ("Customer Data and Security Overview", "customer-data-and-security-overview.pdf"),
        ("Customer Subprocessor List", "customer-subprocessor-list.pdf"),
        ("Data Processing Agreement and Schedule", "data-processing-agreement-and-schedule.pdf"),
        ("Data Protection and Retention", "data-protection-and-retention-policy.pdf"),
        ("Incident Response and Personal Data Breach Plan", "incident-response-and-personal-data-breach-plan.pdf"),
    ]),
    ("people-workplace", "People & workplace", "Standards for how we work together", [
        ("Equality, Diversity and Inclusion", "Equality, Diversity And Inclusion Policy - Simtec Consult.pdf"),
        ("Health and Safety", "Health And Safety Policy - Simtec Consult.pdf"),
        ("Stress and Mental Wellbeing at Work", "Stress And Mental Wellbeing At Work Policy - Simtec Consult.pdf"),
    ]),
    ("ethics-responsibility", "Ethics & responsibility", "Conduct, transparency, and environmental commitments", [
        ("Anti-Corruption and Bribery", "Anti-Corruption And Bribery Policy - Simtec Consult.pdf"),
        ("Anti-Slavery and Human Trafficking", "Anti-Slavery And Human Trafficking Policy - Simtec Consult.pdf"),
        ("Slavery and Human Trafficking Statement", "Slavery And Human Trafficking Statement - Simtec Consult.pdf"),
        ("Whistleblowing", "Whistleblowing Policy - Simtec Consult.pdf"),
        ("Environmental and Corporate Responsibility", "Environmental And Corporate Responsibility Policy - Simtec Consult.pdf"),
    ]),
]

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-+", "-", s)


def source_slug(filename):
    return slugify(filename[:-4].replace(" - Simtec Consult", ""))


def ts(value, indent=0):
    """Serialise to TypeScript-compatible literal JSON."""
    return json.dumps(value, ensure_ascii=False)


def flatten_runs(runs, glued):
    """Normalise runs so that rendering is a plain concatenation.

    The PDF pipeline records whether adjacent runs were set apart on the page
    (`glue` = they were not); the docx pipeline already carries exact spacing.
    """
    out = []
    for i, r in enumerate(runs):
        t = r["t"]
        if glued and i > 0 and not r.get("glue"):
            t = " " + t
        d = {"t": t}
        if r.get("b"):
            d["b"] = True
        if r.get("href"):
            d["href"] = r["href"]
        out.append(d)
    return out


def conv_blocks(blocks, glued):
    out = []
    for b in blocks:
        if b["t"] in ("p", "callout"):
            out.append({"t": b["t"], "runs": flatten_runs(b["runs"], glued)})
        elif b["t"] == "clause":
            out.append({"t": "clause", "num": b["num"],
                        "runs": flatten_runs(b["runs"], glued)})
        elif b["t"] in ("ul", "dl"):
            out.append({"t": b["t"],
                        "items": [flatten_runs(i, glued) for i in b["items"]]})
        elif b["t"] in ("table", "h3"):
            out.append(b)
    return out


def section_ids(sections):
    seen, ids = {}, []
    for s in sections:
        base = slugify(s)[:48] or "section"
        seen[base] = seen.get(base, 0) + 1
        ids.append(base if seen[base] == 1 else f"{base}-{seen[base]}")
    return ids


CHIP_DATE_LABELS = ("Last reviewed", "Effective date", "Prepared")
CHIP_OWNER_LABELS = ("Owner", "Document owner")


def iso_to_long(v):
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", v.strip())
    if not m:
        return v
    y, mo, d = m.groups()
    return f"{int(d)} {MONTHS[int(mo) - 1]} {y}"


def build_policies():
    raw = json.load(open(sys.argv[1]))
    docs = []
    for _, _, _, entries in CATALOG:
        for name, filename in entries:
            d = raw[filename]
            slug = source_slug(filename)
            headings = []
            sections = []
            for s in d["sections"]:
                headings.append(" ".join(r["t"] for r in s["heading"]))
            ids = section_ids(headings)
            for sid, heading, s in zip(ids, headings, d["sections"]):
                sections.append({"id": sid, "heading": heading,
                                 "blocks": conv_blocks(s["blocks"], True)})
            meta = [{"label": m["label"], "value": m["value"]} for m in d["meta"]]
            version = next((m["value"] for m in meta if m["label"] == "Version"), None)
            updated = next((iso_to_long(m["value"]) for m in meta
                            if m["label"] in CHIP_DATE_LABELS), None)
            owner = next((m["value"] for m in meta
                          if m["label"] in CHIP_OWNER_LABELS), None)
            chipped = {"Version"} | set(CHIP_DATE_LABELS) | set(CHIP_OWNER_LABELS)
            # The h1 uses the handover's display name plus the document-type word
            # from the source title, so all 29 read consistently. Source titles
            # carry a "Simtec Consult -" prefix or a "- SIMTEC CONSULT" suffix,
            # and eight of them are set in full caps.
            bare = re.sub(r"^Simtec Consult( Ltd)? - ", "", d["title"].strip())
            bare = re.sub(r"\s*[-\u2013\u2014]\s*SIMTEC CONSULT$", "", bare)
            suffix = " Policy" if bare.upper().endswith("POLICY") else ""
            docs.append({
                "slug": slug,
                "name": name,
                "title": name + suffix,
                "sourceTitle": d["title"],
                "pdf": f"/policies/{slug}.pdf",
                "version": version,
                "updated": updated,
                "owner": owner,
                "details": [m for m in meta if m["label"] not in chipped],
                "lede": conv_blocks(d["lede"], True),
                "sections": sections,
            })
    return docs


def build_terms():
    raw = json.load(open(sys.argv[2]))
    out = {}
    for key, updated in (("saas", "25 February 2025"), ("project", "28 August 2026")):
        d = raw[key]
        sections = []
        for s in d["sections"]:
            heading = " ".join(r["t"] for r in s["heading"])
            sections.append({"id": f"clause-{s['n']}", "n": s["n"], "heading": heading,
                             "blocks": conv_blocks(s["blocks"], False)})
        out[key] = {"title": d["title"], "updated": updated,
                    "lede": conv_blocks(d["lede"], False), "sections": sections}
    return out


HEADER = "// Generated from the source documents by scripts/extract-legal-content.\n" \
         "// Do not edit by hand: the text is reproduced verbatim from {src}.\n"


def main():
    policies = build_policies()
    terms = build_terms()

    with open(f"{OUT}/policies-content.ts", "w") as f:
        f.write(HEADER.format(src="the PDFs in Simtec Policies/"))
        f.write('import type { PolicyDoc } from "./types";\n\n')
        f.write("export const POLICY_DOCS: Record<string, PolicyDoc> = {\n")
        for d in policies:
            f.write(f"  {ts(d['slug'])}: {ts(d)},\n")
        f.write("};\n")

    with open(f"{OUT}/terms-content.ts", "w") as f:
        f.write(HEADER.format(src="the .docx files in Terms/"))
        f.write('import type { TermsDoc } from "./types";\n\n')
        for key, name in (("saas", "GENERAL_TERMS"), ("project", "GENERAL_TERMS_PROJECT")):
            f.write(f"export const {name}: TermsDoc = {ts(terms[key])};\n\n")

    with open(f"{OUT}/catalog.ts", "w") as f:
        f.write("// Category grouping and display names come from the design handover.\n")
        f.write('import type { PolicyCategory, PolicyEntry } from "./types";\n\n')
        f.write("export const POLICY_CATEGORIES: PolicyCategory[] = [\n")
        for cid, label, subtitle, entries in CATALOG:
            f.write("  {\n")
            f.write(f"    id: {ts(cid)},\n    label: {ts(label)},\n    subtitle: {ts(subtitle)},\n")
            f.write("    policies: [\n")
            for name, filename in entries:
                f.write(f"      {{ slug: {ts(source_slug(filename))}, name: {ts(name)} }},\n")
            f.write("    ],\n  },\n")
        f.write("];\n\n")
        f.write("export const ALL_POLICIES: PolicyEntry[] = POLICY_CATEGORIES.flatMap(\n"
                "  (category) => category.policies\n);\n\n")
        f.write("export const POLICY_COUNT = ALL_POLICIES.length;\n")

    print(f"{len(policies)} policies, {len(terms)} terms documents", file=sys.stderr)
    for d in policies:
        print(f"  {d['slug']:52s} v{d['version']}  {len(d['sections'])} sections", file=sys.stderr)


main()
