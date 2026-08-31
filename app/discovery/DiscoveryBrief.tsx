"use client";

import { Fragment } from "react";
import { Logo } from "../components/Logo";
import { type Answers, type ReviewItem, type ReviewSectionData, padSectionNumber } from "./data";
import { ReviewValueView, useBodyScrollLock, useEscapeKey } from "./ReviewShared";

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

export function DiscoveryBrief({
  answers,
  sections,
  consent,
  submitted,
  onClose,
  onSubmit,
}: {
  answers: Answers;
  sections: ReviewSectionData[];
  consent: boolean;
  submitted: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useBodyScrollLock();
  useEscapeKey(onClose);

  const totalAnswered = sections.reduce((sum, s) => sum + s.answeredCount, 0);
  const totalTbc = sections.reduce((sum, s) => sum + s.tbcCount, 0);

  const company = (answers.company as string | undefined) || "";
  const projectName = (answers.projectName as string | undefined) || "";

  return (
    <div className="dw-review-scrim dw-docscrim">
      <div className="dw-docwrap">
        <div className="dw-toolbar">
          <span className="dw-doclabel">DISCOVERY BRIEF · PREVIEW</span>
          <span className="dw-toolactions">
            <button className="dw-tbtn" onClick={() => window.print()}>
              ⬇ Download PDF
            </button>
            <button className="dw-tbtn" onClick={() => window.print()}>
              Print
            </button>
            {!submitted ? (
              <button className="dw-tbtn dw-tbtn-teal" onClick={() => (consent ? onSubmit() : onClose())}>
                Looks right — submit →
              </button>
            ) : (
              <span className="dw-tbtn dw-tbtn-teal dw-tbtn-static">✓ Sent</span>
            )}
            <button className="dw-tbtn dw-tbtn-x" onClick={onClose} aria-label="Close preview">
              ✕
            </button>
          </span>
        </div>

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
                DRAFT · {totalAnswered} ANSWERED · {totalTbc} TBC
              </div>
            </div>
          </div>

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
      </div>
    </div>
  );
}
