// The Discovery Brief document itself — the A4 "paper" the visitor previews
// and downloads from the wizard, and the one the CMS prints when an editor
// downloads a submission. Kept free of hooks and `"use client"` so the CMS can
// render it on the server; the wizard's DiscoveryBrief wraps it in its overlay
// and toolbar.

import { Fragment } from "react";
// The wizard's stylesheet, imported here rather than by each page that draws
// these: the CMS renders them outside the wizard, and without it every chip,
// table and "TBC" marker — and the brief's A4 print setup — would be lost.
import "./discovery.css";
import { Logo } from "../components/Logo";
import { type ReviewItem, type ReviewSectionData, padSectionNumber, reviewTotals } from "./data";
import { ReviewValueView } from "./ReviewValue";

// The brief lists an answer's plain fields as one definition list, then every
// repeater as its own table below it (matching the design reference) — one
// pass over the section's items sorts each into its bucket instead of
// filtering the same list twice.
function splitFieldsAndTables(items: ReviewItem[]): { fields: ReviewItem[]; tables: ReviewItem[] } {
  const fields: ReviewItem[] = [];
  const tables: ReviewItem[] = [];
  items.forEach((item) => (item.value.kind === "table" ? tables : fields).push(item));
  return { fields, tables };
}

export function BriefPaper({
  company,
  projectName,
  stage,
  note,
  sections,
}: {
  company?: string | null;
  projectName?: string | null;
  /** Leads the mono line under the project name: "DRAFT", or when it was sent. */
  stage: string;
  /** A line under the header — the CMS uses it to carry the consent record onto the PDF. */
  note?: string;
  sections: ReviewSectionData[];
}) {
  const { answered, tbc } = reviewTotals(sections);
  return (
    <div className="dw-paper">
      <div className="dw-dochead">
        <div>
          <Logo height={15} opacity={0.9} />
          <h2 className="dw-doct">Discovery Brief</h2>
        </div>
        <div className="dw-dochead-r">
          <div>
            <strong>{company || "—"}</strong>
          </div>
          <div>{projectName || "—"}</div>
          <div className="dw-docstatus">
            {stage} · {answered} ANSWERED · {tbc} TBC
          </div>
        </div>
      </div>

      {note && <p className="dw-docnote">{note}</p>}

      {sections.map((s) => {
        const { fields, tables } = splitFieldsAndTables(s.items);
        return (
          <div className="dw-dsec" key={s.section.name}>
            <div className="dw-dsecn">
              <span>{padSectionNumber(s.sectionIndex)}</span>
              <h5>{s.section.name}</h5>
            </div>
            <dl className="dw-dl">
              {fields.map((item) => (
                <Fragment key={item.question.id}>
                  <dt>{item.question.label}</dt>
                  <dd>
                    <ReviewValueView value={item.value} />
                  </dd>
                </Fragment>
              ))}
            </dl>
            {tables.map((item) => (
              <ReviewValueView key={item.question.id} value={item.value} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
