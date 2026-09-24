"use server";

import { createClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";
import { sanitizeAnswers } from "./data";
import {
  MAX_PAYLOAD_CHARS,
  SEND_FAILED,
  validateSubmission,
  type ContactField,
  type SubmissionInput,
} from "./submission";

/**
 * Receives a completed discovery wizard.
 *
 * Unlike every other action in this codebase this one is deliberately public —
 * the whole point is that somebody who is not signed in can send it. That
 * makes it the one write path a stranger can reach, so it checks what it is
 * given rather than trusting the browser that sent it, and row-level security
 * lets `anon` insert here and nowhere else.
 *
 * Note there is no rate limit: nothing stops the same visitor sending a
 * hundred of these. That belongs at the edge (a Vercel Firewall rule on
 * /discovery) rather than in code, since a serverless instance cannot count
 * requests it never saw.
 */
export async function submitDiscovery(
  input: SubmissionInput
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    console.error("[discovery] submission dropped: no Supabase project configured");
    return { error: SEND_FAILED };
  }

  const problem = validateSubmission(input);
  if (problem) return { error: problem };

  // Forces each answer into the shape its question expects. Without it a
  // multi-choice answer arriving as plain text is stored as plain text, and
  // the CMS cannot replay the submission it belongs to.
  const answers = sanitizeAnswers(input.answers ?? {});
  const repRows = input.repRows ?? {};

  if (JSON.stringify({ answers, repRows }).length > MAX_PAYLOAD_CHARS) {
    return { error: "Those answers are too long to send. Please shorten them." };
  }

  const contact = (id: ContactField) => {
    const value = answers[id];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").insert({
    company: contact("company"),
    contact_name: contact("contactName"),
    contact_role: contact("contactRole"),
    email: contact("email"),
    phone: contact("phone"),
    project_name: contact("projectName"),
    answers,
    rep_rows: repRows,
    consent: true,
  });

  if (error) {
    // Logged in full so a failure is diagnosable; the visitor sees a plain
    // sentence rather than a database message.
    console.error(`[discovery] submission failed: ${error.message}`);
    return { error: SEND_FAILED };
  }

  return { error: null };
}
