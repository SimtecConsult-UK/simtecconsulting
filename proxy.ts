import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./app/lib/supabase/config";

/**
 * Next 16 renamed Middleware to Proxy; the file lives at the project root and
 * the behaviour is unchanged.
 *
 * This does two things for /admin: it refreshes the Supabase session cookie so
 * a signed-in editor is not logged out mid-edit, and it bounces obviously
 * signed-out visitors to the sign-in page before the page renders.
 *
 * The redirect here is a convenience, NOT the security boundary. Next's own
 * guidance is that a proxy runs on prefetches and should only read the cookie;
 * the real check is `requireEditor()` in app/lib/auth.ts, which every admin
 * page and every write goes through, and behind that the database's row-level
 * security. Nothing is protected by this file alone.
 */
export async function proxy(request: NextRequest) {
  // Without a project configured there is no session to refresh and no sign-in
  // that could succeed; let the admin pages render their own "not connected"
  // message rather than bouncing round a redirect loop.
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates the token with Supabase and writes any refreshed
  // cookie through the handlers above. Do not swap it for getSession(), which
  // trusts the cookie as-is.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const onLoginPage = pathname === "/admin/login";

  if (!user && !onLoginPage) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/admin/login";
    // So the editor lands back where they were headed.
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  if (user && onLoginPage) {
    const home = request.nextUrl.clone();
    home.pathname = "/admin";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  // Only the admin area needs a session, so the public pages pay nothing.
  matcher: ["/admin/:path*"],
};
