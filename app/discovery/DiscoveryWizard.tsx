"use client";

import { Fragment, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "../components/Logo";
import {
  type Answers,
  type Question,
  type RepColumn,
  type RepRow,
  type Step,
  SECTIONS,
  STEPS,
  isGeneratedRowKey,
  isQuestionComplete,
  isSectionAnswered,
  isSectionJumpVisible,
  isStepVisible,
  reconcileRepRows,
  sanitizeAnswers,
} from "./data";

const STORAGE_KEY = "simtec_discovery_wizard";
const ENTER_HINT = "press Enter ↵";

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

// `reconcileRepRows` (data.ts) is the single source of truth for which rows
// a rep question actually has — the same reconciliation the section-nav
// "done" check uses. This just adds the rendering-only concern: a
// key-stable placeholder pair when there's nothing to show yet, so React
// (and add/remove) has real row identities to work with.
function rowsFor(map: Record<string, RepRow[]>, question: Question, answers: Answers): RepRow[] {
  const saved = map[question.id];
  const reconciled = reconcileRepRows(question, answers, saved);
  if (saved !== undefined) return reconciled;
  // Grouped rep tables (e.g. dashboards/reports split by module) rely on
  // `groupHeadersFor` to seed their sections — the two generic blank rows
  // would land in an ungrouped "Other modules" catch-all instead, so skip
  // that fallback and let each section start empty with its own "+ Add".
  if (question.groupRowsBy) return reconciled;
  // Questions with `getDefaultRows` are seeded from another answer (e.g.
  // question 20's rows come from question 19's selections) — an empty
  // reconcile means "nothing selected yet", not "needs blank placeholders".
  // Padding here would get baked into saved state the moment the user types
  // into a cell or clicks "+ Add" (see setRepCell/addRepRow below), leaving
  // permanent blank rows the reconciler can never clean up.
  if (question.getDefaultRows) return reconciled;
  return reconciled.length > 0 ? reconciled : defaultRows();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// RepRow cells are string for most columns, string[] for multiSelect ones —
// these normalize a cell to the shape the caller expects instead of
// scattering `as string`/`as string[]` casts at each read site.
function cellText(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
function cellArray(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

// Closes a popover/flyout on any click outside `ref` — shared by the
// section-jump flyout and the rep-table multi-select cell, both of which
// need "click elsewhere to dismiss" without swallowing the closing click.
function useClickOutside(ref: RefObject<HTMLElement | null>, active: boolean, onOutside: () => void) {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [active, ref, onOutside]);
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

  const getRows = useCallback(
    (question: Question): RepRow[] => rowsFor(repRows, question, answers),
    [repRows, answers]
  );

  // A rep question's seeded rows (e.g. `userRoles` pre-filled from
  // `dayOneUsers`) only get written into `repRows` once the user edits that
  // table directly — `rowsFor` reconciles them for that table's own render
  // in the meantime, but raw `repRows` can lag behind. Anything that reads
  // *another* question's rows (e.g. `dashboardsReports.audience`'s
  // `dynamicOptions`, via `userRoleOptions`) needs the reconciled view too,
  // or it misses seeded rows that were never directly touched.
  const reconciledRepRows = useMemo(() => {
    const map: Record<string, RepRow[]> = { ...repRows };
    SECTIONS.forEach((sec) =>
      sec.questions.forEach((q) => {
        if (q.type === "rep" && q.getDefaultRows) {
          map[q.id] = reconcileRepRows(q, answers, repRows[q.id]);
        }
      })
    );
    return map;
  }, [repRows, answers]);

  const currentIndex = clamp(idx, 0, visibleSteps.length - 1);
  const current = visibleSteps[currentIndex];
  const currentRows = current?.kind === "question" ? getRows(current.question) : [];
  // Required-but-unanswered blocks moving forward off this step — "required"
  // otherwise only changes a label and does nothing. Uses the same
  // reconciled rows `getRows` hands the rendered table, so this agrees with
  // what the user actually sees (raw `repRows` can be stale — e.g. right
  // after deselecting a module, before any cell in the table is next
  // edited) — and with the section-nav "done" check, which reconciles the
  // same way via `reconcileRepRows`.
  const blockedForward = !!(
    current?.kind === "question" &&
    current.question.required &&
    !isQuestionComplete(current.question, answers, currentRows)
  );

  const nav = useCallback(
    (delta: number) => {
      // Cancel any pending choice auto-advance so a manual nav (arrow keys,
      // nav buttons) right after selecting an option doesn't double-advance.
      clearTimeout(advanceTimer.current);
      // Moving forward off the required-but-unanswered current question is
      // blocked. Moving backward is always allowed.
      if (!(delta > 0 && blockedForward)) {
        setIdx((prev) => clamp(prev + delta, 0, visibleSteps.length - 1));
      }
      setNavOpen(false);
    },
    [visibleSteps.length, blockedForward]
  );
  const next = useCallback(() => nav(1), [nav]);
  const prev = useCallback(() => nav(-1), [nav]);

  const jumpToSection = useCallback(
    (sectionIndex: number) => {
      const requestedTarget = visibleSteps.findIndex(
        (step) => step.kind === "sintro" && step.sectionIndex === sectionIndex
      );
      if (requestedTarget < 0) return;
      // Same required-question gate as `nav`: the section-nav flyout/segments
      // are always clickable, so without this a blocked question could just
      // be jumped past instead of answered.
      if (requestedTarget > currentIndex && blockedForward) return;
      // Jumping ahead must not skip over an earlier section whose required
      // questions aren't answered yet — otherwise a later question that
      // depends on an earlier answer (e.g. a dropdown fed by modules chosen
      // in "Scope & modules") can be reached in a broken, unusable state.
      // Redirect to that earlier section instead of the requested target.
      const firstIncompleteSection = SECTIONS.findIndex((sec) => !isSectionAnswered(sec, answers, repRows));
      const resolvedSectionIndex =
        firstIncompleteSection !== -1 && firstIncompleteSection < sectionIndex ? firstIncompleteSection : sectionIndex;
      const target =
        resolvedSectionIndex === sectionIndex
          ? requestedTarget
          : visibleSteps.findIndex((step) => step.kind === "sintro" && step.sectionIndex === resolvedSectionIndex);
      if (target < 0) return;
      clearTimeout(advanceTimer.current);
      setIdx(target);
      setNavOpen(false);
    },
    [visibleSteps, currentIndex, blockedForward, answers, repRows]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (e.key === "Escape" && navOpen) {
        e.preventDefault();
        setNavOpen(false);
      } else if (e.key === "Enter" && tag !== "BUTTON" && !(tag === "TEXTAREA" && (e.metaKey || e.ctrlKey || e.shiftKey))) {
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
  useClickOutside(navRef, navOpen, () => setNavOpen(false));

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

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

  const setRepCell = useCallback(
    (question: Question, rowIndex: number, colKey: string, value: string | string[]) => {
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
      const rows = rowsFor(repRows, question, answers);
      if (rows.length <= 1) return;
      const target = rows[rowIndex];
      // A generated row (e.g. seeded from an earlier answer) would just come
      // back on the next reconcile as long as its source is still selected —
      // turn that source off too, via the question's own `removeSource`.
      if (isGeneratedRowKey(target.__key as string | undefined) && question.removeSource) {
        setAnswers((prev) => question.removeSource!(target, prev));
      }
      setRepRows((prev) => ({
        ...prev,
        [question.id]: rowsFor(prev, question, answers).filter((_, i) => i !== rowIndex),
      }));
    },
    [answers, repRows]
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
  // Only grouped rep tables (e.g. proposedModules) get the wider box — that's
  // the only shape `.dw-modgroups-rep` (below) actually widens further; an
  // ungrouped rep table would just stretch its plain 1fr columns unevenly.
  const isGroupedRepQuestion = current.kind === "question" && current.question.type === "rep" && !!current.question.groupRowsBy;

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
        <div className={`dw-box ${isCenteredBox ? "dw-center" : "dw-anchor"}${isGroupedRepQuestion ? " dw-box-rep" : ""}`}>
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
              rows={currentRows}
              repRows={reconciledRepRows}
              blocked={blockedForward}
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
          <button
            className="dw-arr"
            style={{ borderRadius: "0 8px 8px 0" }}
            onClick={next}
            disabled={blockedForward}
            aria-label="Next"
          >
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
        <span className="dw-enter">{ENTER_HINT}</span>
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
        <span className="dw-enter">{ENTER_HINT}</span>
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
  repRows,
  blocked,
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
  repRows: Record<string, RepRow[]>;
  blocked: boolean;
  onSetAnswer: (id: string, value: string) => void;
  onToggleMulti: (id: string, option: string) => void;
  onChooseSingle: (id: string, option: string) => void;
  onSetRepCell: (question: Question, rowIndex: number, colKey: string, value: string | string[]) => void;
  onAddRepRow: (extra?: Record<string, string>) => void;
  onRemoveRepRow: (rowIndex: number) => void;
  onNext: () => void;
}) {
  const showOk = question.type !== "choice";
  const showSkip = !question.required;
  const enterHint = blocked
    ? "Answer to continue"
    : question.type === "long"
      ? "Enter to continue · ⌘+Enter for new line"
      : ENTER_HINT;

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
          const visibleGroups = (question.groups || []).filter(
            (group) =>
              !question.filterBy ||
              ((answers[question.filterBy] as string[] | undefined) || []).includes(group.header)
          );
          return (
            <div className="dw-modgroups">
              {visibleGroups.map((group) => (
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
            repRows={repRows}
            onSetCell={onSetRepCell}
            onAddRow={onAddRepRow}
            onRemoveRow={onRemoveRepRow}
          />
        )}
      </div>

      <div className="dw-okrow">
        {showOk && (
          <>
            <button className="dw-btn" onClick={onNext} disabled={blocked}>
              OK ✓
            </button>
            <span className="dw-enter">{enterHint}</span>
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
  repRows,
  onSetCell,
  onAddRow,
  onRemoveRow,
}: {
  question: Question;
  rows: RepRow[];
  answers: Answers;
  repRows: Record<string, RepRow[]>;
  onSetCell: (question: Question, rowIndex: number, colKey: string, value: string | string[]) => void;
  onAddRow: (extra?: Record<string, string>) => void;
  onRemoveRow: (rowIndex: number) => void;
}) {
  const columns = question.columns || [];
  const gridTemplate = useMemo(
    () => columns.map((c) => (c.chips ? "auto" : c.width || "1fr")).join(" ") + " 26px",
    [columns]
  );
  // A column's options can depend on the row itself (e.g. scoping the
  // modules dropdown to just the row's own group), so this is resolved per
  // row rather than once per column — cheap enough here since these are
  // small in-memory filters, not I/O.
  const getOptions = useCallback(
    (col: RepColumn, row: RepRow): string[] => (col.dynamicOptions ? col.dynamicOptions(answers, repRows, row) : col.options || []),
    [answers, repRows]
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
        if (col.options || col.dynamicOptions) {
          const opts = getOptions(col, row);
          if (col.multiSelect) {
            const selected = cellArray(row[col.key]);
            return (
              <MultiSelectCell
                key={col.key}
                options={opts}
                selected={selected}
                placeholder={col.placeholder}
                onChange={(next) => onSetCell(question, rowIndex, col.key, next)}
              />
            );
          }
          return (
            <select
              key={col.key}
              className="dw-rinp"
              value={cellText(row[col.key])}
              onChange={(e) => onSetCell(question, rowIndex, col.key, e.target.value)}
            >
              <option value="" disabled hidden>
                {col.placeholder || "Select…"}
              </option>
              {opts.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            key={col.key}
            className="dw-rinp"
            placeholder={col.placeholder}
            value={cellText(row[col.key])}
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
          <Fragment key={cellText(rows[rowIndex].__key) || rowIndex}>{renderRowCells(rows[rowIndex], rowIndex)}</Fragment>
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
    const header = cellText(row[groupBy]) || "Other modules";
    if (!groups.has(header)) groups.set(header, []);
    groups.get(header)!.push(rowIndex);
  });

  return (
    <div className="dw-modgroups dw-modgroups-rep">
      {[...groups.entries()].map(([header, indices]) => (
        <div className="dw-modgroup" key={header}>
          <h3 className="dw-modgroup-title">{header}</h3>
          {renderTable(indices, { [groupBy]: header })}
        </div>
      ))}
    </div>
  );
}

// Multi-select for a single rep-table cell: a compact trigger (styled like
// the other cell inputs) that opens a checkable-options popover, matching
// the "click outside to close" pattern the section-jump flyout already uses.
function MultiSelectCell({
  options,
  selected,
  placeholder,
  onChange,
}: {
  options: string[];
  selected: string[];
  placeholder?: string;
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useClickOutside(wrapRef, open, () => setOpen(false));

  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
  };

  return (
    <div className="dw-mswrap" ref={wrapRef}>
      <button type="button" className="dw-rinp dw-msbtn" onClick={() => setOpen((o) => !o)}>
        <span className={`dw-mssummary${selected.length === 0 ? " dw-msempty" : ""}`}>
          {selected.length > 0 ? selected.join(", ") : placeholder || "Select…"}
        </span>
        <span className="dw-mscaret">▾</span>
      </button>
      {open && (
        <div className="dw-mspanel" role="listbox">
          {options.map((option) => (
            <div
              key={option}
              className={`dw-msopt${selected.includes(option) ? " dw-on" : ""}`}
              role="option"
              aria-selected={selected.includes(option)}
              onClick={() => toggle(option)}
            >
              <span className="dw-mscheck">{selected.includes(option) ? "✓" : ""}</span>
              {option}
            </div>
          ))}
        </div>
      )}
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
