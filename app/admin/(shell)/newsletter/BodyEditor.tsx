"use client";

import { useEffect, useRef, useState } from "react";
import { blocksToHtml, htmlToBlocks } from "../../../lib/blog/html";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { uploadFile } from "../../upload";
import type { BlogBlock } from "../../../lib/blog/types";

type BodyEditorProps = {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
  /** Rendered at the right of the toolbar. */
  count: React.ReactNode;
  over: boolean;
};

/**
 * The article body.
 *
 * A `contentEditable` surface with the handover's toolbar. What the browser
 * puts in the DOM is never stored: on every change `htmlToBlocks` rebuilds the
 * small set of shapes the article page can render, so a pasted table, a colour
 * or a stray `<script>` simply does not survive.
 *
 * The DOM is set once on mount and thereafter owned by the browser — rewriting
 * `innerHTML` on each keystroke would put the caret back at the start.
 */
export function BodyEditor({ blocks, onChange, count, over }: BodyEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (node && !node.innerHTML) node.innerHTML = blocksToHtml(blocks);
    // Deliberately mount-only: see the note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publish = () => {
    if (ref.current) onChange(htmlToBlocks(ref.current));
  };

  /**
   * `execCommand` is deprecated but remains the only thing every browser
   * implements for rich-text editing, and nothing is stored from its output —
   * the serialiser reads the resulting DOM and keeps only what it recognises.
   */
  const run = (command: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, value);
    publish();
  };

  const insertLink = () => {
    const href = window.prompt("Link address (https://…)");
    if (!href) return;
    if (!/^(https?:|mailto:)/i.test(href)) {
      setUploadError("Links must start with https:// or mailto:.");
      return;
    }
    setUploadError(null);
    run("createLink", href);
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    const result = await uploadFile(BUCKETS.blogImages, "body", file);
    setUploading(false);

    if (!result.ok) {
      setUploadError(`That image did not upload: ${result.error}`);
      return;
    }
    const url = publicUrl(BUCKETS.blogImages, result.path);
    if (url) run("insertImage", url);
  };

  return (
    <div>
      <div className={`cms-editor${over ? " cms-editor--over" : ""}`}>
        <div className="cms-toolbar">
          <button type="button" className="cms-tool cms-tool--wide cms-tool--bold" onClick={() => run("bold")} title="Bold">
            B
          </button>
          <button type="button" className="cms-tool cms-tool--wide cms-tool--italic" onClick={() => run("italic")} title="Italic">
            I
          </button>
          <span className="cms-toolbar-spacer" />
          <button type="button" className="cms-tool" onClick={() => run("formatBlock", "h2")}>
            H2
          </button>
          <button type="button" className="cms-tool" onClick={() => run("insertUnorderedList")}>
            List
          </button>
          <button type="button" className="cms-tool" onClick={insertLink}>
            Link
          </button>
          <label className="cms-tool" style={{ display: "inline-flex", alignItems: "center", cursor: uploading ? "wait" : "pointer" }}>
            {uploading ? "Uploading…" : "Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void insertImage(file);
              }}
            />
          </label>
          <span className="cms-toolbar-count">{count}</span>
        </div>

        <div
          ref={ref}
          className="cms-body"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Post body"
          data-placeholder="Write the post…"
          onInput={publish}
          onBlur={publish}
        />
      </div>

      {uploadError && (
        <p className="cms-help" style={{ color: "var(--cms-danger)", marginTop: 8 }} role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
