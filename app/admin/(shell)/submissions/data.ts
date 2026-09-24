import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import type { Answers, RepRow } from "../../../discovery/data";

/**
 * Reads for the submissions section.
 *
 * A submission is a record of what somebody sent, so nothing here writes to it
 * beyond marking it read — the editor reads and replies, they do not edit.
 */

/** How many the list shows on one page. */
export const PAGE_SIZE = 50;

export type SubmissionListItem = {
  id: string;
  createdAt: string;
  company: string | null;
  contactName: string | null;
  email: string | null;
  projectName: string | null;
  isRead: boolean;
};

export type Submission = SubmissionListItem & {
  contactRole: string | null;
  phone: string | null;
  consent: boolean;
  answers: Answers;
  repRows: Record<string, RepRow[]>;
};

type Row = {
  id: string;
  created_at: string;
  company: string | null;
  contact_name: string | null;
  contact_role: string | null;
  email: string | null;
  phone: string | null;
  project_name: string | null;
  answers: Answers | null;
  rep_rows: Record<string, RepRow[]> | null;
  consent: boolean;
  read_at: string | null;
};

/** Exactly the columns the list query asks for, so the cast tells the truth. */
type ListRow = Pick<
  Row,
  "id" | "created_at" | "company" | "contact_name" | "email" | "project_name" | "read_at"
>;

function toListItem(row: ListRow): SubmissionListItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    company: row.company,
    contactName: row.contact_name,
    email: row.email,
    projectName: row.project_name,
    isRead: row.read_at !== null,
  };
}

/** One page of the list, and enough about the rest to draw the pager. */
export type SubmissionPage = {
  items: SubmissionListItem[];
  /** 1-based, and clamped to a page that exists — so ?page=999 shows the last one. */
  page: number;
  pageCount: number;
  total: number;
};

const EMPTY_PAGE: SubmissionPage = { items: [], page: 1, pageCount: 1, total: 0 };

/**
 * One page of submissions, newest first.
 *
 * Paged rather than capped. This is the one table strangers can write to and
 * nothing rate-limits them, so the row count is not ours to bound — and a flat
 * limit would mean an enquiry past it could not be read *or* deleted, since
 * deleting one is only possible from its own page, which is only reachable
 * from this list.
 */
export async function listSubmissions(requestedPage = 1): Promise<SubmissionPage> {
  if (!isSupabaseConfigured) return EMPTY_PAGE;

  const supabase = await createClient();

  // Counted first so the page number can be clamped to something that exists,
  // rather than silently serving an empty list for an out-of-range ?page=.
  const { count, error: countError } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error(`[cms] count submissions: ${countError.message}`);
    return EMPTY_PAGE;
  }

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
  const from = (page - 1) * PAGE_SIZE;

  const { data, error } = await supabase
    .from("submissions")
    .select("id,created_at,company,contact_name,email,project_name,read_at")
    .order("created_at", { ascending: false })
    // A tiebreaker, so two submissions sent in the same instant cannot swap
    // places between two page reads and leave one of them unreachable.
    .order("id", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error(`[cms] list submissions: ${error.message}`);
    return EMPTY_PAGE;
  }
  return { items: (data as ListRow[]).map(toListItem), page, pageCount, total };
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`[cms] load submission ${id}: ${error.message}`);
    return null;
  }
  if (!data) return null;

  const row = data as Row;
  return {
    ...toListItem(row),
    contactRole: row.contact_role,
    phone: row.phone,
    consent: row.consent,
    answers: row.answers ?? {},
    repRows: row.rep_rows ?? {},
  };
}

/** "12 September 2026, 14:03" — the same en-GB/UTC rule the blog dates use. */
const STAMP = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatSubmittedAt(iso: string): string {
  return STAMP.format(new Date(iso));
}
