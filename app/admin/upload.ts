"use client";

import { createClient } from "../lib/supabase/browser";
import type { Bucket } from "../lib/supabase/storage";

/**
 * Uploads go straight from the browser to Supabase Storage rather than through
 * a Server Action. A screen recording is far larger than the request body a
 * Server Action is meant to carry, and this way the file never touches our
 * server. Storage's own rules still require a signed-in editor.
 */

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

/** A collision-proof name that keeps the original extension for content type. */
function storagePath(folder: string, file: File): string {
  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
    : "bin";
  return `${folder}/${crypto.randomUUID()}.${extension}`;
}

export async function uploadFile(
  bucket: Bucket,
  folder: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient();
  const path = storagePath(folder, file);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}

/** Reads an image's real dimensions, which next/image needs to reserve space. */
export function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    image.src = url;
  });
}

/** Reads a video's dimensions and duration, for the upload checks. */
export function videoInfo(
  file: File
): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as a video."));
    };
    video.src = url;
  });
}
