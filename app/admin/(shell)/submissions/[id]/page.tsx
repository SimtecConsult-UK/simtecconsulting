import { after } from "next/server";
import { notFound } from "next/navigation";
import { getSubmission } from "../data";
import { markSubmissionRead } from "../actions";
import { SubmissionView } from "../SubmissionView";

export default async function SubmissionPage(
  props: PageProps<"/admin/submissions/[id]">
) {
  const { id } = await props.params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  // Opening it is what marks it read. Deferred with `after` so the write does
  // not sit between the editor and the page, and skipped entirely for one that
  // has already been opened — that update would match no rows anyway.
  if (!submission.isRead) {
    after(() => markSubmissionRead(submission.id));
  }

  return <SubmissionView submission={submission} />;
}
