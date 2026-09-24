"use server";

import { createClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";
import { SUBMISSION_LIMITS, type SubmissionInput } from "./submission";

/**
 * Receives a completed discovery wizard.
 *
 * Unlike every other action in this codebase this one is deliberately public —
 * the whole point is that somebody who is not signed in can send it. That
 * makes it the one write path a stranger can reach, so it checks the shape and
 * size of what it is given rather than trusting the browser that sent it, and
 * row-level security lets `anon` insert here and nowhere else.
 */
export async function submitDiscovery(
  input: SubmissionInput
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    console.error("[discovery] submission dropped: no Supabase project configured");
    return { error: "We could not send your answers just now. Please try again." };
  }

  if (!input.consent) {
    return { error: "Tick the consent box before sending your answers." };
  }

  const text = (value: unknown, limit: number) =>
    typeof value === "string" ? value.trim().slice(0, limit) : null;

  const answers = input.answers ?? {};
  const field = (id: string, limit: number) => text(answers[id], limit);

  const company = field("company", SUBMISSION_LIMITS.company);
  const contactName = field("contactName", SUBMISSION_LIMITS.contactName);
  const email = field("email", SUBMISSION_LIMITS.email);

  if (!company || !contactName || !email) {
    return { error: "Fill in your company, name and email before sending." };
  }

  // Cheap sanity check only. Anything stricter rejects addresses that work.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email address does not look right. Please check it." };
  }

  const payload = JSON.stringify({ answers, repRows: input.repRows ?? {} });
  if (payload.length > SUBMISSION_LIMITS.payloadBytes) {
    return { error: "Those answers are too long to send. Please shorten them." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").insert({
    company,
    contact_name: contactName,
    contact_role: field("contactRole", SUBMISSION_LIMITS.contactRole),
    email,
    phone: field("phone", SUBMISSION_LIMITS.phone),
    project_name: field("projectName", SUBMISSION_LIMITS.projectName),
    answers,
    rep_rows: input.repRows ?? {},
    consent: true,
  });

  if (error) {
    // Logged in full so a failure is diagnosable; the visitor sees a plain
    // sentence rather than a database message.
    console.error(`[discovery] submission failed: ${error.message}`);
    return { error: "We could not send your answers just now. Please try again." };
  }

  return { error: null };
}
