import Link from "next/link";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { MAX_HOMEPAGE_CASE_STUDIES } from "../../../lib/caseStudies";
import { listCaseStudies } from "./data";
import { ReorderButtons } from "./ReorderButtons";
import { NotConnected } from "../NotConnected";

export default async function CaseStudiesListPage() {
  if (!isSupabaseConfigured) return <NotConnected />;

  const studies = await listCaseStudies();
  const shown = Math.min(studies.length, MAX_HOMEPAGE_CASE_STUDIES);

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <h1 className="cms-h">Case studies</h1>
          <p>
            The homepage shows these in this order, up to {MAX_HOMEPAGE_CASE_STUDIES}.
          </p>
        </div>
        <Link href="/admin/case-studies/new" className="cms-btn cms-btn--primary">
          New case study
        </Link>
      </div>

      <span className="cms-label">
        {shown} of {MAX_HOMEPAGE_CASE_STUDIES} homepage slots used
        {studies.length > MAX_HOMEPAGE_CASE_STUDIES
          ? ` · only the first ${MAX_HOMEPAGE_CASE_STUDIES} show`
          : ""}
      </span>

      <div className="cms-rows">
        {studies.map((study, index) => (
          <div key={study.id} className="cms-row" style={{ gridTemplateColumns: "auto 120px 1fr auto", cursor: "default" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ReorderButtons
                id={study.id}
                isFirst={index === 0}
                isLast={index === studies.length - 1}
              />
              <span className="cms-mono">{String(index + 1).padStart(2, "0")}</span>
            </span>

            <span className="cms-row-thumb" style={{ width: 120, background: "#fff" }}>
              {study.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={study.logoUrl} alt="" style={{ objectFit: "contain", padding: 8 }} />
              ) : (
                "NO LOGO"
              )}
            </span>

            <span className="cms-row-body">
              <span className="cms-row-title">{study.tabLabel}</span>
              <span className="cms-row-meta">
                {study.headline}
              </span>
              <span className="cms-row-meta">
                Video {study.hasVideo ? "✓" : "—"} · Logo {study.logoUrl ? "✓" : "—"}
                {index >= MAX_HOMEPAGE_CASE_STUDIES ? " · not shown on the homepage" : ""}
              </span>
            </span>

            <Link href={`/admin/case-studies/${study.id}`} className="cms-btn cms-btn--secondary">
              Edit
            </Link>
          </div>
        ))}

        {studies.length === 0 && (
          <div className="cms-empty">
            Nothing here yet. Add the first case study.
          </div>
        )}
      </div>
    </div>
  );
}
