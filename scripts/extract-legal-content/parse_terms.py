"""Extract structured, verbatim content from the two Terms .docx files.

Word auto-numbers the clause outline, so the numbers are not in the text: they
are rebuilt here (clause N in document order, sub-clauses N.1, N.2, ... ) which
is what the cross-references in the text ("clause 17.1") point at. Where a
number was typed into the text by hand it is used as-is instead.
"""
import json, re, sys, zipfile
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

LITERAL_NUM = re.compile(r"^(\d+(?:\.\d+)*)\.?[\s ]+")


def load(path):
    z = zipfile.ZipFile(path)
    doc = ET.fromstring(z.read("word/document.xml"))
    rels = {}
    try:
        for rel in ET.fromstring(z.read("word/_rels/document.xml.rels")):
            rels[rel.get("Id")] = rel.get("Target")
    except KeyError:
        pass
    numfmt = {}
    try:
        nroot = ET.fromstring(z.read("word/numbering.xml"))
        abstracts = {}
        for a in nroot.findall(W + "abstractNum"):
            lv = {}
            for l in a.findall(W + "lvl"):
                f = l.find(W + "numFmt")
                lv[l.get(W + "ilvl")] = f.get(W + "val") if f is not None else None
            abstracts[a.get(W + "abstractNumId")] = lv
        for n in nroot.findall(W + "num"):
            aid = n.find(W + "abstractNumId").get(W + "val")
            numfmt[n.get(W + "numId")] = abstracts.get(aid, {})
    except KeyError:
        pass
    return doc, rels, numfmt


def para_runs(p, rels):
    """Flatten a paragraph into runs of {t, b?, href?}."""
    out = []

    def push(text, bold, href):
        if not text:
            return
        if out and out[-1].get("b", False) == bold and out[-1].get("href") == href:
            out[-1]["t"] += text
        else:
            d = {"t": text}
            if bold:
                d["b"] = True
            if href:
                d["href"] = href
            out.append(d)

    def walk(node, href=None):
        for child in node:
            tag = child.tag
            if tag == W + "hyperlink":
                target = rels.get(child.get(R + "id"), href)
                walk(child, target)
            elif tag == W + "r":
                rpr = child.find(W + "rPr")
                bold = False
                if rpr is not None:
                    b = rpr.find(W + "b")
                    bold = b is not None and b.get(W + "val") not in ("0", "false")
                for t in child:
                    if t.tag == W + "t":
                        push(t.text or "", bold, href)
                    elif t.tag == W + "tab":
                        push(" ", bold, href)
                    elif t.tag in (W + "br", W + "cr"):
                        push(" ", bold, href)
            elif tag in (W + "smartTag", W + "ins", W + "sdt", W + "sdtContent"):
                walk(child, href)

    walk(p)
    # collapse the runs of whitespace Word leaves around tabs and field codes
    for r in out:
        r["t"] = re.sub(r"[\s ]+", " ", r["t"])
    merged = []
    for r in out:
        if merged and merged[-1].get("b", False) == r.get("b", False) and \
                merged[-1].get("href") == r.get("href"):
            merged[-1]["t"] += r["t"]
        else:
            merged.append(r)
    while merged and not merged[0]["t"].strip():
        merged.pop(0)
    if merged:
        merged[0]["t"] = merged[0]["t"].lstrip()
        merged[-1]["t"] = merged[-1]["t"].rstrip()
    kept = [r for r in merged if r["t"]]
    if kept:
        # dropping a whitespace-only final run can expose a trailing space
        kept[-1]["t"] = kept[-1]["t"].rstrip()
        kept = [r for r in kept if r["t"]]
    return kept


def runs_text(runs):
    return "".join(r["t"] for r in runs)


def strip_leading(runs, n):
    runs = [dict(r) for r in runs]
    while n > 0 and runs:
        take = min(n, len(runs[0]["t"]))
        runs[0]["t"] = runs[0]["t"][take:]
        n -= take
        if not runs[0]["t"]:
            runs.pop(0)
    return runs


def is_heading(text):
    # Clause headings are short, all-caps and unpunctuated. All-caps *paragraphs*
    # also occur in these documents (statutory-style notices), so length and the
    # absence of a full stop are what separate the two.
    text = text.strip()
    letters = [c for c in text if c.isalpha()]
    if len(letters) < 3 or any(c.islower() for c in letters):
        return False
    return len(text) <= 150 and not text.endswith(".")


