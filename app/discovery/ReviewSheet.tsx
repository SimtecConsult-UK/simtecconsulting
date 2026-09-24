"use client";

import { useCallback, useRef, useState } from "react";
import { type Answers, type Question, type ReviewSectionData, padSectionNumber } from "./data";
import { ReviewValueView, useBodyScrollLock, useEscapeKey } from "./ReviewShared";

export function ReviewSheet({
  answers,
  sections,
  consent,
  submitted,
  sending,
  submitError,
  onClose,
  onEditQuestion,
  onDownload,
  onToggleConsent,
  onSubmit,
}: {
  answers: Answers;
  sections: ReviewSectionData[];
  consent: boolean;
  submitted: boolean;
  sending: boolean;
  submitError: string | null;
  onClose: () => void;
  onEditQuestion: (question: Question) => void;
  onDownload: () => void;
  onToggleConsent: () => void;
  onSubmit: () => void;
}) {
  useBodyScrollLock();
  useEscapeKey(onClose);

  const totalAnswered = sections.reduce((sum, s) => sum + s.answeredCount, 0);
  const totalTbc = sections.reduce((sum, s) => sum + s.tbcCount, 0);

  const company = (answers.company as string | undefined) || "";
  const projectName = (answers.projectName as string | undefined) || "";
  const title = [company, projectName].filter(Boolean).join(" — ") || "Discovery review";

  const ansRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  const scrollToSection = useCallback((sectionIndex: number) => {
    const container = ansRef.current;
    const target = sectionRefs.current[sectionIndex];
    if (!container || !target) return;
    container.scrollTop = target.offsetTop - 12;
    setActiveSection(sectionIndex);
  }, []);

  const onTranscriptScroll = useCallback(() => {
    const container = ansRef.current;
    if (!container) return;
    const pos = container.scrollTop + 24;
    let current = 0;
    sectionRefs.current.forEach((el, si) => {
      if (el && el.offsetTop <= pos) current = si;
    });
    setActiveSection(current);
  }, []);

  return (
    <div className="dw-review-scrim">
      <div className="dw-sheet" role="dialog" aria-modal="true" aria-label="Review before submitting">
        <div className="dw-shead">
          <div style={{ flex: 1 }}>
            <p className="dw-kick">Review before submitting</p>
            <h3 className="dw-stitle">{title}</h3>
            <p className="dw-ssub">Hover any answer to jump back and change it. Nothing is sent until you submit.</p>
          </div>
          <div className="dw-stat">
            <div>
              <div className="dw-statn dw-statn-ok">{totalAnswered}</div>
              <div className="dw-kick dw-statlbl">Answered</div>
            </div>
            <div>
              <div className="dw-statn dw-statn-muted">{totalTbc}</div>
              <div className="dw-kick dw-statlbl">Left as TBC</div>
            </div>
          </div>
          <button className="dw-sclose" onClick={onClose} aria-label="Close review">
            ×
          </button>
        </div>

        <div className="dw-sbody">
          <div className="dw-rail">
            <p className="dw-kick dw-railhead">Sections</p>
            {sections.map((s) => (
              <div
                key={s.section.name}
                className={`dw-railit${activeSection === s.sectionIndex ? " dw-on" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => scrollToSection(s.sectionIndex)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    scrollToSection(s.sectionIndex);
                  }
                }}
              >
                <span className={`dw-raildot${s.tbcCount > 0 ? " dw-miss" : ""}`} />
                {s.section.shortName}
                <span className="dw-railcnt">
                  {s.answeredCount}/{s.total}
                </span>
              </div>
            ))}
          </div>

          <div className="dw-ansc" ref={ansRef} onScroll={onTranscriptScroll}>
            {sections.map((s) => (
              <div
                key={s.section.name}
                ref={(el) => {
                  sectionRefs.current[s.sectionIndex] = el;
                }}
              >
                <div className="dw-secttl">
                  <span className="dw-secnum">{padSectionNumber(s.sectionIndex)}</span>
                  <h4>{s.section.name}</h4>
                </div>
                {s.items.map((item) => (
                  <div className="dw-qrow" key={item.question.id}>
                    <span className="dw-qlabel">{item.question.label}</span>
                    <span className="dw-qval">
                      <ReviewValueView value={item.value} />
                    </span>
                    <button className="dw-editl" onClick={() => onEditQuestion(item.question)}>
                      EDIT ↗
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="dw-sfoot">
          <span className="dw-consentu" onClick={onToggleConsent}>
            <span className={`dw-cbx${consent ? " dw-on" : ""}`}>✓</span>
            Consent to prepare Phase 1 scope
          </span>
          {!submitted ? (
            <span className="dw-sfootactions">
              {submitError && (
                <span className="dw-senderr" role="alert">
                  {submitError}
                </span>
              )}
              <button className="dw-ghost" onClick={onClose}>
                Back to form
              </button>
              <button className="dw-ghost" onClick={onDownload}>
                Download a copy
              </button>
              <button
                className={`dw-btn-teal${consent && !sending ? "" : " dw-dis"}`}
                disabled={!consent || sending}
                onClick={onSubmit}
              >
                {sending ? "Sending…" : submitError ? "Try again →" : "Submit & book workshop →"}
              </button>
            </span>
          ) : (
            <span className="dw-sfootactions">
              <span className="dw-sentmsg">✓ SENT</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
