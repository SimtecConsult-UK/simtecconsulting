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