def cell_text(tc, rels):
    parts = [runs_text(para_runs(p, rels)) for p in tc.findall(W + "p")]
    return " ".join(x for x in parts if x).strip()


def parse(path, title):
    doc, rels, numfmt = load(path)
    body = doc.find(W + "body")

    sections = []      # {n, heading, blocks}
    lede = []
    counters = [0, 0]  # sub-clause, sub-sub-clause within the current clause

    def blocks():
        return sections[-1]["blocks"] if sections else lede

    def add(b):
        blocks().append(b)
        return b

    for el in body:
        tag = el.tag

        if tag == W + "tbl":
            rows = []
            for tr in el.findall(W + "tr"):
                rows.append([cell_text(tc, rels) for tc in tr.findall(W + "tc")])
            rows = [r for r in rows if any(r)]
            if len(rows) >= 2:
                add({"t": "table", "head": rows[0], "rows": rows[1:]})
            continue

        if tag != W + "p":
            continue

        runs = para_runs(el, rels)
        text = runs_text(runs).strip()
        if not text:
            continue

        ppr = el.find(W + "pPr")
        num_id = ilvl = None
        if ppr is not None:
            npr = ppr.find(W + "numPr")
            if npr is not None:
                ni, il = npr.find(W + "numId"), npr.find(W + "ilvl")
                num_id = ni.get(W + "val") if ni is not None else None
                ilvl = il.get(W + "val") if il is not None else "0"
        fmt = numfmt.get(num_id or "", {}).get(ilvl or "0")

        # ---- clause heading
        if is_heading(text):
            flat = [{"t": runs_text(runs)}]
            sections.append({"n": len(sections) + 1, "heading": flat, "blocks": []})
            counters = [0, 0]
            continue

        # ---- bullet list item
        if fmt == "bullet":
            last = blocks()[-1] if blocks() else None
            if last and last.get("t") == "ul":
                last["items"].append(runs)
            else:
                add({"t": "ul", "items": [runs]})
            continue

        clause = sections[-1]["n"] if sections else None

        # ---- numbered sub-clause: honour a hand-typed number, else count
        m = LITERAL_NUM.match(text)
        if m and clause and m.group(1).split(".")[0] == str(clause):
            parts = [int(x) for x in m.group(1).split(".")]
            runs = strip_leading(runs, m.end())
            if len(parts) >= 2:
                counters = [parts[1], parts[2] if len(parts) > 2 else 0]
            add({"t": "clause", "num": m.group(1), "runs": runs})
            continue

        if fmt == "decimal" and clause:
            if (ilvl or "0") in ("0", "1"):
                counters[0] += 1
                counters[1] = 0
                num = f"{clause}.{counters[0]}"
            else:
                counters[1] += 1
                num = f"{clause}.{counters[0]}.{counters[1]}"
            add({"t": "clause", "num": num, "runs": runs})
            continue

        # ---- unnumbered paragraph (definitions, sign-offs, continuations)
        add({"t": "p", "runs": runs})

    # 3+ consecutive unnumbered paragraphs are a definitions list
    for sec in sections:
        out, run = [], []
        for b in sec["blocks"]:
            if b["t"] == "p":
                run.append(b)
                continue
            if len(run) >= 3:
                out.append({"t": "dl", "items": [r["runs"] for r in run]})
            else:
                out.extend(run)
            run = []
            out.append(b)
        if len(run) >= 3:
            out.append({"t": "dl", "items": [r["runs"] for r in run]})
        else:
            out.extend(run)
        sec["blocks"] = out

    return {"source": path.rsplit("/", 1)[-1], "title": title,
            "lede": lede, "sections": sections}


if __name__ == "__main__":
    base = "/Users/cataliniovu/Documents/simtec/Terms/"
    out = {
        "saas": parse(base + "Simtec - General SaaS Customer Terms (3).docx", "General Terms"),
        "project": parse(base + "Simtec - General Terms (incorporating Project and Time-Based Work).docx", "General Terms"),
    }
    json.dump(out, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
    for k, d in out.items():
        print(k, len(d["sections"]), "clauses;", sum(len(s["blocks"]) for s in d["sections"]), "blocks", file=sys.stderr)
