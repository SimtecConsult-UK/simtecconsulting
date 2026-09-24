"use client";

import { useState, useTransition } from "react";
import { DeleteFooter } from "../../EditorUI";
import { deleteSubmission } from "./actions";

/**
 * The only interactive part of a submission page.
 *
 * Kept as its own island so the page itself can stay a Server Component: the
 * answers are rendered through the wizard's question catalogue, and marking
 * this whole view `"use client"` shipped that catalogue — about 54 KB of
 * question text — to the editor's browser for nothing to interact with.
 */
export function DeleteSubmission({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      {error && (
        <div className="cms-banner cms-banner--error" role="alert">
          {error}
        </div>
      )}
      <DeleteFooter
        help="Deleting removes this submission for good. It is the only copy."
        label="Delete submission"
        confirming={confirming}
        disabled={pending}
        onDelete={() => {
          if (!confirming) {
            setConfirming(true);
            return;
          }
          startTransition(async () => {
            const result = await deleteSubmission(id);
            if (result?.error) setError(result.error);
          });
        }}
      />
    </>
  );
}
