"use client";

import Script from "next/script";
import type { MouseEvent, ReactNode } from "react";

/** The Elfsight "Simtec WhatsApp Chat" widget, configured in Elfsight's dashboard. */
const ELFSIGHT_APP_CLASS = "elfsight-app-05c9998a-a1c2-4364-a00f-c75ad525e6f1";

/**
 * Where the widget's own "Chat on WhatsApp" button goes. Used when the widget
 * has not loaded (script blocked, or clicked before it arrived) so the icon
 * still reaches WhatsApp. Keep in step with the number set in Elfsight.
 */
const WHATSAPP_FALLBACK = "https://api.whatsapp.com/message/2PSTZ3EC3QMCE1";

const PHONE_DISPLAY = "+44 1446 396891";
const PHONE_HREF = "tel:+441446396891";
const LINKEDIN = "https://www.linkedin.com/company/simtec-software/";

/**
 * Opens the Elfsight chat window by pressing its floating bubble, which lives
 * in a shadow root the widget renders into a portal at the end of the page.
 * Returns false when the widget is not on the page yet.
 */
function openElfsightChat(): boolean {
  const hosts = document.querySelectorAll<HTMLElement>(".es-portal-root > div");
  for (const host of hosts) {
    const bubble = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Open chat window"], button[aria-label="Close chat window"]',
    );
    if (!bubble) continue;
    // Already open: leave it open rather than toggling it shut.
    if (bubble.getAttribute("aria-label") === "Open chat window")
      bubble.click();
    return true;
  }
  return false;
}

function IconLink({
  href,
  label,
  onClick,
  children,
}: {
  href: string;
  label: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}) {
  // Web links open in a new tab; tel: hands off to the phone app in place.
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors duration-150 hover:border-black/30 hover:text-black"
    >
      {children}
    </a>
  );
}

/**
 * The Elfsight WhatsApp widget. It draws a floating chat bubble in the corner
 * of every page that has the footer, from page load — `data-elfsight-app-lazy`
 * does not hold a floating widget back until the footer scrolls into view. The
 * footer's WhatsApp icon opens the same chat window.
 */
export function WhatsAppChatWidget() {
  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className={ELFSIGHT_APP_CLASS} data-elfsight-app-lazy />
    </>
  );
}

/** WhatsApp, LinkedIn and phone, under the email in the footer's Contact column. */
export function FooterContactIcons() {
  return (
    <div className="mt-4 flex items-center gap-3">
      <IconLink
        href={WHATSAPP_FALLBACK}
        label="Chat with us on WhatsApp"
        onClick={(event) => {
          if (openElfsightChat()) event.preventDefault();
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.32 11.32 0 0 0 12.05.63C5.77.63.66 5.74.66 12.02c0 2.01.52 3.97 1.52 5.7L.56 23.63l6.04-1.58a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
        </svg>
      </IconLink>
      <IconLink href={LINKEDIN} label="Simtec on LinkedIn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
      </IconLink>
      <IconLink href={PHONE_HREF} label={`Call us on ${PHONE_DISPLAY}`}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </IconLink>
    </div>
  );
}
