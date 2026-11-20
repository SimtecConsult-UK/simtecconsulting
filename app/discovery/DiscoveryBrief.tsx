"use client";

import { BriefPaper } from "./BriefPaper";
import { briefFileName, printBrief } from "./printBrief";
import { type Answers, type ReviewSectionData } from "./data";
import { SubmitButton, useBodyScrollLock, useEscapeKey } from "./ReviewShared";
import type { SubmitStatus } from "./submission";

export function DiscoveryBrief({
  answers,
  sections,
  consent,
  submit,
  onClose,
  onSubmit,
}: {
  answers: Answers;
  sections: ReviewSectionData[];
  consent: boolean;
  submit: SubmitStatus;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useBodyScrollLock();
  useEscapeKey(onClose);

  const company = answers.company as string | undefined;
  const projectName = answers.projectName as string | undefined;
  const download = () => printBrief(briefFileName(company, projectName));

  return (
    <div className="dw-review-scrim dw-docscrim">
      <div className="dw-docwrap">
        <div className="dw-toolbar">
          <span className="dw-doclabel">DISCOVERY BRIEF · PREVIEW</span>
          <span className="dw-toolactions">
            <button className="dw-tbtn" onClick={download}>
              ⬇ Download PDF
            </button>
            <button className="dw-tbtn" onClick={download}>
              Print
            </button>
            <SubmitButton
              submit={submit}
              consent={consent}
              onSubmit={onSubmit}
              className="dw-tbtn dw-tbtn-teal"
              restingLabel="Looks right — submit →"
              sentLabel="✓ Sent"
              consentHint="Close this preview and tick the consent box on the review screen"
            />
            <button className="dw-tbtn dw-tbtn-x" onClick={onClose} aria-label="Close preview">
              ✕
            </button>
          </span>
        </div>

        <BriefPaper
          company={company}
          projectName={projectName}
          stage="DRAFT"
          sections={sections}
        />
      </div>
    </div>
  );
}
