"use client";

import { Banners, ImageField, TextField } from "../../EditorUI";
import { statusLabel, useEditorDraft } from "../../useEditorDraft";
import { useImageUpload } from "../../useImageUpload";
import { BUCKETS, publicUrl } from "../../../lib/supabase/storage";
import { TEAM_SLOTS, type TeamPhoto, type TeamSlot } from "../../../lib/homepage/types";
import { saveTeamPhotos, type TeamPhotoInput } from "./actions";
import { LIMITS, validateTeamPhotos } from "./limits";

/**
 * The photos in "The people behind the systems" — one wide photo across the
 * top and four squares under it.
 *
 * Five fixed tiles rather than a list you add to, because that is what the
 * design draws: a sixth photo would have nowhere to go. A tile nobody has
 * uploaded to shows the photo the site was built with, greyed out, so the
 * section always looks the way the live page looks.
 *
 * The heading above the photos is not editable here — it is part of the
 * section's design, and the wording for the page itself lives under SEO & AI.
 */

/** The five tiles, in `TEAM_SLOTS` order — which the render relies on. */
type Draft = { photos: TeamPhotoInput[] };

function toDraft(photos: TeamPhoto[]): Draft {
  return {
    photos: TEAM_SLOTS.map((slot) => {
      const photo = photos.find((candidate) => candidate.slot === slot.slot);
      return {
        slot: slot.slot,
        // Null while the committed photo is in use, which is what the page
        // falls back to and what Remove goes back to.
        path: photo?.path ?? null,
        // Only an uploaded photo carries its own description; the committed
        // ones keep the wording in the component.
        alt: photo?.path ? photo.alt : "",
      };
    }),
  };
}

export function TeamEditor({ photos }: { photos: TeamPhoto[] }) {
  const { draft, edit, status, error, setError, pending, save } = useEditorDraft<Draft>(() =>
    toDraft(photos)
  );

  /**
   * Built from the draft as it is when the change lands, not as it was when the
   * handler was made. Each tile uploads on its own, so two can be in flight at
   * once and a third can be having its description typed — and a handler that
   * rebuilt the list from its own captured copy would undo whichever of those
   * finished first.
   */
  const update = (slot: number, fields: Partial<TeamPhotoInput>) =>
    edit((current) => ({
      ...current,
      photos: current.photos.map((photo) =>
        photo.slot === slot ? { ...photo, ...fields } : photo
      ),
    }));

  // `toDraft` maps TEAM_SLOTS, so the two lists stay in step and can be walked
  // together rather than looked up by slot number.
  const [main, ...grid] = TEAM_SLOTS;
  const [mainDraft, ...gridDrafts] = draft.photos;

  /** The same sentence the server would send back, so Save explains itself. */
  const tooLong = validateTeamPhotos(draft.photos);

  return (
    <div className="cms-page cms-page--narrow">
      <div className="cms-editor-head">
        <h1 className="cms-h" style={{ fontSize: 30 }}>
          Team
        </h1>

        <div className="cms-editor-head-row">
          <span className="cms-mono">
            {statusLabel(status, "The photos on the homepage")}
          </span>
          <button
            type="button"
            className="cms-btn cms-btn--primary"
            onClick={() => save(() => saveTeamPhotos(draft.photos))}
            disabled={pending || tooLong !== null}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <Banners
        error={error}
        saved={status === "saved"}
        savedMessage="Saved. The homepage shows these straight away."
        warning={tooLong}
      />

      <PhotoSlot slot={main} draft={mainDraft} onChange={update} onError={setError} />

      <div className="cms-grid-2">
        {grid.map((slot, index) => (
          <PhotoSlot
            key={slot.slot}
            slot={slot}
            draft={gridDrafts[index]}
            onChange={update}
            onError={setError}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * One tile. A component of its own rather than markup in a loop, because each
 * one needs its own upload state and a hook cannot be called inside a loop.
 */
function PhotoSlot({
  slot,
  draft,
  onChange,
  onError,
}: {
  slot: TeamSlot;
  draft: TeamPhotoInput;
  onChange: (slot: number, fields: Partial<TeamPhotoInput>) => void;
  onError: (message: string | null) => void;
}) {
  const upload = useImageUpload({
    bucket: BUCKETS.siteAssets,
    folder: "team",
    noun: "photo",
    onError,
    onUploaded: ({ path }) => onChange(slot.slot, { path }),
  });

  // Derived, not held: the preview is always the public URL of what is stored.
  const url = publicUrl(BUCKETS.siteAssets, draft.path);

  return (
    <div className="cms-card">
      <span className="cms-label">{slot.name}</span>
      <span className="cms-help">{slot.blurb}</span>

      <ImageField
        url={url}
        // The photo the site was built with, so the tile is never an empty box.
        fallbackUrl={slot.fallbackSrc}
        uploading={upload.uploading}
        choose="Choose a photo"
        hint="JPG, PNG or WebP · under 15 MB"
        onPick={upload.pick}
        onRemove={() => onChange(slot.slot, { path: null, alt: "" })}
      />

      {url && (
        <TextField
          label="Description for screen readers"
          value={draft.alt}
          limit={LIMITS.alt}
          help="Who or what is in the photo. Leave it empty to keep the wording the page already uses."
          onChange={(value) => onChange(slot.slot, { alt: value })}
        />
      )}

      <p className="cms-help">
        {url
          ? "Remove puts the original photo back."
          : "This tile is showing the photo the site was built with."}
      </p>
    </div>
  );
}
