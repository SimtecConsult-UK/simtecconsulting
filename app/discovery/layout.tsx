import type { Metadata } from "next";
import { ibmPlexSans } from "../lib/fonts";
import "./discovery.css";

export const metadata: Metadata = {
  title: "Discovery Workshop — Simtec",
  description: "Scope your project with Simtec's discovery workshop wizard.",
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

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${ibmPlexSans.variable} dw-root`}>{children}</div>;
}
