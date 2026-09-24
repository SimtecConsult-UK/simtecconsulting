import { redirect } from "next/navigation";

/** The CMS opens on the newsletter, as the handover's sidebar order implies. */
export default function AdminHome() {
  redirect("/admin/newsletter");
}
