// Carries the modules a visitor ticks on the homepage module picker into the
// discovery questionnaire. The journey is homepage → Calendly (new tab) →
// Calendly redirects to /discovery, so it's the same browser on the same
// site and localStorage is enough. Different browser/device = no carry-over
// (an accepted limitation).
//
// Stored as permanent catalog `id`s (see moduleCatalog.ts), never display
// names, so a module being renamed later can't break an old saved pick.

import { MODULE_CATALOG } from "./moduleCatalog";

const PICKS_KEY = "simtec_module_picks";
// Picks older than this are treated as forgotten — someone returning weeks
// later shouldn't find a half-remembered homepage visit pre-ticked.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type SavedPicks = {
  moduleIds: string[];
  businessType?: string;
  savedAt: number;
};

export function saveModulePicks(moduleIds: string[], businessType?: string) {
  try {
    const value: SavedPicks = { moduleIds, businessType, savedAt: Date.now() };
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

/**
 * The saved picks as the questionnaire's own answers: the system headers
 * (`primarySystemType`) whose category holds a picked module, and the picked
 * module names (`selectedModules`), both in catalog order. `null` when there
 * are no usable picks (none saved, too old, malformed, or no id still in the
 * catalog).
 */
export function loadModulePicks(): { headers: string[]; moduleNames: string[] } | null {
  let saved: Partial<SavedPicks>;
  try {
    const raw = localStorage.getItem(PICKS_KEY);
    if (!raw) return null;
    saved = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!saved || !Array.isArray(saved.moduleIds) || typeof saved.savedAt !== "number") return null;
  if (Date.now() - saved.savedAt > MAX_AGE_MS) return null;

  const ids = new Set(saved.moduleIds);
  const headers: string[] = [];
  const moduleNames: string[] = [];
  MODULE_CATALOG.forEach((category) => {
    const picked = category.modules.filter((m) => ids.has(m.id));
    if (picked.length === 0) return;
    headers.push(category.header);
    picked.forEach((m) => moduleNames.push(m.name));
  });
  return moduleNames.length > 0 ? { headers, moduleNames } : null;
}
