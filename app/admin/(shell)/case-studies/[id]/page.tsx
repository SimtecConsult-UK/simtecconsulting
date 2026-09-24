import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";
import { getCaseStudyForEdit, nextPosition } from "../data";
import { CaseStudyEditor } from "../CaseStudyEditor";
import { NotConnected } from "../../NotConnected";

export default async function CaseStudyEditorPage(
  props: PageProps<"/admin/case-studies/[id]">
) {
  if (!isSupabaseConfigured) return <NotConnected />;

  const { id } = await props.params;

  if (id === "new") {
    return <CaseStudyEditor caseStudy={null} nextPosition={await nextPosition()} />;
  }

  const caseStudy = await getCaseStudyForEdit(id);
  if (!caseStudy) notFound();

  return <CaseStudyEditor caseStudy={caseStudy} nextPosition={caseStudy.position} />;
}
