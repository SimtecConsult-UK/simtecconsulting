/** A span of text inside a block. `runs` concatenate directly — no joining spaces. */
export type Run = {
  t: string;
  /** Emphasis carried over from the source document. */
  b?: true;
  /** Hyperlink target carried over from the source document. */
  href?: string;
};

export type Block =
  | { t: "p"; runs: Run[] }
  /** A numbered clause, e.g. `17.1`. Terms documents only. */
  | { t: "clause"; num: string; runs: Run[] }
  /** Sub-heading inside a section, e.g. "2.1 Overall responsibility". */
  | { t: "h3"; text: string }
  | { t: "ul"; items: Run[][] }
  /** Definition list — each item leads with the term being defined. */
  | { t: "dl"; items: Run[][] }
  /** A "> " note in the source, shown as the design's callout. */
  | { t: "callout"; runs: Run[] }
  | { t: "table"; head: string[]; rows: string[][] };

export type Section = {
  id: string;
  heading: string;
  blocks: Block[];
};

export type MetaField = { label: string; value: string };

export type PolicyDoc = {
  slug: string;
  /** Short display name used in listings and navigation. */
  name: string;
  /** Page heading: display name plus the document-type word. */
  title: string;
  /** Full title as it appears in the source PDF. */
  sourceTitle: string;
  pdf: string;
  version: string | null;
  updated: string | null;
  owner: string | null;
  /** Remaining source metadata, shown at the foot of the document. */
  details: MetaField[];
  lede: Block[];
  sections: Section[];
};

export type TermsSection = Section & { n: number };

export type TermsDoc = {
  title: string;
  updated: string;
  lede: Block[];
  sections: TermsSection[];
};

export type PolicyEntry = { slug: string; name: string };

export type PolicyCategory = {
  id: string;
  label: string;
  subtitle: string;
  policies: PolicyEntry[];
};
