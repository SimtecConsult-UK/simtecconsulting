import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CookieConsent } from "./components/CookieConsent";
import { SITE_URL } from "./lib/sections";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const leagueSpartan = localFont({
  src: [
    { path: "../public/fonts/leaguespartan-bold.woff2", weight: "700" },
    { path: "../public/fonts/leaguespartan-bold.woff", weight: "700" },
  ],
  variable: "--font-league-spartan",
});

/**
 * Every public page is rebuilt on this timer.
 *
 * It lives here rather than on each page because the whole site depends on
 * content that changes without a deploy: case studies on the homepage, posts on
 * the blog, and — through the footer, which every page carries — whether the
 * blog has anything in it at all. The lowest `revalidate` in a route wins, so a
 * page needing something faster can still say so; the admin area opts out
 * entirely with `dynamic = "force-dynamic"`.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  // Lets every page give canonical and Open Graph URLs as plain paths; Next
  // resolves them against this origin.
  metadataBase: new URL(SITE_URL),
  title: "Simtec — Construction management software",
  description:
    "Construction management software that helps teams deliver projects faster, safer, and on budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${leagueSpartan.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
