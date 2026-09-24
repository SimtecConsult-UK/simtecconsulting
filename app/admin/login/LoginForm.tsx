"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type SignInState } from "../auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="cms-btn cms-btn--primary" disabled={pending} style={{ width: "100%", padding: 14, fontSize: 15 }}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<SignInState, FormData>(signIn, {
    error: null,
  });

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <input type="hidden" name="next" value={next} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label className="cms-field">
          <span className="cms-label">Email</span>
          <input
            className="cms-input"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@simtecconsult.com"
            required
          />
        </label>
        <label className="cms-field">
          <span className="cms-label">Password</span>
          <input
            className="cms-input"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            required
          />
        </label>
        {state.error && (
          <span style={{ fontSize: 13.5, color: "var(--cms-danger)" }} role="alert">
            {state.error}
          </span>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
