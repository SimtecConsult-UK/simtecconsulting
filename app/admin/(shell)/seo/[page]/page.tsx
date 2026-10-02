import { notFound } from "next/navigation";
import { seoPageById } from "../../../../lib/seo/pages";
import { PageSeoEditor } from "../PageSeoEditor";
import { getPageSeoForEdit, getSiteSettingsForEdit } from "../data";

export default async function PageSeoPage(props: PageProps<"/admin/seo/[page]">) {
  const { page: id } = await props.params;
  const page = seoPageById(id);
  if (!page) notFound();

  const [seo, settings] = await Promise.all([
    getPageSeoForEdit(page.path),
    getSiteSettingsForEdit(),
  ]);

  return (
    <PageSeoEditor page={page} seo={seo} fallbackShareUrl={settings.socialImage.url} />
  );
}
