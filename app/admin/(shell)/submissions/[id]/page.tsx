import { after } from "next/server";
import { notFound } from "next/navigation";
import { requireEditor } from "../../../../lib/auth";
import { createClient } from "../../../../lib/supabase/server";
import { getSubmission } from "../data";
import { markSubmissionRead } from "../read";
import { SubmissionView } from "../SubmissionView";

export default async function SubmissionPage(
  props: PageProps<"/admin/submissions/[id]">
) {
  const { id } = await props.params;

  // Both resolved here, during the render, rather than inside the `after`
  // callback below: a Server Component may not read request data — which is
  // what the session cookie is — once React has finished with it, so anything
  // the deferred write needs has to be in hand before it is scheduled.
  await requireEditor();
  const supabase = await createClient();

  const submission = await getSubmission(id);
  if (!submission) notFound();

  // Opening it is what marks it read. Deferred with `after` so the write does
  // not sit between the editor and the page, and skipped entirely for one that
  // has already been opened — that update would match no rows anyway.
  if (!submission.isRead) {
    after(() => markSubmissionRead(supabase, submission.id));
  }

  return <SubmissionView submission={submission} />;
}
