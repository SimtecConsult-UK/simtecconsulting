import type { Metadata } from "next";
import { ibmPlexSans } from "../lib/fonts";
import "./admin.css";

export const metadata: Metadata = {
  title: "Content manager — Simtec",
  // The CMS is a private tool. robots.ts disallows /admin as well; this stops
  // a crawler that reached a page anyway from listing it.
  robots: { index: false, follow: false },
};

/**
 * Nothing under /admin may be prerendered or cached. These pages depend on who
 * is signed in, and a static copy of an editor screen could otherwise be built
 * at deploy time and served to anyone.
 */
export const dynamic = "force-dynamic";

/**
 * Wraps both the sign-in page and the signed-in shell. It deliberately does no
 * authentication of its own — `(shell)/layout.tsx` does that for the pages
 * behind the login, and the login page has to render for signed-out visitors.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${ibmPlexSans.variable} cms`}>{children}</div>;
}
