import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import type { Answers, RepRow } from "../../../discovery/data";

/**
 * Reads for the submissions section.
 *
 * A submission is a record of what somebody sent, so nothing here writes to it
 * beyond marking it read — the editor reads and replies, they do not edit.
 */

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

const LIST_COLUMNS =
  "id,created_at,company,contact_name,email,project_name,read_at";

function toListItem(row: Row): SubmissionListItem {
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

export async function listSubmissions(): Promise<SubmissionListItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[cms] list submissions: ${error.message}`);
    return [];
  }
  return (data as Row[]).map(toListItem);
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

/** How many have never been opened — the number the sidebar badge shows. */
export async function countUnreadSubmissions(): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    console.error(`[cms] count unread submissions: ${error.message}`);
    return 0;
  }
  return count ?? 0;
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
