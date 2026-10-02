"use client";

import { CharCount, isOver } from "./CharCount";

/**
 * The parts both editors draw the same way. They were copied between the two
 * before, which is how one of them ended up with an over-the-limit banner the
 * other did not have.
 */

/**
 * A hidden file input behind whatever label you pass.
 *
 * The input's value is cleared after every pick, without which choosing the
 * same file twice in a row fires no second change event.
 */
export function FilePicker({
  accept,
  disabled,
  onPick,
  className = "cms-drop",
  style,
  children,
}: {
  accept: string;
  disabled?: boolean;
  onPick: (file: File) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <label className={className} style={style}>
      {children}
      <input
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPick(file);
        }}
      />
    </label>
  );
}

/**
 * A picture: its preview and Replace/Remove buttons once there is one, and the
 * drop zone before that.
 *
 * The newsletter's cover, a page's share picture and the site-wide one all drew
 * this themselves, identically but for the wording. `fallbackUrl` is the one
 * real variation — a page with no picture of its own shows the site-wide one
 * greyed out, so the editor can see what a share of it would actually look
 * like. Pair it with `useImageUpload`, which owns the other half of the cycle.
 */
export function ImageField({
  url,
  fallbackUrl = null,
  uploading,
  accept = "image/*",
  choose,
  hint,
  onPick,
  onRemove,
}: {
  url: string | null;
  fallbackUrl?: string | null;
  uploading: boolean;
  accept?: string;
  /** The drop zone's first line — "Choose a cover image · 1600×900". */
  choose: string;
  /** Its second line, in mono. */
  hint: string;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  if (url) {
    return (
      <>
        <div className="cms-preview">
          {/* A plain img: this is a private tool and the file has just been
              uploaded, so there is nothing for next/image to optimise. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" />
        </div>
        <div className="cms-file-row">
          <FilePicker
            accept={accept}
            disabled={uploading}
            onPick={onPick}
            className="cms-btn cms-btn--secondary"
          >
            Replace
          </FilePicker>
          <button type="button" className="cms-btn cms-btn--danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {fallbackUrl && (
        <div className="cms-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fallbackUrl} alt="" style={{ opacity: 0.55 }} />
        </div>
      )}
      <FilePicker accept={accept} disabled={uploading} onPick={onPick}>
        <span>{uploading ? "Uploading…" : choose}</span>
        <span className="cms-mono">{hint}</span>
      </FilePicker>
    </>
  );
}

/** The error, saved and over-the-limit messages above the form. */
export function Banners({
  error,
  saved,
  savedMessage,
  warning,
}: {
  error: string | null;
  saved: boolean;
  savedMessage: React.ReactNode;
  /** Shown when something is too long, so a disabled Save button is explained. */
  warning?: string | null;
}) {
  return (
    <>
      {error && (
        <div className="cms-banner cms-banner--error" role="alert">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="cms-banner cms-banner--ok" role="status">
          {savedMessage}
        </div>
      )}
      {warning && !error && <div className="cms-banner cms-banner--error">{warning}</div>}
    </>
  );
}

/** The delete row at the foot of an editor, armed by its first click. */
export function DeleteFooter({
  help,
  label,
  confirming,
  disabled,
  onDelete,
}: {
  help: string;
  /** "Delete post" — "Confirm delete" replaces it once armed. */
  label: string;
  confirming: boolean;
  disabled?: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="cms-danger-zone">
      <span className="cms-help">{help}</span>
      <button
        type="button"
        className="cms-btn cms-btn--danger"
        disabled={disabled}
        onClick={onDelete}
      >
        {confirming ? "Confirm delete" : label}
      </button>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  /** Omit for a field with no counter. */
  limit?: number;
  help?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

/** Label, counter, input and the red outline once it is too long. */
export function TextField({ label, value, limit, help, placeholder, onChange }: FieldProps) {
  return (
    <label className="cms-field">
      <span className="cms-field-head">
        <span className="cms-label">{label}</span>
        {limit !== undefined && <CharCount value={value.length} limit={limit} />}
      </span>
      <input
        className={`cms-input${isOver(value, limit) ? " cms-input--over" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {help && <span className="cms-help">{help}</span>}
    </label>
  );
}

/** The same, for the fields that run to more than one line. */
export function TextAreaField({
  label,
  value,
  limit,
  help,
  placeholder,
  rows = 2,
  onChange,
}: FieldProps & { rows?: number }) {
  return (
    <label className="cms-field">
      <span className="cms-field-head">
        <span className="cms-label">{label}</span>
        {limit !== undefined && <CharCount value={value.length} limit={limit} />}
      </span>
      <textarea
        className={`cms-textarea${isOver(value, limit) ? " cms-textarea--over" : ""}`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {help && <span className="cms-help">{help}</span>}
    </label>
  );
}
