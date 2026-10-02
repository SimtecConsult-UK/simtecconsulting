"use client";

import { useState, useTransition } from "react";

/**
 * The shared state behind both editors: the draft being typed, whether it has
 * been saved, and the two-click delete.
 *
 * Saved-ness is one value rather than a `dirty` and a `saved` flag. Those two
 * were always kept opposite, so the fourth combination was unreachable and
 * every write site had to remember to set both.
 */
export type EditorStatus = "fresh" | "dirty" | "saved";

/** The word under the title, given what the editor should read before any edit. */
export function statusLabel(status: EditorStatus, resting: string): string {
  if (status === "dirty") return "Unsaved changes";
  if (status === "saved") return "All changes saved";
  return resting;
}

export function useEditorDraft<T extends object>(initial: T | (() => T)) {
  const [draft, setDraft] = useState<T>(initial);
  const [status, setStatus] = useState<EditorStatus>("fresh");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  /** Write several fields at once — an upload sets a path and its size together. */
  const patch = (fields: Partial<T>) => {
    setDraft((current) => ({ ...current, ...fields }));
    setStatus("dirty");
  };

  const set = <K extends keyof T>(key: K, value: T[K]) =>
    patch({ [key]: value } as unknown as Partial<T>);

  /**
   * Runs a save action. `after` folds anything the save settled — a status, a
   * new id — back into the draft without marking it unsaved again.
   */
  const save = (
    run: () => Promise<{ error: string | null }>,
    after?: () => void
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await run();
      if (result.error) {
        setError(result.error);
        return;
      }
      after?.();
      setStatus("saved");
    });
  };

  /**
   * First click arms the button, second click runs it.
   *
   * `after` is for the destructive buttons that leave you on the page — Reset,
   * which clears a page's settings rather than deleting a row — so they can
   * fold the emptied state back into the draft. Delete does not use it: the
   * action redirects away.
   */
  const remove = (
    run: () => Promise<{ error: string | null } | void>,
    after?: () => void
  ) => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await run();
      if (result?.error) {
        setError(result.error);
        return;
      }
      setConfirmDelete(false);
      after?.();
      setStatus("saved");
    });
  };

  return {
    draft,
    setDraft,
    set,
    patch,
    status,
    error,
    setError,
    pending,
    confirmDelete,
    save,
    remove,
  };
}
