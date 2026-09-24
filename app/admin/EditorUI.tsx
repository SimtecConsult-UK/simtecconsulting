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
