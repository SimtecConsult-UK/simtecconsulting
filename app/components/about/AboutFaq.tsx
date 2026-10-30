"use client";

import { useState } from "react";
import type { FaqPair } from "../../lib/blog/types";

/**
 * One answer open at a time, the first open on arrival, and a second click on
 * the open question closes it. Closed answers stay in the HTML behind `hidden`
 * rather than going unrendered, so search engines can still read them.
 */
export function AboutFaq({ faqs }: { faqs: FaqPair[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="ab-faq">
      {faqs.map((faq, index) => {
        const isOpen = open === index;
        const buttonId = `faq-b${index}`;
        const panelId = `faq-p${index}`;
        return (
          <div key={faq.q} className="ab-faq-item">
            <h3 className="ab-faq-q">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                <span>{faq.q}</span>
                <span className="ab-faq-icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="ab-faq-a"
              hidden={!isOpen}
            >
              <p>{faq.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
