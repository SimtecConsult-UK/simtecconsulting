"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";

/**
 * Writes for the submissions section. There is no edit: a submission is a
 * record of what somebody sent, so the only changes are deleting it and
 * marking it read — and the latter lives in `read.ts`, which explains why.
 */

export async function deleteSubmission(id: string) {
  await requireEditor();

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").delete().eq("id", id);

  if (error) return { error: `Could not delete: ${error.message}` };

  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}
