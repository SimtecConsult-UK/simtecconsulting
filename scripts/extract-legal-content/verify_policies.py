"""Word-level check: every word in the PDF must appear in the parsed output."""
import glob, json, os, re, sys, difflib
import pdfplumber
SRC="/Users/cataliniovu/Documents/simtec/Simtec Policies"
docs=json.load(open(sys.argv[1]))

def words_of(doc):
    out=[]
    def runs(rs):
        buf = ""
        for r in rs:
            buf += ("" if r.get("glue") else " ") + r["t"]
        out.extend(buf.split())
    out.extend(doc["title"].split())
    for m in doc["meta"]: out.extend((m["label"]+": "+m["value"]).split())
    def blocks(bs):
        for b in bs:
            if b["t"] in ("p","callout"): runs(b["runs"])
            elif b["t"]=="h3": out.extend(b["text"].split())
            elif b["t"]=="ul":
                for it in b["items"]: runs(it)
            elif b["t"]=="table":
                for c in b["head"]: out.extend(c.split())
                for r in b["rows"]:
                    for c in r: out.extend(c.split())
    blocks(doc["lede"])
    for s in doc["sections"]:
        runs(s["heading"]); blocks(s["blocks"])
    return out

FURNITURE=re.compile(r"^(Simtec Consult Ltd policy pack - generated \d{4}-\d\d-\d\d Page \d+|SIMTEC/[A-Z0-9/.]+)$")
for p in sorted(glob.glob(os.path.join(SRC,"*.pdf"))):
    name=os.path.basename(p); d=docs[name]
    raw=[]
    with pdfplumber.open(p) as pdf:
        for pg in pdf.pages:
            for w in pg.extract_words(extra_attrs=["size"]):
                if d["family"]=="A" and w["top"]>pg.height-60: continue
                if d["family"]=="B" and w["size"]<=8.6 and w["top"]>pg.height-100: continue
                t=w["text"]
                if t in ("(cid:127)","●"): continue
                raw.append(t)
    got=words_of(d)
    from collections import Counter
    if raw==got:
        print(f"OK    {name}")
    elif Counter(raw)==Counter(got):
        print(f"REORD {name}  (same words, table cells read column-wise)")
    else:
        cr, cg = Counter(raw), Counter(got)
        print(f"       missing from output: {dict((cr-cg))}")
        print(f"       extra   in  output: {dict((cg-cr))}")
        sm=difflib.SequenceMatcher(None, raw, got)
        print(f"DIFF  {name}  raw={len(raw)} got={len(got)} ratio={sm.ratio():.4f}")
        for tag,i1,i2,j1,j2 in sm.get_opcodes():
            if tag=="equal": continue
            print(f"   {tag}: PDF[{i1}:{i2}]={raw[i1:i2][:14]}  ->  OUT[{j1}:{j2}]={got[j1:j2][:14]}")
