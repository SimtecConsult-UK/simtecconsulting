import { Blocks } from "./Blocks";
import { ContentsNav } from "./ContentsNav";
import { ibmPlexSans } from "../../lib/fonts";
import type { TermsDoc } from "../../lib/legal/types";
import "./legal.css";

const CONTACT_EMAIL = "hello@simtecconsult.com";

/** Handover screen 1a: one long document with a sticky clause index. */
export function TermsDocument({ doc }: { doc: TermsDoc }) {
  return (
    <main className={`${ibmPlexSans.variable} lg-root lg-t`}>
      <div className="lg-t-head">
        <div className="lg-crumbs">
          <span>Legal</span>
          <span aria-hidden="true">/</span>
          <span className="lg-crumb-current">{doc.title}</span>
        </div>

        <h1 className="lg-t-title">{doc.title}</h1>

        <div className="lg-t-meta">
          <div className="lg-t-meta-item">
            <span className="lg-eyebrow">Last updated</span>
            <span>{doc.updated}</span>
          </div>
          <div className="lg-t-meta-sep" aria-hidden="true" />
          <div className="lg-t-meta-item">
            <span className="lg-eyebrow">Clauses</span>
            <span>{doc.sections.length}</span>
          </div>
        </div>
      </div>

      <div className="lg-t-body">
        <aside className="lg-t-rail">
          <ContentsNav
            variant="rail"
            label="On this page"
            items={doc.sections.map((section) => ({
              id: section.id,
              label: section.heading,
            }))}
          />
        </aside>

        <article className="lg-t-article">
          {doc.lede.length > 0 && (
            <div className="lg-t-lede">
              <Blocks blocks={doc.lede} />
            </div>
          )}

          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="lg-t-clause">
              <h2 className="lg-t-h2">{section.heading}</h2>
              <Blocks blocks={section.blocks} />
            </section>
          ))}

          <div className="lg-t-close">
            <h2>Questions about this document?</h2>
            <p>
              Contact{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
