import json, re, sys, zipfile
from collections import Counter
from xml.etree import ElementTree as ET
W="{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
base="/Users/cataliniovu/Documents/simtec/Terms/"
files={"saas":base+"Simtec - General SaaS Customer Terms (3).docx",
       "project":base+"Simtec - General Terms (incorporating Project and Time-Based Work).docx"}
docs=json.load(open(sys.argv[1]))
LIT=re.compile(r"^(\d+(?:\.\d+)*)\.?[\s ]+")
for k,path in files.items():
    z=zipfile.ZipFile(path)
    root=ET.fromstring(z.read("word/document.xml"))
    body=root.find(W+"body")
    raw=[]
    for t in body.iter(W+"t"):
        raw.extend((t.text or "").split())
    d=docs[k]; got=[]
    def runs(rs): got.extend("".join(r["t"] for r in rs).split())
    def blocks(bs):
        for b in bs:
            if b["t"] in ("p","clause"): runs(b["runs"])
            elif b["t"] in ("ul","dl"):
                for it in b["items"]: runs(it)
            elif b["t"]=="table":
                for c in b["head"]: got.extend(c.split())
                for r in b["rows"]:
                    for c in r: got.extend(c.split())
    blocks(d["lede"])
    for s in d["sections"]:
        runs(s["heading"]); blocks(s["blocks"])
    import difflib
    a="".join(raw); b="".join(got)
    if a==b: print(f"CHARS OK  {k}: {len(a)} non-space chars identical")
    else:
        sm=difflib.SequenceMatcher(None,a,b)
        print(f"CHARS DIFF {k}: raw={len(a)} got={len(b)} ratio={sm.ratio():.5f}")
        for tag,i1,i2,j1,j2 in sm.get_opcodes():
            if tag=="equal": continue
            print(f"   {tag} ...{a[max(0,i1-45):i1]}[[{a[i1:i2]}]] -> [[{b[j1:j2]}]]{b[j2:j2+25]}...")
    cr,cg=Counter(raw),Counter(got)
    if cr==cg: print(f"WORDS OK  {k}: {len(raw)} words match exactly")
    else:
        print(f"DIFF  {k}: raw={len(raw)} got={len(got)}")
        print("   missing:", dict(list((cr-cg).items())[:30]))
        print("   extra  :", dict(list((cg-cr).items())[:30]))
