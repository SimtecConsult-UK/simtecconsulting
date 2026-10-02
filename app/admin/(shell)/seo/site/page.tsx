import { SiteSettingsEditor } from "../SiteSettingsEditor";
import { getSiteSettingsForEdit } from "../data";

export default async function SiteSettingsPage() {
  const settings = await getSiteSettingsForEdit();
  return <SiteSettingsEditor settings={settings} />;
}
