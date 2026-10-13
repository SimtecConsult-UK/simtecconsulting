"use client";

import { useState } from "react";
import { uploadFile, videoInfo } from "./upload";
import type { Bucket } from "../lib/supabase/storage";
import { checkVideo, describeFailures, type Check } from "./video-checks";

/**
 * Choosing a screen recording, checking it and uploading it — the picture
 * cycle's counterpart, and the same bargain `useImageUpload` makes.
 *
 * The difference is the checks. A recording that is the wrong shape or too
 * heavy is refused *before* it is uploaded, so nothing that would look wrong on
 * the homepage ever reaches storage, and `checks` is kept so the editor can
 * show which requirements passed and which did not.
 */
export function useVideoUpload({
  bucket,
  folder,
  onUploaded,
  onError,
}: {
  bucket: Bucket;
  folder: string;
  /** The stored path. Both editors derive the preview URL from it themselves. */
  onUploaded: (path: string) => void;
  /** The editor's own `setError`; called with null to clear it first. */
  onError: (message: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);

  const pick = async (file: File) => {
    setUploading(true);
    onError(null);
    try {
      const info = await videoInfo(file);
      const measured = checkVideo(file, info);
      setChecks(measured);

      const failure = describeFailures(measured);
      if (failure) {
        onError(failure);
        return;
      }

      const result = await uploadFile(bucket, folder, file);
      if (!result.ok) {
        onError(`That recording did not upload: ${result.error}`);
        return;
      }
      onUploaded(result.path);
    } catch (problem) {
      onError(
        problem instanceof Error ? problem.message : "That recording could not be read."
      );
    } finally {
      setUploading(false);
    }
  };

  /** Called when the recording is removed, so stale ticks do not linger. */
  const clearChecks = () => setChecks([]);

  return { uploading, checks, pick, clearChecks };
}
