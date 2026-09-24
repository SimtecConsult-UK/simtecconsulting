"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";

export type SignInState = { error: string | null };

/**
 * Sign in with the one editor account.
 *
 * Supabase verifies the password and issues the session; this app never sees,
 * stores or hashes it. The account is created once in the Supabase dashboard
 * under Authentication → Users.
 */
export async function signIn(
  _previous: SignInState,
  formData: FormData
): Promise<SignInState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "This site is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and password to continue." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately vague: saying which half was wrong tells someone guessing
    // whether an address is a real account.
    return { error: "That email and password did not match. Please try again." };
  }

  const next = String(formData.get("next") ?? "");
  // Only ever redirect inside the admin area — a caller-supplied absolute URL
  // would turn the sign-in form into an open redirect.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
