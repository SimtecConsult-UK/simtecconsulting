// Carries the modules a visitor ticks on the homepage module picker into the
// discovery questionnaire. The journey is homepage → Calendly (new tab) →
// Calendly redirects to /discovery, so it's the same browser on the same
// site and localStorage is enough. Different browser/device = no carry-over
// (an accepted limitation).
//
// Stored as permanent catalog `id`s (see moduleCatalog.ts), never display
// names, so a module being renamed later can't break an old saved pick.
// Turning ids into questionnaire answers is the questionnaire's job
// (`answersFromModuleIds` in app/discovery/data.ts).

const PICKS_KEY = "simtec_module_picks";
// Picks older than this are treated as forgotten — someone returning weeks
// later shouldn't find a half-remembered homepage visit pre-ticked.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type SavedPicks = {
  moduleIds: string[];
  savedAt: number;
};

export function saveModulePicks(moduleIds: string[]) {
  try {
    const value: SavedPicks = { moduleIds, savedAt: Date.now() };
    localStorage.setItem(PICKS_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable — the questionnaire just starts blank
  }
}

export function clearModulePicks() {
  try {
    localStorage.removeItem(PICKS_KEY);
  } catch {
    // nothing to clear
  }
}

/** The saved module ids, or `null` if none were saved, they're too old, or the entry is malformed. */
export function loadModulePickIds(): string[] | null {
  try {
    const raw = localStorage.getItem(PICKS_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<SavedPicks> | null;
    if (!saved || !Array.isArray(saved.moduleIds) || typeof saved.savedAt !== "number") return null;
    if (Date.now() - saved.savedAt > MAX_AGE_MS) return null;
    return saved.moduleIds;
  } catch {
    return null;
  }
}
