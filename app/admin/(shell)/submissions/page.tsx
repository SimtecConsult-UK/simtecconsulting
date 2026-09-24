import Link from "next/link";
import { LIST_LIMIT, formatSubmittedAt, listSubmissions } from "./data";

export default async function SubmissionsListPage() {
  const submissions = await listSubmissions();
  const unread = submissions.filter((s) => !s.isRead).length;

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <h1 className="cms-h">Submissions</h1>
          <p>
            Completed discovery wizards, newest first. These are records of what
            somebody sent, so they are read-only.
          </p>
          <p>
            <strong>Nothing emails you when one arrives</strong> — check here
            regularly, or an enquiry can sit unread.
          </p>
        </div>
      </div>

      {submissions.length > 0 && (
        <span className="cms-label">
          {submissions.length === LIST_LIMIT
            ? `Showing the most recent ${LIST_LIMIT}`
            : `${submissions.length} in total`}
          {unread > 0 ? ` · ${unread} not yet opened` : ""}
        </span>
      )}

      <div className="cms-rows">
        {submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/admin/submissions/${submission.id}`}
            className="cms-row"
            style={{ gridTemplateColumns: "1fr auto" }}
          >
            <span className="cms-row-body">
              <span style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                <span className="cms-row-title">
                  {submission.company || "Company not given"}
                </span>
                {!submission.isRead && <span className="cms-chip cms-chip--live">New</span>}
              </span>
              <span className="cms-row-meta">
                {[submission.contactName, submission.email].filter(Boolean).join(" · ") ||
                  "No contact details"}
              </span>
              <span className="cms-row-meta">
                {submission.projectName || "No project name"} ·{" "}
                {formatSubmittedAt(submission.createdAt)}
              </span>
            </span>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9aa5a4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3.5L10.5 8 6 12.5" />
            </svg>
          </Link>
        ))}

        {submissions.length === 0 && (
          <div className="cms-empty">
            Nothing here yet. Completed discovery wizards arrive here.
          </div>
        )}
      </div>
    </div>
  );
}
