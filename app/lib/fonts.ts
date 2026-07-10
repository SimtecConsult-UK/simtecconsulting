import { IBM_Plex_Sans } from "next/font/google";

// Shared so app/discovery/layout.tsx and app/components/MoreModules.tsx don't
// each self-host their own separate copy of the same font family.
export const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
