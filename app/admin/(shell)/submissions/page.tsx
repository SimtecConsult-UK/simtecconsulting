import Link from "next/link";
import { countUnreadSubmissions } from "../counts";
import { PAGE_SIZE, formatSubmittedAt, listSubmissions } from "./data";

export default async function SubmissionsListPage(
  props: PageProps<"/admin/submissions">
) {
  const { page: requested } = await props.searchParams;
  const { items, page, pageCount, total } = await listSubmissions(
    Number(typeof requested === "string" ? requested : 1)
  );
  // Across every page, not just this one — "3 not yet opened" should mean the
  // same thing on page two as it does on page one.
  const unread = await countUnreadSubmissions();

  const first = (page - 1) * PAGE_SIZE + 1;
  const last = first + items.length - 1;

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

      {total > 0 && (
        <span className="cms-label">
          {total <= PAGE_SIZE
            ? `${total} in total`
            : `Showing ${first}–${last} of ${total}`}
          {unread > 0 ? ` · ${unread} not yet opened` : ""}
        </span>
      )}

      <div className="cms-rows">
        {items.map((submission) => (
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

        {items.length === 0 && (
          <div className="cms-empty">
            Nothing here yet. Completed discovery wizards arrive here.
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <nav className="cms-pager" aria-label="Submission pages">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="cms-link-btn" rel="prev">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="cms-label">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} className="cms-link-btn" rel="next">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

/** Page one is the bare path, so the section's own sidebar link stays canonical. */
function pageHref(page: number): string {
  return page <= 1 ? "/admin/submissions" : `/admin/submissions?page=${page}`;
}
