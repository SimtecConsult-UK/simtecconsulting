"use client";

import { useState } from "react";
import { uploadImage } from "./upload";
import type { Bucket } from "../lib/supabase/storage";

/**
 * Choosing a picture, measuring it and uploading it — the cycle every editor in
 * the CMS repeats.
 *
 * It was written out three times before this: the newsletter's cover, a page's
 * share picture and the site-wide one, each with its own `uploading` flag and
 * its own try/catch around the same two calls. `noun` is the only part that
 * genuinely differed, and it only changes the sentence shown when it fails.
 */
export function useImageUpload({
  bucket,
  folder,
  noun,
  onUploaded,
  onError,
}: {
  bucket: Bucket;
  folder: string;
  /** How the picture is named mid-sentence: "That cover did not upload: …". */
  noun: string;
  onUploaded: (image: { path: string; width: number; height: number; url: string | null }) => void;
  /** The editor's own `setError`; called with null to clear it first. */
  onError: (message: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const pick = async (file: File) => {
    setUploading(true);
    onError(null);
    try {
      const result = await uploadImage(bucket, folder, file);
      if (!result.ok) {
        onError(`That ${noun} did not upload: ${result.error}`);
        return;
      }
      onUploaded(result);
    } catch (problem) {
      onError(
        problem instanceof Error ? problem.message : `That ${noun} could not be read.`
      );
    } finally {
      setUploading(false);
    }
  };

  return { uploading, pick };
}
