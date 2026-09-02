# Legal content extraction

One-off pipeline that turned the source legal documents into the typed modules
under `app/lib/legal/`. Kept so the pages can be regenerated when a document is
reissued, rather than hand-edited.

The source documents are **not** in this repo. They live alongside it in the
Simtec project folder:

- `Simtec Policies/*.pdf` — 29 policies
- `Terms/*.docx` — the two General Terms documents

## Running it

```bash
python3 -m venv .venv && .venv/bin/pip install pdfplumber
.venv/bin/python parse_policies.py policies.json
.venv/bin/python parse_terms.py terms.json
.venv/bin/python generate.py policies.json terms.json   # writes app/lib/legal/*
```

## Verifying it

Both checks compare the extracted output against the source text and must be run
after any change to the parsers. Text is never rewritten — lines are only
re-joined into the paragraphs, list items and table cells they were laid out as.

```bash
.venv/bin/python verify_policies.py policies.json   # word-level, per PDF
.venv/bin/python verify_terms.py terms.json         # character-level, per .docx
```

Expected, and the only acceptable, differences:

- `REORD` on a PDF containing a table — table cells are read column-wise, so the
  word order differs from a naive left-to-right read of the page.
- Repeated table header rows on tables that continue across a page break; the
  duplicate header is dropped when the halves are merged.
- The `>` marker that prefixes a callout in the source, and the one hand-typed
  clause number in the project Terms (`1.3`), which moves into the clause-number
  field where Word would have generated it.

Anything else means content was lost or altered.
