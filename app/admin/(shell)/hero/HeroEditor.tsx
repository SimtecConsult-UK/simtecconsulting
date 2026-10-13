"use client";

import { Banners, DeleteFooter, TextAreaField, TextField, VideoField } from "../../EditorUI";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { useVideoUpload } from "../../useVideoUpload";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { BOOKING_URL } from "../../../lib/sections";
import { DEFAULT_HERO, type HeroContent } from "../../../lib/homepage/types";
import { resetHeroWording, saveHero, type HeroInput } from "./actions";
import { LIMITS, heroTooLong } from "./limits";

/**
 * The top of the homepage: the headline, the sentence under it, the button
 * wording, and the recording playing inside the browser mock-up.
 *
 * Everything else about the section — where the text sits, the blueprint
 * background, the glow behind the window — is the design and is not editable
 * here. Nor is where the button points: every "Book a Workshop" on the site
 * shares one address, so changing it in one place only would split them.
 */

function toInput(hero: HeroContent): HeroInput {
  return {
    headlineLead: hero.headlineLead,
    headlineAccent: hero.headlineAccent,
    subhead: hero.subhead,
    ctaLabel: hero.ctaLabel,
    videoPath: hero.video.path,
  };
}

export function HeroEditor({ hero }: { hero: HeroContent }) {
  const {
    draft,
    setDraft,
    set,
    status,
    error,
    setError,
    pending,
    confirmDelete,
    save,
    remove,
  } = useEditorDraft<HeroInput>(() => toInput(hero));

  // Derived, not held: the preview is always the public URL of what is stored,
  // so a second piece of state would only be something to keep in step.
  const videoUrl = publicUrl(BUCKETS.siteAssets, draft.videoPath);

  const video = useVideoUpload({
    bucket: BUCKETS.siteAssets,
    folder: "hero",
    onError: setError,
    onUploaded: (path) => set("videoPath", path),
  });

  /** The same sentence the server would send back, so Save explains itself. */
  const tooLong = heroTooLong(draft);

  return (
    <div className="cms-page cms-page--narrow">
      <div className="cms-editor-head">
        <h1 className="cms-h" style={{ fontSize: 30 }}>
          Hero
        </h1>

        <div className="cms-editor-head-row">
          <span className="cms-mono">{statusLabel(status, "The top of the homepage")}</span>
          <button
            type="button"
            className="cms-btn cms-btn--primary"
            onClick={() => save(() => saveHero(draft))}
            disabled={pending || tooLong !== null}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <Banners
        error={error}
        saved={status === "saved"}
        savedMessage="Saved. The homepage shows this straight away."
        warning={tooLong}
      />

      <div className="cms-card">
        <span className="cms-label">Headline</span>
        <TextField
          label="Main text"
          value={draft.headlineLead}
          limit={LIMITS.headlineLead}
          help="The white part, and the largest type on the site. Two lines on a laptop."
          onChange={(value) => set("headlineLead", value)}
        />
        <TextField
          label="Highlighted ending"
          value={draft.headlineAccent}
          limit={LIMITS.headlineAccent}
          help="Drawn in the brand blue, straight after the line above with a space between. Leave it empty for a headline in one colour."
          onChange={(value) => set("headlineAccent", value)}
        />

        {/* The two fields drawn as the page draws them, because they read as one
            sentence and splitting them across two boxes hides that. */}
        <div className="cms-subcard" style={{ background: "#12201f" }}>
          <span className="cms-label" style={{ color: "#9aa5a4" }}>
            On the page
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            {draft.headlineLead}{" "}
            {/* The brand blue by value: admin.css is a separate stylesheet and
                does not carry the public site's custom properties. */}
            <span style={{ color: "#6eeada" }}>{draft.headlineAccent}</span>
          </span>
        </div>
      </div>

      <div className="cms-card">
        <span className="cms-label">Sub-heading and button</span>
        <TextAreaField
          label="Sub-heading"
          value={draft.subhead}
          limit={LIMITS.subhead}
          rows={3}
          help="The paragraph under the headline. Three lines on a laptop, more on a phone."
          onChange={(value) => set("subhead", value)}
        />
        <TextField
          label="Button wording"
          value={draft.ctaLabel}
          limit={LIMITS.ctaLabel}
          help={`Always opens ${BOOKING_URL} in a new tab, the same as every other workshop button on the site. Only the wording is set here.`}
          onChange={(value) => set("ctaLabel", value)}
        />
      </div>

      <div className="cms-card">
        <span className="cms-label">Screen recording</span>
        <VideoField
          url={videoUrl}
          uploading={video.uploading}
          checks={video.checks}
          choose="Choose the screen recording"
          onPick={video.pick}
          onRemove={() => {
            set("videoPath", null);
            video.clearChecks();
          }}
        />
        <p className="cms-help">
          Plays inside the browser window on the homepage: on a loop, without sound, and only
          on laptops and desktops — phones and tablets never show it. Remove it to go back to
          the recording the site was built with.
        </p>
      </div>

      <DeleteFooter
        help="Puts the headline, sub-heading and button back to the words the site was built with. The recording is left as it is."
        label="Reset the wording"
        confirming={confirmDelete}
        disabled={pending}
        onDelete={() =>
          // The wording goes back to the committed words; the recording is the
          // one field the reset leaves alone, so it is carried over.
          remove(resetHeroWording, () =>
            setDraft((current) => ({ ...toInput(DEFAULT_HERO), videoPath: current.videoPath }))
          )
        }
      />
    </div>
  );
}
