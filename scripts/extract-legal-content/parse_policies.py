"""Extract structured, verbatim content from the Simtec policy PDFs.

Two document families:
  A "policy pack"  - Helvetica, 18pt title, 13pt bold section headings, 9.5pt body,
                     (cid:127) bullets, "> " callouts, ruled tables at 7.5pt.
  B "- Simtec Consult" - HelveticaNeue, 10pt title, headings at x0~72 vs body at
                     x0~112, DejaVu bullet glyphs, APPROVAL sign-off block.
Text is never rewritten: lines are only re-joined into the paragraphs / list items
/ table cells they were laid out as in the PDF.
"""
import glob, json, os, re, sys
import pdfplumber

SRC = "/Users/cataliniovu/Documents/simtec/Simtec Policies"

SUB_HEADING = re.compile(r"^\d+\.\d+[\s.]")

BULLET_A = "(cid:127)"
BULLET_B = "●"          # DejaVu ●
LINE_TOL = 4.0               # tops within this belong to the same visual line


def norm(s):
    s = s.replace(" ", " ")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def build_lines(words):
    """Group words into visual lines, each carrying bold/plain runs."""
    lines = []
    for w in sorted(words, key=lambda w: (w["top"], w["x0"])):
        if lines and abs(w["top"] - lines[-1]["top"]) <= LINE_TOL:
            lines[-1]["words"].append(w)
            lines[-1]["top"] = min(lines[-1]["top"], w["top"])
        else:
            lines.append({"top": w["top"], "words": [w]})
    out = []
    for ln in lines:
        ws = sorted(ln["words"], key=lambda w: w["x0"])
        runs = []
        prev_x1 = None
        for w in ws:
            font = w["fontname"].split("+")[-1]
            bold = "Bold" in font
            text = w["text"]
            # extract_words splits on a font change too, so a bold run can end
            # mid-word ("(the **Customer**);"). Only re-insert a space where the
            # glyphs were actually set apart.
            sep = "" if prev_x1 is not None and w["x0"] - prev_x1 < 0.5 else " "
            prev_x1 = w["x1"]
            if runs and runs[-1]["b"] == bold:
                runs[-1]["t"] += sep + text
            elif sep == "" and runs:
                runs.append({"t": text, "b": bold, "glue": True})
            else:
                runs.append({"t": text, "b": bold})
        out.append({
            "glue_first": False,
            "top": ln["top"],
            "x0": ws[0]["x0"],
            "size": round(max(w["size"] for w in ws), 1),
            "runs": runs,
            "text": " ".join(w["text"] for w in ws),
        })
    return out


def runs_join(a, b):
    """Append runs `b` to runs `a` with a single separating space."""
    for r in b:
        rb = r.get("b", False)
        sep = "" if r.get("glue") else " "
        if a and a[-1].get("b", False) == rb:
            a[-1]["t"] += sep + r["t"]
        else:
            a.append(dict(r))
    return a


def clean_runs(runs):
    out = []
    for r in runs:
        t = norm(r["t"])
        if not t:
            continue
        rb = r.get("b", False)
        sep = "" if r.get("glue") else " "
        if out and out[-1]["b"] == rb:
            out[-1]["t"] += sep + t
        else:
            out.append({"t": t, "b": rb, "glue": r.get("glue", False)})
    res = []
    for r in out:
        d = {"t": r["t"]}
        if r["b"]:
            d["b"] = True
        if r.get("glue"):
            d["glue"] = True
        res.append(d)
    if res:
        res[0].pop("glue", None)
    return res


def strip_prefix(runs, prefix):
    runs = [dict(r) for r in runs]
    for r in runs:
        if r["t"].startswith(prefix):
            r["t"] = r["t"][len(prefix):]
            break
    return runs


# ---------------------------------------------------------------- tables

def page_tables(page):
    settings = {"vertical_strategy": "lines", "horizontal_strategy": "lines"}
    found = []
    for t in page.find_tables(settings):
        rows = [[norm((c or "").replace("\n", " ")) for c in row] for row in t.extract()]
        rows = [r for r in rows if any(r)]
        if len(rows) < 2:
            continue
        found.append({"bbox": t.bbox, "head": rows[0], "rows": rows[1:], "top": t.bbox[1]})
    return found


def in_any_bbox(w, bboxes):
    cx = (w["x0"] + w["x1"]) / 2
    cy = (w["top"] + w["bottom"]) / 2
    for x0, top, x1, bottom in bboxes:
        if x0 - 1 <= cx <= x1 + 1 and top - 1 <= cy <= bottom + 1:
            return True
    return False


# ---------------------------------------------------------------- document

class Doc:
    def __init__(self):
        self.title_runs = []
        self.meta = []
        self.sections = []      # {heading, blocks}
        self.lede = []          # blocks before the first heading
        self.cur = None         # current block being extended

    def blocks(self):
        return self.sections[-1]["blocks"] if self.sections else self.lede

    def add(self, block):
        self.blocks().append(block)
        self.cur = block
        return block

    def heading(self, runs):
        flat = [{"t": r["t"]} for r in clean_runs(runs)]
        self.sections.append({"heading": flat, "blocks": []})
        self.cur = None


