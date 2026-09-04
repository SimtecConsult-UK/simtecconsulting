import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { Blocks } from "../../components/legal/Blocks";
import { ContentsNav } from "../../components/legal/ContentsNav";
import { DownloadIcon } from "../../components/legal/icons";
import { ibmPlexSans } from "../../lib/fonts";
import { POLICY_COUNT } from "../../lib/legal/catalog";
import {
  getPolicy,
  getPolicySlugs,
  getSiblings,
} from "../../lib/legal/policies";
import { ROUTES } from "../../lib/sections";
import "../../components/legal/legal.css";

/** The section that closes several policies with an approval and signature. */
const SIGN_OFF_HEADING = "APPROVAL";

export function generateStaticParams() {
  return getPolicySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/policies/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const policy = getPolicy(slug);
  if (!policy) return {};
  return {
    title: `${policy.title} — Simtec`,
    description: policy.sourceTitle,
  };
}

export default async function PolicyPage(props: PageProps<"/policies/[slug]">) {
  const { slug } = await props.params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const siblings = getSiblings(slug);
  const signOff =
    policy.sections.at(-1)?.heading === SIGN_OFF_HEADING
      ? policy.sections.at(-1)
      : undefined;
  const sections = signOff ? policy.sections.slice(0, -1) : policy.sections;

  return (
    <>
      <Nav solid />

      <main className={`${ibmPlexSans.variable} lg-root lg-p`}>
        <div className="lg-band">
          <div className="lg-band-inner">
            <div className="lg-crumbs">
              <Link href={ROUTES.home}>Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={ROUTES.policies}>Policies</Link>
              <span aria-hidden="true">/</span>
              <span className="lg-crumb-current">{policy.name}</span>
            </div>

            <div className="lg-p-title-row">
              <h1 className="lg-p-title">{policy.title}</h1>
              <a className="lg-download-btn" href={policy.pdf} download>
                <DownloadIcon />
                Download PDF
              </a>
            </div>

            <div className="lg-chips">
              {policy.version && (
                <span className="lg-chip is-primary">v{policy.version}</span>
              )}
              {policy.updated && (
                <span className="lg-chip">Updated {policy.updated}</span>
              )}
              {policy.owner && (
                <span className="lg-chip">Owner: {policy.owner}</span>
              )}
            </div>

            <div className="lg-band-spacer" />
          </div>
        </div>

        <div className="lg-p-content">
          <div className="lg-p-grid">
            <article className="lg-p-card">
              {policy.lede.length > 0 && (
                <div className="lg-p-lede">
                  <Blocks blocks={policy.lede} />
                </div>
              )}

              {sections.map((section) => (
                <section key={section.id} id={section.id} className="lg-p-section">
                  <h2 className="lg-p-h2">{section.heading}</h2>
                  <Blocks blocks={section.blocks} />
                </section>
              ))}

              {signOff && (
                <div id={signOff.id} className="lg-p-foot">
                  <span className="lg-eyebrow">{signOff.heading}</span>
                  <Blocks blocks={signOff.blocks} />
                </div>
              )}

              {policy.details.length > 0 && (
                <div className="lg-p-foot">
                  <span className="lg-eyebrow">Document details</span>
                  <dl className="lg-details">
                    {policy.details.map((field) => (
                      <Fragment key={field.label}>
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </Fragment>
                    ))}
                  </dl>
                </div>
              )}
            </article>

            <aside className="lg-p-side">
              <div className="lg-p-sidecard lg-p-contents">
                <ContentsNav
                  variant="side"
                  label="Contents"
                  items={policy.sections.map((section) => ({
                    id: section.id,
                    label: section.heading,
                  }))}
                />
              </div>

              <div className="lg-p-sidecard lg-p-other">
                <span className="lg-eyebrow">Other policies</span>
                <nav className="lg-p-other-list" aria-label="Other policies">
                  {siblings.map((sibling) => (
                    <Link
                      key={sibling.slug}
                      href={`/policies/${sibling.slug}`}
                      className="lg-p-other-link"
                    >
                      {sibling.name}
                    </Link>
                  ))}
                  <Link href={ROUTES.policies} className="lg-p-other-all">
                    View all {POLICY_COUNT} →
                  </Link>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
