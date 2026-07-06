"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "../components/Logo";
import {
  type Answers,
  type Question,
  type RepRow,
  type Step,
  SECTIONS,
  STEPS,
  isStepVisible,
} from "./data";

const STORAGE_KEY = "simtec_discovery_wizard";

type PersistedState = {
  idx: number;
  answers: Answers;
  repRows: Record<string, RepRow[]>;
  consent: boolean;
  submitted: boolean;
};

// Rows carry a "__key" field purely so React can track row identity across
// add/remove — it's not real column data and should be ignored by anything
// that reads a row's answers (all rendering here does, via `columns`).
let repRowKeySeq = 0;
function makeRepRow(): RepRow {
  repRowKeySeq += 1;
  return { __key: `r${repRowKeySeq}` };
}

function defaultRows(): RepRow[] {
  return [makeRepRow(), makeRepRow()];
}

function rowsFor(map: Record<string, RepRow[]>, qid: string): RepRow[] {
  return map[qid] || defaultRows();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const isQuestionStep = (s: Step): s is Extract<Step, { kind: "question" }> => s.kind === "question";

export function DiscoveryWizard() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [repRows, setRepRows] = useState<Record<string, RepRow[]>>({});
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingSave = useRef<PersistedState | null>(null);

  const flushSave = useCallback(() => {
    if (!pendingSave.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingSave.current));
    } catch {
      // storage unavailable — draft simply won't persist
    }
    pendingSave.current = null;
  }, []);

  // Rehydrate the saved draft on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        setIdx(saved.idx || 0);
        setAnswers(saved.answers || {});
        setRepRows(saved.repRows || {});
        setConsent(!!saved.consent);
        setSubmitted(!!saved.submitted);
      }
    } catch {
      // ignore malformed drafts
    }
    setHydrated(true);
  }, []);

  // Auto-save on state change, debounced so fast typing doesn't serialize the
  // whole draft on every keystroke (skip the initial pre-hydration render).
  // The pending write is flushed immediately (not just canceled) on unmount
  // or page hide, so a save scheduled just before navigating away isn't lost.
  useEffect(() => {
    if (!hydrated) return;
    pendingSave.current = { idx, answers, repRows, consent, submitted };
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, 400);
    return () => clearTimeout(saveTimer.current);
  }, [hydrated, idx, answers, repRows, consent, submitted, flushSave]);

  useEffect(() => {
    window.addEventListener("pagehide", flushSave);
    return () => {
      window.removeEventListener("pagehide", flushSave);
      flushSave();
    };
  }, [flushSave]);

  const visibleSteps = useMemo(
    () => STEPS.filter((step) => isStepVisible(step, answers)),
    [answers]
  );

  // Keep the index in range if a conditional step (that was current) disappears.
  useEffect(() => {
    setIdx((prev) => clamp(prev, 0, visibleSteps.length - 1));
  }, [visibleSteps.length]);

  const nav = useCallback(
    (delta: number) => {
      // Cancel any pending choice auto-advance so a manual nav (arrow keys,
      // nav buttons) right after selecting an option doesn't double-advance.
      clearTimeout(advanceTimer.current);
      setIdx((prev) => clamp(prev + delta, 0, visibleSteps.length - 1));
    },
    [visibleSteps.length]
  );
  const next = useCallback(() => nav(1), [nav]);
  const prev = useCallback(() => nav(-1), [nav]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (e.key === "Enter" && tag !== "TEXTAREA" && tag !== "BUTTON") {
        e.preventDefault();
        nav(1);
      } else if (e.key === "ArrowUp" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        nav(-1);
      } else if (e.key === "ArrowDown" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        nav(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const currentIndex = clamp(idx, 0, visibleSteps.length - 1);
  const current = visibleSteps[currentIndex];

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleMulti = useCallback((id: string, option: string) => {
    setAnswers((prev) => {
      const cur = (prev[id] as string[] | undefined) || [];
      const has = cur.includes(option);
      return { ...prev, [id]: has ? cur.filter((x) => x !== option) : [...cur, option] };
    });
  }, []);

  const chooseSingle = useCallback(
    (id: string, option: string) => {
      setAnswer(id, option);
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => next(), 300);
    },
    [setAnswer, next]
  );

  const getRows = useCallback(
    (question: Question): RepRow[] => rowsFor(repRows, question.id),
    [repRows]
  );

  const setRepCell = useCallback((qid: string, rowIndex: number, colKey: string, value: string) => {
    setRepRows((prev) => {
      const rows = [...rowsFor(prev, qid)];
      rows[rowIndex] = { ...rows[rowIndex], [colKey]: value };
      return { ...prev, [qid]: rows };
    });
  }, []);

  const addRepRow = useCallback((question: Question) => {
    setRepRows((prev) => ({ ...prev, [question.id]: [...rowsFor(prev, question.id), makeRepRow()] }));
  }, []);

  const removeRepRow = useCallback((question: Question, rowIndex: number) => {
    setRepRows((prev) => {
      const rows = rowsFor(prev, question.id);
      if (rows.length <= 1) return prev;
      return { ...prev, [question.id]: rows.filter((_, i) => i !== rowIndex) };
    });
  }, []);

  const { qTotal, qNum } = useMemo(
    () => ({
      qTotal: visibleSteps.filter(isQuestionStep).length,
      qNum: visibleSteps.slice(0, currentIndex + 1).filter(isQuestionStep).length,
    }),
    [visibleSteps, currentIndex]
  );

  if (!current) return null;

  const sectionIndex = current.kind === "sintro" || current.kind === "question" ? current.sectionIndex : null;
  const section = sectionIndex != null ? SECTIONS[sectionIndex] : null;
  const secNo = sectionIndex != null ? String(sectionIndex + 1).padStart(2, "0") : "";

  const isTealScreen = current.kind === "intro" || current.kind === "sintro";
  const isCenteredBox = current.kind === "intro" || current.kind === "sintro" || current.kind === "end";

  const pct = visibleSteps.length > 1 ? (currentIndex / (visibleSteps.length - 1)) * 100 : 0;

  const bottomLabel =
    current.kind === "intro"
      ? "≈ 15 MINUTES · AUTO-SAVES"
      : current.kind === "end"
      ? "REVIEW & SUBMIT"
      : current.kind === "sintro"
      ? `SECTION ${current.sectionIndex + 1} OF 16`
      : `QUESTION ${qNum} OF ${qTotal}`;

  return (
    <div className={`dw-wiz${isTealScreen ? " dw-teal" : ""}`}>
      <div className="dw-glow" />
      <div className="dw-progress">
        <div className="dw-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="dw-top">
        <Logo height={17} opacity={0.9} />
        <span className="dw-saved">AUTO-SAVED ✓</span>
      </div>

      <div className="dw-main">
        <div className={`dw-box ${isCenteredBox ? "dw-center" : "dw-anchor"}`}>
          {current.kind === "intro" && <IntroScreen onStart={next} />}

          {current.kind === "sintro" && section && (
            <SectionIntroScreen sectionNumber={current.sectionIndex + 1} section={section} onContinue={next} />
          )}

          {current.kind === "question" && section && (
            <QuestionScreen
              key={current.question.id}
              question={current.question}
              secLabel={`${secNo} · ${section.name}`}
              answers={answers}
              rows={getRows(current.question)}
              onSetAnswer={setAnswer}
              onToggleMulti={toggleMulti}
              onChooseSingle={chooseSingle}
              onSetRepCell={setRepCell}
              onAddRepRow={() => addRepRow(current.question)}
              onRemoveRepRow={(rowIndex) => removeRepRow(current.question, rowIndex)}
              onNext={next}
            />
          )}

          {current.kind === "end" && (
            <EndScreen
              consent={consent}
              submitted={submitted}
              onToggleConsent={() => setConsent((c) => !c)}
              onSubmit={() => {
                if (consent) setSubmitted(true);
              }}
            />
          )}
        </div>
      </div>

      <div className="dw-bottom">
        <span className="dw-count">{bottomLabel}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button className="dw-arr" style={{ borderRadius: "8px 0 0 8px" }} onClick={prev} aria-label="Previous">
            ▲
          </button>
          <button className="dw-arr" style={{ borderRadius: "0 8px 8px 0" }} onClick={next} aria-label="Next">
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  const items = [
    "Bullet points are fine",
    "Not sure? Write TBC",
    "Not applicable? Write N/A",
    "Add links and files at the end",
    "Your answers auto-save — finish any time",
  ];
  return (
    <>
      <p className="dw-kick dw-kick-lone">Free operational discovery workshop</p>
      <h1 className="dw-h1 dw-h1-intro">Scope your project in about 15 minutes.</h1>
      <p className="dw-help">
        Short questions, one at a time — focus on what the system needs to help you achieve, not perfect technical wording.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "26px 0 32px" }}>
        {items.map((item) => (
          <div className="dw-introli" key={item}>
            <span className="dw-itick">✓</span>
            {item}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="dw-btn-teal" onClick={onStart}>
          Start →
        </button>
        <span className="dw-enter">press Enter ↵</span>
      </div>
    </>
  );
}

function SectionIntroScreen({
  sectionNumber,
  section,
  onContinue,
}: {
  sectionNumber: number;
  section: { name: string; description: string };
  onContinue: () => void;
}) {
  return (
    <>
      <p className="dw-kick dw-kick-sec dw-kick-lone">Section {sectionNumber} of 16</p>
      <h2 className="dw-h1 dw-h1-sintro">{section.name}</h2>
      <p className="dw-help">{section.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30 }}>
        <button className="dw-btn" onClick={onContinue}>
          Continue →
        </button>
        <span className="dw-enter">press Enter ↵</span>
      </div>
    </>
  );
}

function AutoGrowTextarea({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const grow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    grow();
  }, [value, grow]);

  return (
    <textarea
      ref={ref}
      className="dw-textarea"
      rows={1}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function QuestionScreen({
  question,
  secLabel,
  answers,
  rows,
  onSetAnswer,
  onToggleMulti,
  onChooseSingle,
  onSetRepCell,
  onAddRepRow,
  onRemoveRepRow,
  onNext,
}: {
  question: Question;
  secLabel: string;
  answers: Answers;
  rows: RepRow[];
  onSetAnswer: (id: string, value: string) => void;
  onToggleMulti: (id: string, option: string) => void;
  onChooseSingle: (id: string, option: string) => void;
  onSetRepCell: (qid: string, rowIndex: number, colKey: string, value: string) => void;
  onAddRepRow: () => void;
  onRemoveRepRow: (rowIndex: number) => void;
  onNext: () => void;
}) {
  const showOk = question.type !== "choice";
  const showSkip = !question.required;

  return (
    <>
      <div className="dw-qtop">
        <div className="dw-qhead">
          <p className="dw-kick dw-kick-sec">{secLabel}</p>
          <span className={`dw-reqtag ${question.required ? "dw-req1" : "dw-req0"}`}>
            {question.required ? "Required" : "Optional · TBC is fine"}
          </span>
        </div>
        <h2 className="dw-h1 dw-qtitle">{question.label}</h2>
        <p className="dw-help dw-qhelp">{question.help || ""}</p>
      </div>

      <div className="dw-qanswer">
        {question.type === "text" && (
          <input
            className="dw-input"
            placeholder={question.placeholder}
            value={(answers[question.id] as string) || ""}
            onChange={(e) => onSetAnswer(question.id, e.target.value)}
          />
        )}

        {question.type === "long" && (
          <AutoGrowTextarea
            value={(answers[question.id] as string) || ""}
            placeholder={question.placeholder}
            onChange={(v) => onSetAnswer(question.id, v)}
          />
        )}

        {question.type === "choice" && (
          <div className={question.options && question.options.length > 5 ? "dw-cgrid" : "dw-clist"}>
            {question.options?.map((option, i) => (
              <button
                key={option}
                type="button"
                className={`dw-copt${answers[question.id] === option ? " dw-on" : ""}`}
                onClick={() => onChooseSingle(question.id, option)}
              >
                <span className="dw-ck">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "multi" && (
          <div className="dw-pillrow">
            {question.options?.map((option) => {
              const cur = (answers[question.id] as string[] | undefined) || [];
              return (
                <button
                  key={option}
                  type="button"
                  className={`dw-pill${cur.includes(option) ? " dw-on" : ""}`}
                  onClick={() => onToggleMulti(question.id, option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "group" && (
          <div className="dw-gcol">
            {question.fields?.map((field) => {
              const key = `${question.id}.${field.key}`;
              return (
                <div key={field.key}>
                  <label className="dw-glab">{field.label}</label>
                  <input
                    className="dw-ginp"
                    placeholder={field.placeholder}
                    value={(answers[key] as string) || ""}
                    onChange={(e) => onSetAnswer(key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {question.type === "rep" && question.columns && (
          <RepTable
            question={question}
            rows={rows}
            onSetCell={onSetRepCell}
            onAddRow={onAddRepRow}
            onRemoveRow={onRemoveRepRow}
          />
        )}
      </div>

      <div className="dw-okrow">
        {showOk && (
          <>
            <button className="dw-btn" onClick={onNext}>
              OK ✓
            </button>
            <span className="dw-enter">press Enter ↵</span>
          </>
        )}
        {showSkip && (
          <button className="dw-skipbtn" onClick={onNext}>
            SKIP — TBC
          </button>
        )}
      </div>
    </>
  );
}

function RepTable({
  question,
  rows,
  onSetCell,
  onAddRow,
  onRemoveRow,
}: {
  question: Question;
  rows: RepRow[];
  onSetCell: (qid: string, rowIndex: number, colKey: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: number) => void;
}) {
  const columns = question.columns || [];
  const gridTemplate = useMemo(
    () => columns.map((c) => (c.chips ? "auto" : c.width || "1fr")).join(" ") + " 26px",
    [columns]
  );

  return (
    <div>
      <div className="dw-rephead" style={{ gridTemplateColumns: gridTemplate }}>
        {columns.map((c) => (
          <span className="dw-rh" key={c.key}>
            {c.header}
          </span>
        ))}
        <span />
      </div>
      {rows.map((row, rowIndex) => (
        <div className="dw-reprow" style={{ gridTemplateColumns: gridTemplate }} key={row.__key ?? rowIndex}>
          {columns.map((col) => {
            if (col.chips) {
              const value = row[col.key];
              return (
                <div className="dw-chips" key={col.key}>
                  {["Must", "Nice", "Future"].map((label) => (
                    <span
                      key={label}
                      className={`dw-pchip${value === label ? " dw-on" : ""}`}
                      onClick={() => onSetCell(question.id, rowIndex, col.key, label)}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              );
            }
            if (col.file) {
              const fileName = row[col.key];
              const inputId = `${question.id}-${rowIndex}-${col.key}`;
              return (
                <label className="dw-fbtn" key={col.key} htmlFor={inputId}>
                  {fileName ? fileName : "⬆ CHOOSE FILE"}
                  <input
                    id={inputId}
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => onSetCell(question.id, rowIndex, col.key, e.target.files?.[0]?.name || "")}
                  />
                </label>
              );
            }
            return (
              <input
                key={col.key}
                className="dw-rinp"
                placeholder={col.placeholder}
                value={row[col.key] || ""}
                onChange={(e) => onSetCell(question.id, rowIndex, col.key, e.target.value)}
              />
            );
          })}
          <button className="dw-xbtn" onClick={() => onRemoveRow(rowIndex)} aria-label="Remove row">
            ×
          </button>
        </div>
      ))}
      <button className="dw-addbtn" onClick={onAddRow}>
        + {question.addLabel || "Add row"}
      </button>
    </div>
  );
}

function EndScreen({
  consent,
  submitted,
  onToggleConsent,
  onSubmit,
}: {
  consent: boolean;
  submitted: boolean;
  onToggleConsent: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <p className="dw-kick dw-kick-lone">Final step</p>
      <h2 className="dw-h1 dw-h1-sintro">That&rsquo;s everything we need.</h2>
      <p className="dw-help">
        Use the ▲ arrow to review any answer. When you&rsquo;re ready, confirm below and we&rsquo;ll prepare your Phase 1 scope
        and workshop agenda.
      </p>
      <div className="dw-consent" onClick={onToggleConsent}>
        <span className={`dw-cbx${consent ? " dw-on" : ""}`}>✓</span>
        <span>
          <strong>Consent to prepare Phase 1 scope</strong> — I&rsquo;m happy for Simtec to prepare a Phase 1 scope and
          workshop agenda from these answers.
        </span>
      </div>
      {!submitted ? (
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button className={`dw-btn-teal${consent ? "" : " dw-dis"}`} onClick={onSubmit} disabled={!consent}>
            Submit &amp; book workshop →
          </button>
          <span className="dw-enter">We reply within one working day</span>
        </div>
      ) : (
        <div className="dw-sentmsg">✓ SENT — WE&rsquo;LL REPLY WITHIN ONE WORKING DAY.</div>
      )}
    </>
  );
}
