import { notFound } from "next/navigation";
import { formatSubmittedAt, getSubmission } from "../data";
import { markSubmissionRead } from "../actions";
import { SubmissionView } from "../SubmissionView";

export default async function SubmissionPage(
  props: PageProps<"/admin/submissions/[id]">
) {
  const { id } = await props.params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  // Opening it is what marks it read, so the list can show what is new.
  await markSubmissionRead(submission.id);

  return (
    <SubmissionView
      submission={submission}
      submittedAt={formatSubmittedAt(submission.createdAt)}
    />
  );
}
