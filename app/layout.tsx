import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} ${leagueSpartan.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
