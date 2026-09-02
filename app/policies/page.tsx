import type { Metadata } from "next";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ibmPlexSans } from "../lib/fonts";
import { POLICY_COUNT } from "../lib/legal/catalog";
import { PoliciesBrowser } from "./PoliciesBrowser";
import "../components/legal/legal.css";

export const metadata: Metadata = {
  title: "Policies — Simtec",
  description: `The ${POLICY_COUNT} policies that govern how Simtec Consult operates, each reviewed annually and available to download.`,
};

export default function PoliciesPage() {
  return (
    <>
      <Nav solid />
      <main className={`${ibmPlexSans.variable} lg-root lg-x`}>
        <PoliciesBrowser />
      </main>
      <Footer />
    </>
  );
}
