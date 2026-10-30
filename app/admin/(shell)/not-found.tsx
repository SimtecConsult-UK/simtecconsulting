import Link from "next/link";

/**
 * A missing record or address inside the CMS. Kept here so the editor stays in
 * the content manager, sidebar and all, rather than falling through to the
 * public site's 404 and its "Back to homepage" button.
 */
export default function AdminNotFound() {
  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <h1 className="cms-h">Not found</h1>
          <p>This item may have been deleted, or the address is wrong.</p>
        </div>
      </div>

      <div className="cms-card">
        <p className="cms-help">Pick a section from the sidebar, or start from the newsletter.</p>
        <p>
          <Link href="/admin/newsletter" className="cms-btn cms-btn--secondary">
            Go to the newsletter
          </Link>
        </p>
      </div>
    </div>
  );
}
