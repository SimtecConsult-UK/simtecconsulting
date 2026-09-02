import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { GENERAL_TERMS } from "../lib/legal/terms-content";
import { TermsDocument } from "../components/legal/TermsDocument";

export const metadata: Metadata = {
  title: "General Terms — Simtec",
  description:
    "The general customer terms that apply to any Simtec service, including licensing, subscription and professional services.",
};

export default function TermsPage() {
  return (
    <>
      <Nav solid />
      <TermsDocument doc={GENERAL_TERMS} />
      <Footer />
    </>
  );
}
