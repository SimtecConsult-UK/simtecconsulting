import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./components/ArrowIcon";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { ibmPlexSans } from "./lib/fonts";
import { ROUTES } from "./lib/sections";
import "./components/pill-button.css";
import "./components/not-found.css";

// Next adds `noindex` itself to anything served with a 404 status.
export const metadata: Metadata = {
  title: "Page not found | Simtec",
};

/** Handover "design_handoff_404_page" (option 1a). Shown for any unmatched URL
    and wherever a page calls notFound(); Next serves it with a 404 status. */
export default function NotFound() {
  return (
    <>
      <Nav solid />
      <main className={`${ibmPlexSans.variable} nf-root`}>
        <div className="nf-grid">
          <div className="nf-copy">
            <p className="nf-eyebrow">Error 404 · Page not found</p>
            <h1 className="nf-title">We’ve looked everywhere. This page isn’t here.</h1>
            <p className="nf-body">
              The link may be out of date, or the page may have moved. Head back to the homepage
              or tell us what you were looking for.
            </p>
            <Link href={ROUTES.home} className="pill-btn pill-btn-lg pill-btn-primary nf-btn">
              Back to homepage
              <ArrowIcon />
            </Link>
          </div>

          <div className="nf-art">
            <span className="nf-outline" aria-hidden="true">
              404
            </span>
            {/* Pre-cropped from the handover's robot.png to the 340×520 window
                the design shows, so no clipping box is needed. */}
            <Image
              className="nf-robot"
              src="/robot-404.webp"
              alt="Simtec robot mascot checking a tablet"
              width={680}
              height={1040}
              sizes="(min-width: 768px) 340px, 250px"
              loading="eager"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
