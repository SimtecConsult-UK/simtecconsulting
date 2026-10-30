import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { SeoJsonLd } from "../components/SeoJsonLd";
import { ContentsNav } from "../components/contents/ContentsNav";
import { AboutFaq } from "../components/about/AboutFaq";
import { ibmPlexSans } from "../lib/fonts";
import { BOOKING_URL, ROUTES } from "../lib/sections";
import { pageMetadata } from "../lib/seo/metadata";
import {
  ABOUT_SECTIONS as S,
  ABOUT_TOC,
  APPROACH,
  CAPABILITIES,
  CLOSING,
  COST,
  ENGAGEMENT,
  FAQS,
  FOUNDER_PHOTO,
  HERO,
  PEOPLE,
  PROOF,
  STORY,
  WALES,
  WORK_HREF,
  type Rich,
} from "../lib/about/content";
import "../components/about/about.css";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(ROUTES.about);
}

/** Handover "design_handoff_about_us": the policy-1c document layout, a
    single white panel with a sticky "On this page" card beside it. */
export default function AboutPage() {
  return (
    <>
      <SeoJsonLd path={ROUTES.about} faqs={FAQS} />
      <Nav solid />
      <main className={`${ibmPlexSans.variable} ab-root`}>
        <header className="ab-head">
          <div className="ab-head-inner">
            <nav aria-label="Breadcrumb" className="ab-crumbs">
              <Link href={ROUTES.home}>Home</Link>
              <span aria-hidden="true">/</span>
              <span className="ab-crumb-current" aria-current="page">
                About Simtec
              </span>
            </nav>
            <h1 className="ab-title">{HERO.title}</h1>
            <p className="ab-lead">{HERO.lead}</p>
            <div className="ab-actions ab-head-actions">
              <BookButton withArrow />
              <WorkButton />
            </div>
          </div>
        </header>

        <div className="ab-body">
          <div className="ab-grid">
            <div className="ab-panel">
              <Section id={S.story.id} title="Our story" gap={18}>
                {FOUNDER_PHOTO && (
                  <Image
                    className="ab-photo"
                    src={FOUNDER_PHOTO.src}
                    alt={FOUNDER_PHOTO.alt}
                    width={FOUNDER_PHOTO.width}
                    height={FOUNDER_PHOTO.height}
                    sizes="(min-width: 1180px) 686px, (min-width: 900px) calc(100vw - 430px), (min-width: 640px) calc(100vw - 106px), calc(100vw - 74px)"
                  />
                )}
                <Paragraphs items={STORY.paragraphs} />
                <blockquote className="ab-quote">
                  <p>{STORY.quote}</p>
                  <footer>{STORY.attribution}</footer>
                </blockquote>
              </Section>

              <Section id={S.proof.id} title="What that looks like in practice" intro={PROOF.intro} gap={22}>
                <div className="ab-cards">
                  {PROOF.cards.map((card) => (
                    <article key={card.title} className={`ab-card ab-card--${card.layout}`}>
                      {"badge" in card && <span className="ab-badge">{card.badge}</span>}
                      <h3>{card.title}</h3>
                      <p>
                        <RichText parts={card.body} />
                      </p>
                    </article>
                  ))}
                </div>
                <div className="ab-bar ab-bar--dark">
                  <a href={WORK_HREF} className="ab-bar-link">
                    {PROOF.ctaLink}
                  </a>
                  <BookButton size="sm" />
                </div>
              </Section>

              <Section id={S.approach.id} title={APPROACH.title}>
                <Paragraphs items={APPROACH.paragraphs} />
              </Section>

              <Section id={S.capabilities.id} title="What we design and build" intro={CAPABILITIES.intro} gap={22}>
                <div className="ab-cards">
                  {CAPABILITIES.groups.map((group) => (
                    <div key={group.title} className={`ab-card ab-cap ab-card--${group.layout ?? "half"}`}>
                      <h3>{group.title}</h3>
                      <ul className="ab-dots">
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="ab-note">{CAPABILITIES.note}</p>
              </Section>

              <Section id={S.people.id} title="The people responsible">
                <Paragraphs items={PEOPLE} />
              </Section>

              <Section id={S.engagement.id} title="What an engagement involves" gap={22}>
                {/* role="list" keeps the list announced in Safari, which drops it for
                    list-style:none; the visible numbers are then left to the list. */}
                <ol className="ab-steps" role="list">
                  {ENGAGEMENT.steps.map((step, index) => (
                    <li key={step.title}>
                      <span className="ab-step-num" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="ab-callout">
                  <p>{ENGAGEMENT.callout}</p>
                </div>
              </Section>

              <Section id={S.cost.id} title="What does it cost?" gap={20}>
                <div className="ab-tiles">
                  {COST.tiles.map((tile) => (
                    <div key={tile.label} className="ab-tile">
                      <span className="ab-tile-label">{tile.label}</span>
                      <span className="ab-tile-value">{tile.value}</span>
                    </div>
                  ))}
                </div>
                <Paragraphs items={COST.paragraphs} />
                <div className="ab-bar ab-bar--light">
                  <span className="ab-bar-title">{COST.cta}</span>
                  <div className="ab-actions">
                    <BookButton size="sm" />
                    <WorkButton size="sm" />
                  </div>
                </div>
              </Section>

              <Section id={S.wales.id} title="A Welsh business with a practical ambition">
                <p className="ab-p">{WALES}</p>
              </Section>

              <Section id={S.faq.id} title="Questions worth asking us" gap={18}>
                <AboutFaq faqs={FAQS} />
              </Section>
            </div>

            <aside className="ab-aside">
              <div className="ab-toc">
                <ContentsNav
                  label="On this page"
                  items={ABOUT_TOC}
                  listClassName="ab-toc-list"
                  linkClassName="ab-toc-link"
                  labelClassName="ab-toc-label"
                />
              </div>
            </aside>
          </div>
        </div>

        <section id="contact" aria-labelledby="h-cta" className="ab-contact">
          <div className="ab-contact-inner">
            <div className="ab-contact-copy">
              <h2 id="h-cta">{CLOSING.title}</h2>
              <p>{CLOSING.body}</p>
            </div>
            <div className="ab-actions ab-contact-actions">
              <BookButton size="lg" />
              <WorkButton size="lg" onDark />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  intro,
  gap = 16,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  /** Space between the section's blocks, which the handover varies per section. */
  gap?: number;
  children: React.ReactNode;
}) {
  const headingId = `h-${id}`;
  const heading = (
    <h2 id={headingId} className="ab-h2">
      {title}
    </h2>
  );

  return (
    <section id={id} aria-labelledby={headingId} className="ab-section" style={{ rowGap: gap }}>
      {intro ? (
        <div className="ab-intro">
          {heading}
          <p className="ab-p">{intro}</p>
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return items.map((text) => (
    <p key={text} className="ab-p">
      {text}
    </p>
  ));
}

function RichText({ parts }: { parts: Rich }) {
  return parts.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <a key={index} href={part.href} className="ab-link">
        {part.text}
      </a>
    )
  );
}

type ButtonSize = "sm" | "lg";

const sizeClass = (size?: ButtonSize) => (size ? ` ab-btn-${size}` : "");

/** "Book a Workshop" goes to the same external booking page as the site nav. */
function BookButton({ size, withArrow = false }: { size?: ButtonSize; withArrow?: boolean }) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`ab-btn ab-btn-primary${sizeClass(size)}`}
    >
      Book a Workshop
      {withArrow && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      )}
    </a>
  );
}

function WorkButton({ size, onDark = false }: { size?: ButtonSize; onDark?: boolean }) {
  return (
    <a
      href={WORK_HREF}
      className={`ab-btn ${onDark ? "ab-btn-ghost" : "ab-btn-secondary"}${sizeClass(size)}`}
    >
      See our work
    </a>
  );
}
