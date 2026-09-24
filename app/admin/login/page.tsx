import Image from "next/image";
import { redirect } from "next/navigation";
import { getEditor } from "../../lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage(props: PageProps<"/admin/login">) {
  // Someone already signed in has no business on this page.
  if (await getEditor()) redirect("/admin");

  const { next } = await props.searchParams;
  const target = typeof next === "string" ? next : "";

  return (
    <div className="cms-login">
      <div className="cms-login-inner">
        <Image src="/simtec-black.svg" alt="Simtec" width={120} height={24} style={{ height: 24, width: "auto", alignSelf: "flex-start" }} />

        <div className="cms-login-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <h1 className="cms-h">Content manager</h1>
            <p>Sign in to manage newsletter posts and case studies.</p>
          </div>

          <LoginForm next={target} />
        </div>

        <p className="cms-mono" style={{ letterSpacing: "0.08em" }}>
          SIMTEC CMS · V1
        </p>
      </div>
    </div>
  );
}
