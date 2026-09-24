"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";

/**
 * Writes for the submissions section. There is no edit: a submission is a
 * record of what somebody sent, so the only changes are marking it read and
 * deleting it.
 */

/** Called when an editor opens one, so the list can show what is new. */
export async function markSubmissionRead(id: string) {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    console.error(`[cms] mark submission ${id} read: ${error.message}`);
    return;
  }
  revalidatePath("/admin/submissions");
}

export async function deleteSubmission(id: string) {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").delete().eq("id", id);

  if (error) return { error: `Could not delete: ${error.message}` };

  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}
