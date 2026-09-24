import Link from "next/link";
import { DeleteSubmission } from "./DeleteSubmission";
import { formatSubmittedAt, type Submission } from "./data";
import { buildReviewData, padSectionNumber, SECTIONS } from "../../../discovery/data";
import { ReviewValueView } from "../../../discovery/ReviewValue";
// The answers are drawn with the wizard's own classes, which live in the
// wizard's stylesheet. Without this every chip, table and "TBC" marker renders
// as unstyled text, because the admin stylesheet has no `dw-` rules.
import "../../../discovery/discovery.css";

/**
 * One submission, read back.
 *
 * A Server Component: the answers are replayed through `buildReviewData` and
 * `ReviewValueView` — the same pair the wizard's own review sheet uses, so the
 * editor reads what the visitor saw — and neither needs to run in a browser.
 * Only the delete button is a client island.
 */
export function SubmissionView({ submission }: { submission: Submission }) {
  const sections = buildReviewData(submission.answers, submission.repRows);

  // Project Basics is the contact card above, so it is not repeated below.
  const basics = SECTIONS[0];
  const replayed = sections.filter(({ section }) => section !== basics);

  const contact = basics.questions
    .filter((q) => CONTACT_IDS.includes(q.id))
    .map((q) => ({
      label: q.label,
      value: CONTACT_VALUES[q.id as keyof typeof CONTACT_VALUES](submission),
      isEmail: q.id === "email",
    }));

  return (
    <div className="cms-page cms-page--narrow">
      <Link href="/admin/submissions" className="cms-link-btn">
        ← All submissions
      </Link>

      <div className="cms-editor-head">
        <h1 className="cms-h">{submission.company || "Company not given"}</h1>
        <span className="cms-mono">Sent {formatSubmittedAt(submission.createdAt)}</span>
      </div>

      <div className="cms-card">
        <span className="cms-label">Who sent it</span>
        <div className="cms-grid-2">
          {contact.map(({ label, value, isEmail }) => (
            <div key={label} className="cms-field">
              <span className="cms-label">{label}</span>
              <span>
                {isEmail && value ? (
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

      {replayed.map(({ section, sectionIndex, items, answeredCount, total }) => (
        <div className="cms-card" key={section.name}>
          <span className="cms-label">
            {padSectionNumber(sectionIndex)} · {section.name} — {answeredCount} of {total} answered
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

      <DeleteSubmission id={submission.id} />
    </div>
  );
}

/** The six questions whose answers are lifted into their own columns. */
const CONTACT_IDS = ["company", "contactName", "contactRole", "email", "phone", "projectName"];

const CONTACT_VALUES = {
  company: (s: Submission) => s.company,
  contactName: (s: Submission) => s.contactName,
  contactRole: (s: Submission) => s.contactRole,
  email: (s: Submission) => s.email,
  phone: (s: Submission) => s.phone,
  projectName: (s: Submission) => s.projectName,
} as const;
