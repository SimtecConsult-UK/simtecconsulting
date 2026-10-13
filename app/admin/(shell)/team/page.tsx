import { TeamEditor } from "./TeamEditor";
import { getTeamPhotosForEdit } from "./data";

export default async function TeamPage() {
  const photos = await getTeamPhotosForEdit();
  return <TeamEditor photos={photos} />;
}
