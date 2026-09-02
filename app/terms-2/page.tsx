import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { GENERAL_TERMS_PROJECT } from "../lib/legal/terms-content";
import { TermsDocument } from "../components/legal/TermsDocument";

/* "General Terms 2" — the variant incorporating project and time-based work.
   Issued to specific support customers, so it is deliberately unlisted: no link
   points at it, and it is excluded from search engines here and in app/robots.ts. */
export const metadata: Metadata = {
  title: "General Terms — Simtec",
  description:
    "General terms incorporating project and time-based work, issued to specific Simtec support customers.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function GeneralTermsTwoPage() {
  return (
    <>
      <Nav solid />
      <TermsDocument doc={GENERAL_TERMS_PROJECT} />
      <Footer />
    </>
  );
}
