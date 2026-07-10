"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "../components/Logo";
import {
  type Answers,
  type Question,
  type RepRow,
  type Step,
  SECTIONS,
  STEPS,
  isSectionAnswered,
  isSectionJumpVisible,
  isStepVisible,
  sanitizeAnswers,
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

// Catalog-generated rows carry a "header::module" key (see
// `defaultProposedModuleRows`); manually-added rows always get a plain "rN"
// key from `makeRepRow`. That distinction is how reconciliation below tells
// "auto-populated, keep in sync with answers" apart from "the user added
// this by hand, leave it alone".
function isGeneratedRowKey(key: string | undefined): boolean {
  return typeof key === "string" && key.includes("::");
}

function rowsFor(map: Record<string, RepRow[]>, question: Question, answers: Answers): RepRow[] {
  const saved = map[question.id];
  const generated = question.getDefaultRows?.(answers);
  if (!generated) return saved || defaultRows();
  if (!saved) return generated.length > 0 ? generated : defaultRows();

  // Reconcile instead of freezing: drop generated rows whose module/system
  // was since deselected, add rows for newly selected ones, and keep every
  // other saved row (including any edits, and any row the user added by
  // hand) untouched — so going back and changing an earlier answer keeps
  // this table in sync instead of getting stuck at the first edit.
  const generatedKeys = new Set(generated.map((r) => r.__key));
  const kept = saved.filter((r) => !isGeneratedRowKey(r.__key) || generatedKeys.has(r.__key));
  const keptKeys = new Set(kept.map((r) => r.__key));
  const added = generated.filter((r) => !keptKeys.has(r.__key));
  return [...kept, ...added];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const isQuestionStep = (s: Step): s is Extract<Step, { kind: "question" }> => s.kind === "question";

const MINUTES_PER_QUESTION = 0.6;
// A section's segment shows a sliver of fill as soon as it's entered (its
// sintro screen), before any of its questions have been answered.
const MIN_SECTION_FILL_PCT = 8;

function padSectionNumber(sectionIndex: number) {
  return String(sectionIndex + 1).padStart(2, "0");
}

export function DiscoveryWizard() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [repRows, setRepRows] = useState<Record<string, RepRow[]>>({});
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingSave = useRef<PersistedState | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

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
        setAnswers(sanitizeAnswers(saved.answers || {}));
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
      setNavOpen(false);
    },
    [visibleSteps.length]
  );
  const next = useCallback(() => nav(1), [nav]);
  const prev = useCallback(() => nav(-1), [nav]);

  const jumpToSection = useCallback(
    (sectionIndex: number) => {
      const target = visibleSteps.findIndex(
        (step) => step.kind === "sintro" && step.sectionIndex === sectionIndex
      );
      if (target < 0) return;
      clearTimeout(advanceTimer.current);
      setIdx(target);
      setNavOpen(false);
    },
    [visibleSteps]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (e.key === "Escape" && navOpen) {
        e.preventDefault();
        setNavOpen(false);
      } else if (e.key === "Enter" && tag !== "TEXTAREA" && tag !== "BUTTON") {
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
  }, [nav, navOpen]);

  // Close the jump flyout on any click outside it, so it doesn't sit on top
  // of the page intercepting clicks meant for the content underneath.
  useEffect(() => {
    if (!navOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [navOpen]);

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
    (question: Question): RepRow[] => rowsFor(repRows, question, answers),
    [repRows, answers]
  );

  const setRepCell = useCallback(
    (question: Question, rowIndex: number, colKey: string, value: string) => {
      setRepRows((prev) => {
        const rows = [...rowsFor(prev, question, answers)];
        rows[rowIndex] = { ...rows[rowIndex], [colKey]: value };
        return { ...prev, [question.id]: rows };
      });
    },
    [answers]
  );

  const addRepRow = useCallback(
    (question: Question, extra?: Record<string, string>) => {
      setRepRows((prev) => ({
        ...prev,
        [question.id]: [...rowsFor(prev, question, answers), { ...makeRepRow(), ...extra }],
      }));
    },
    [answers]
  );

  const removeRepRow = useCallback(
    (question: Question, rowIndex: number) => {
      setRepRows((prev) => {
        const rows = rowsFor(prev, question, answers);
        if (rows.length <= 1) return prev;
        return { ...prev, [question.id]: rows.filter((_, i) => i !== rowIndex) };
      });
    },
    [answers]
  );

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
  const secNo = sectionIndex != null ? padSectionNumber(sectionIndex) : "";

  const isTealScreen = current.kind === "intro" || current.kind === "sintro";
  const isCenteredBox = current.kind === "intro" || current.kind === "sintro" || current.kind === "end";

  // Extends `sectionIndex` with the "end" screen (past the last section) so
  // the nav below has one number line covering intro (-1) through end (16).
  const currentSectionIndex = current.kind === "end" ? SECTIONS.length : sectionIndex ?? -1;

  const sectionNav = SECTIONS.map((sec, si) => {
    const passed = si < currentSectionIndex;
    const isCurrent = si === currentSectionIndex;
    let fillPct = passed ? 100 : 0;
    if (isCurrent) {
      const sectionQuestionSteps = visibleSteps.filter(
        (step) => step.kind === "question" && step.sectionIndex === si
      );
      const pos = current.kind === "question" ? sectionQuestionSteps.indexOf(current) : -1;
      fillPct = pos < 0 ? MIN_SECTION_FILL_PCT : Math.round(((pos + 1) / sectionQuestionSteps.length) * 100);
    }
    // "Done" reflects whether the section's required questions actually have
    // answers — not just whether the user has scrolled past it — so jumping
    // ahead doesn't falsely mark unvisited sections complete, and jumping
    // back to review doesn't erase a section's completion.
    const done = isSectionAnswered(sec, answers, repRows);
    const visibleQuestionCount = sec.questions.filter((q) => !q.showIf || q.showIf(answers)).length;
    return {
      section: sec,
      si,
      done,
      isCurrent,
      fillPct,
      stateClass: done ? " dw-done" : isCurrent ? " dw-on" : "",
      minutes: Math.max(1, Math.round(visibleQuestionCount * MINUTES_PER_QUESTION)),
    };
  });

  const completedSectionCount = sectionNav.filter((item) => item.done).length;

  const jumpLbl =
    currentSectionIndex >= 0 && currentSectionIndex < SECTIONS.length
      ? `${padSectionNumber(currentSectionIndex)} · ${SECTIONS[currentSectionIndex].shortName}`
      : `All ${SECTIONS.length} sections`;

  const flyHead = `All sections · ${completedSectionCount} of ${SECTIONS.length} complete`;

  const bottomLabel =
    current.kind === "intro"
      ? "≈ 15 MINUTES"
      : current.kind === "end"
      ? "REVIEW & SUBMIT"
      : current.kind === "sintro"
      ? `SECTION ${current.sectionIndex + 1} OF ${SECTIONS.length}`
      : `QUESTION ${qNum} OF ${qTotal}`;

  return (
    <div className={`dw-wiz${isTealScreen ? " dw-teal" : ""}`}>
      <div className="dw-glow" />

      <div className="dw-top">
        <Logo height={17} opacity={0.9} />
        <span className="dw-saved">AUTO-SAVED ✓</span>
      </div>

      <div className="dw-segwrap">
        {sectionNav.map((item) => (
          <span
            key={item.section.name}
            className={`dw-seg${item.isCurrent ? " dw-on" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Jump to section ${item.si + 1}: ${item.section.shortName}`}
            aria-current={item.isCurrent ? "step" : undefined}
            onClick={() => jumpToSection(item.si)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                jumpToSection(item.si);
              }
            }}
          >
            <span className="dw-segf" style={{ width: `${item.fillPct}%` }} />
          </span>
        ))}
      </div>

      {isSectionJumpVisible(current) && (
        <div className="dw-navrow" ref={navRef}>
          <button
            className="dw-jumpbtn"
            aria-haspopup="true"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            {jumpLbl} <span className="dw-jumpcaret">▾</span>
          </button>
          {navOpen && (
            <div className="dw-flyout" role="menu">
              <div className="dw-fhead">{flyHead}</div>
              <div className="dw-fgrid" style={{ gridTemplateRows: `repeat(${Math.ceil(SECTIONS.length / 2)}, auto)` }}>
                {sectionNav.map((item) => (
                  <div
                    key={item.section.name}
                    className={`dw-fitem${item.stateClass}`}
                    role="menuitem"
                    tabIndex={0}
                    aria-current={item.isCurrent ? "step" : undefined}
                    onClick={() => jumpToSection(item.si)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        jumpToSection(item.si);
                      }
                    }}
                  >
                    <span className="dw-fnum">{item.done ? "✓" : padSectionNumber(item.si)}</span>
                    {item.section.shortName}
                    <span className="dw-fmeta">
                      {item.done ? "✓ DONE" : item.isCurrent ? "NOW" : `~${item.minutes} MIN`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
              onAddRepRow={(extra) => addRepRow(current.question, extra)}
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
      <p className="dw-kick dw-kick-sec dw-kick-lone">
        Section {sectionNumber} of {SECTIONS.length}
      </p>
      <h2 className="dw-h1 dw-h1-sintro">{section.name}</h2>
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

function PillRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="dw-pillrow">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`dw-pill${selected.includes(option) ? " dw-on" : ""}`}
          onClick={() => onToggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
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
  onSetRepCell: (question: Question, rowIndex: number, colKey: string, value: string) => void;
  onAddRepRow: (extra?: Record<string, string>) => void;
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
          <PillRow
            options={question.options || []}
            selected={(answers[question.id] as string[] | undefined) || []}
            onToggle={(option) => onToggleMulti(question.id, option)}
          />
        )}

        {question.type === "groupedMulti" && (() => {
          const selected = (answers[question.id] as string[] | undefined) || [];
          return (
            <div className="dw-modgroups">
              {(question.groups || [])
                .filter(
                  (group) =>
                    !question.filterBy ||
                    ((answers[question.filterBy] as string[] | undefined) || []).includes(group.header)
                )
                .map((group) => (
                  <div className="dw-modgroup" key={group.header}>
                    <h3 className="dw-modgroup-title">{group.header}</h3>
                    <PillRow
                      options={group.options}
                      selected={selected}
                      onToggle={(option) => onToggleMulti(question.id, option)}
                    />
                  </div>
                ))}
            </div>
          );
        })()}

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
            answers={answers}
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
  answers,
  onSetCell,
  onAddRow,
  onRemoveRow,
}: {
  question: Question;
  rows: RepRow[];
  answers: Answers;
  onSetCell: (question: Question, rowIndex: number, colKey: string, value: string) => void;
  onAddRow: (extra?: Record<string, string>) => void;
  onRemoveRow: (rowIndex: number) => void;
}) {
  const columns = question.columns || [];
  const gridTemplate = useMemo(
    () => columns.map((c) => (c.chips ? "auto" : c.width || "1fr")).join(" ") + " 26px",
    [columns]
  );

  // Header cells and row cells are flattened into ONE grid per table (rather
  // than a separate grid per row) so "auto"-sized columns — the priority
  // chips — settle on a single shared width instead of sizing independently
  // per row and drifting out of alignment with the header.
  const renderHeaderCells = () => (
    <>
      {columns.map((c) => (
        <span className="dw-rh" key={c.key}>
          {c.header}
        </span>
      ))}
      <span />
    </>
  );

  const renderRowCells = (row: RepRow, rowIndex: number) => (
    <>
      {columns.map((col) => {
        if (col.chips) {
          const value = row[col.key];
          return (
            <div className="dw-chips" key={col.key}>
              {["Must", "Nice", "Future"].map((label) => (
                <span
                  key={label}
                  className={`dw-pchip${value === label ? " dw-on" : ""}`}
                  onClick={() => onSetCell(question, rowIndex, col.key, label)}
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
                onChange={(e) => onSetCell(question, rowIndex, col.key, e.target.files?.[0]?.name || "")}
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
            onChange={(e) => onSetCell(question, rowIndex, col.key, e.target.value)}
          />
        );
      })}
      <button className="dw-xbtn" onClick={() => onRemoveRow(rowIndex)} aria-label="Remove row">
        ×
      </button>
    </>
  );

  const renderTable = (indices: number[], extra?: Record<string, string>) => (
    <>
      <div className="dw-reptable" style={{ gridTemplateColumns: gridTemplate }}>
        {renderHeaderCells()}
        {indices.map((rowIndex) => (
          <Fragment key={rows[rowIndex].__key ?? rowIndex}>{renderRowCells(rows[rowIndex], rowIndex)}</Fragment>
        ))}
      </div>
      <button className="dw-addbtn" onClick={() => onAddRow(extra)}>
        + {question.addLabel || "Add row"}
      </button>
    </>
  );

  const groupBy = question.groupRowsBy;
  if (!groupBy) {
    return <div>{renderTable(rows.map((_, rowIndex) => rowIndex))}</div>;
  }

  // Seed every expected group first (e.g. every system the user picked),
  // even before it has any rows — otherwise a group with nothing in it yet
  // would simply never appear, with no way to add its first row.
  const groups = new Map<string, number[]>();
  (question.groupHeadersFor?.(answers) || []).forEach((header) => groups.set(header, []));
  rows.forEach((row, rowIndex) => {
    const header = row[groupBy] || "Other modules";
    if (!groups.has(header)) groups.set(header, []);
    groups.get(header)!.push(rowIndex);
  });

  return (
    <div className="dw-modgroups">
      {[...groups.entries()].map(([header, indices]) => (
        <div className="dw-modgroup" key={header}>
          <h3 className="dw-modgroup-title">{header}</h3>
          {renderTable(indices, { [groupBy]: header })}
        </div>
      ))}
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
