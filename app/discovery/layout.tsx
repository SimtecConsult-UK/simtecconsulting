import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./discovery.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