def parse(path):
    doc = Doc()
    with pdfplumber.open(path) as pdf:
        pages = []
        for page in pdf.pages:
            tables = page_tables(page)
            bboxes = [t["bbox"] for t in tables]
            words = [w for w in page.extract_words(extra_attrs=["fontname", "size"])
                     if not in_any_bbox(w, bboxes)]
            pages.append({"lines": build_lines(words), "tables": tables,
                          "height": page.height})

    family = "A" if any(l["size"] >= 16 for p in pages for l in p["lines"]) else "B"
    items = []   # interleave lines and tables in reading order, page by page
    for p in pages:
        merged = [("line", l, l["top"]) for l in p["lines"]]
        merged += [("table", t, t["top"]) for t in p["tables"]]
        merged.sort(key=lambda x: x[2])
        items.append((p, merged))

    prev_top = None
    prev_kind = None       # 'p' | 'ul' | 'callout' | None
    body_x = None
    for page_index, (p, merged) in enumerate(items):
        page_prev_top = None
        first_body_on_page = page_index > 0
        for kind, obj, _ in merged:
            if kind == "table":
                head, rows = obj["head"], obj["rows"]
                # continuation of the same table across a page break
                last = doc.blocks()[-1] if doc.blocks() else None
                if last and last.get("t") == "table" and last["head"] == head:
                    last["rows"].extend(rows)
                else:
                    doc.add({"t": "table", "head": head, "rows": rows})
                prev_kind = None
                page_prev_top = None
                continue

            ln = obj
            text = norm(ln["text"])
            if not text:
                continue

            # ---- page furniture
            if family == "A":
                if ln["top"] > p["height"] - 60:
                    continue          # "policy pack - generated ... Page n" footer
            else:
                if ln["size"] <= 8.6 and ln["top"] > p["height"] - 100:
                    continue          # "SIMTEC/POL/../1.0" running reference
            if ln["size"] <= 7.6:
                continue              # stray table text outside a detected bbox

            # ---- title
            if (family == "A" and ln["size"] >= 16) or (family == "B" and ln["size"] >= 9.9):
                doc.title_runs = runs_join(doc.title_runs, ln["runs"])
                prev_kind = None
                page_prev_top = ln["top"]
                continue

            # ---- metadata (key: value) above the first heading
            if ln["size"] <= 8.6 and not doc.sections and not doc.lede and ": " in text:
                label, _, value = text.partition(": ")
                doc.meta.append({"label": label, "value": value})
                page_prev_top = ln["top"]
                continue

            gap = None if page_prev_top is None else ln["top"] - page_prev_top
            page_prev_top = ln["top"]

            # ---- section heading. Family A sets them in 13pt bold; family B uses
            # the same 9.5pt size as the body, distinguished by being wholly bold.
            all_bold = all(r["b"] for r in ln["runs"])
            is_heading = (family == "A" and ln["size"] >= 12.5) or \
                         (family == "B" and all_bold and len(text) < 120)
            if is_heading:
                # "2.1 Overall responsibility" sits at the same indent and weight
                # as its parent "2. RESPONSIBILITIES", but belongs inside it
                if SUB_HEADING.match(text) and doc.sections:
                    doc.add({"t": "h3", "text": text})
                    prev_kind = None
                    continue
                # a heading that wrapped onto a second line
                if prev_kind == "h" and gap is not None and gap <= 18:
                    merged_h = clean_runs(runs_join(doc.sections[-1]["heading"], ln["runs"]))
                    doc.sections[-1]["heading"] = [{"t": r["t"]} for r in merged_h]
                else:
                    doc.heading(ln["runs"])
                prev_kind = "h"
                continue

            # ---- bullets
            marker = BULLET_A if family == "A" else BULLET_B
            if text.startswith(marker):
                runs = clean_runs(strip_prefix(ln["runs"], marker))
                first_body_on_page = False
                if prev_kind == "ul":
                    doc.cur["items"].append(runs)
                else:
                    doc.add({"t": "ul", "items": [runs]})
                prev_kind = "ul"
                continue

            if body_x is None:
                body_x = ln["x0"]

            # bullet continuation: indented past the list marker, or carried over
            # a page break mid-item
            item_tail = (doc.cur["items"][-1][-1]["t"]
                         if prev_kind == "ul" and doc.cur["items"][-1] else "")
            if prev_kind == "ul" and first_body_on_page and \
                    not item_tail.endswith((".", ";", ":", "!", "?")):
                first_body_on_page = False
                doc.cur["items"][-1] = clean_runs(
                    runs_join(doc.cur["items"][-1], ln["runs"]))
                continue
            if prev_kind == "ul" and ln["x0"] > body_x + 4:
                runs_join(doc.cur["items"][-1], clean_runs(ln["runs"]))
                doc.cur["items"][-1] = clean_runs(doc.cur["items"][-1])
                continue

            # ---- callout ("> " prefixed note)
            if text.startswith("> "):
                runs = clean_runs(strip_prefix(ln["runs"], "> "))
                doc.add({"t": "callout", "runs": runs})
                prev_kind = "callout"
                continue

            # ---- paragraph: continue the previous one on a tight line gap, or
            # across a page break when the previous line stopped mid-sentence.
            same_para = (prev_kind in ("p", "callout") and gap is not None and gap <= 15.5)
            if first_body_on_page and prev_kind in ("p", "callout"):
                tail = doc.cur["runs"][-1]["t"] if doc.cur["runs"] else ""
                same_para = not tail.endswith((".", ";", ":", "!", "?"))
            if same_para:
                runs_join(doc.cur["runs"], ln["runs"])
                doc.cur["runs"] = clean_runs(doc.cur["runs"])
            else:
                doc.add({"t": "p", "runs": clean_runs(ln["runs"])})
                prev_kind = "p"
            first_body_on_page = False

    return {
        "source": os.path.basename(path),
        "family": family,
        "title": " ".join(r["t"] for r in clean_runs(doc.title_runs)),
        "meta": doc.meta,
        "lede": doc.lede,
        "sections": doc.sections,
    }


if __name__ == "__main__":
    out = {}
    for p in sorted(glob.glob(os.path.join(SRC, "*.pdf"))):
        out[os.path.basename(p)] = parse(p)
        print("parsed", os.path.basename(p), file=sys.stderr)
    json.dump(out, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
