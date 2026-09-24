import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";
import { getPostForEdit } from "../data";
import { PostEditor } from "../PostEditor";
import { NotConnected } from "../../NotConnected";

export default async function PostEditorPage(
  props: PageProps<"/admin/newsletter/[id]">
) {
  if (!isSupabaseConfigured) return <NotConnected />;

  const { id } = await props.params;

  // "new" is the one id that is not a row: it opens an empty editor, and saving
  // redirects to the post's real address.
  if (id === "new") return <PostEditor post={null} />;

  const post = await getPostForEdit(id);
  if (!post) notFound();

  return <PostEditor post={post} />;
}
