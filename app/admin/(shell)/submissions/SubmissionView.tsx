"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { DeleteFooter } from "../../EditorUI";
import { deleteSubmission } from "./actions";
import type { Submission } from "./data";
import { buildReviewData, padSectionNumber } from "../../../discovery/data";
import { ReviewValueView } from "../../../discovery/ReviewShared";

/**
 * One submission, read back.
 *
 * The answers are replayed through `buildReviewData` and `ReviewValueView` —
 * the same pair the wizard's own review sheet uses — so what the editor reads
 * is what the visitor saw before they sent it, rather than a second rendering
 * that could drift from it.
 */
export function SubmissionView({
  submission,
  submittedAt,
}: {
  submission: Submission;
  submittedAt: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const sections = buildReviewData(submission.answers, submission.repRows);

  const contact = [
    ["Company", submission.company],
    ["Contact", submission.contactName],
    ["Role", submission.contactRole],
    ["Email", submission.email],
    ["Phone", submission.phone],
    ["Project", submission.projectName],
  ] as const;

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/submissions" className="cms-link-btn">
        ← All submissions
      </Link>

      <div className="cms-editor-head">
        <h1 className="cms-h">{submission.company || "Company not given"}</h1>
        <span className="cms-mono">Sent {submittedAt}</span>
      </div>

      {error && (
        <div className="cms-banner cms-banner--error" role="alert">
          {error}
        </div>
      )}

      <div className="cms-card">
        <span className="cms-label">Who sent it</span>
        <div className="cms-grid-2">
          {contact.map(([label, value]) => (
            <div key={label} className="cms-field">
              <span className="cms-label">{label}</span>
              <span>
                {label === "Email" && value ? (
                  <a href={`mailto:${value}`} className="cms-link-btn" style={{ padding: 0 }}>
                    {value}
                  </a>
                ) : (
                  value || "—"
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="cms-help">
          {submission.consent
            ? "Consented to Simtec preparing a Phase 1 scope from these answers."
            : "No consent recorded — check before acting on this."}
        </p>
      </div>

      {sections.map(({ section, sectionIndex, items, answeredCount, total }) => (
        <div className="cms-card" key={section.name}>
          <span className="cms-label">
            {padSectionNumber(sectionIndex)} · {section.name} — {answeredCount} of {total}{" "}
            answered
          </span>

          {items.map(({ question, value }) => (
            <div className="cms-field" key={question.id}>
              <span className="cms-label">{question.label}</span>
              <ReviewValueView value={value} />
            </div>
          ))}

          {items.length === 0 && <p className="cms-help">Nothing answered in this section.</p>}
        </div>
      ))}

      <DeleteFooter
        help="Deleting removes this submission for good. It is the only copy."
        label="Delete submission"
        confirming={confirmDelete}
        disabled={pending}
        onDelete={() => {
          if (!confirmDelete) {
            setConfirmDelete(true);
            return;
          }
          startTransition(async () => {
            const result = await deleteSubmission(submission.id);
            if (result?.error) setError(result.error);
          });
        }}
      />
    </div>
  );
}
