/**
 * Shown instead of an editor when no Supabase project is configured, so the
 * CMS explains itself rather than failing with an empty list.
 */
export function NotConnected() {
  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <h1 className="cms-h">Not connected yet</h1>
          <p>The content manager has no database to read from.</p>
        </div>
      </div>

      <div className="cms-card">
        <p className="cms-help">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — locally in{" "}
          <code>.env.local</code>, on Vercel under Project → Settings →
          Environment Variables — then run the migrations in{" "}
          <code>supabase/migrations</code>. The steps are written out in{" "}
          <code>supabase/README.md</code>.
        </p>
        <p className="cms-help">
          Until then the website falls back to the content committed in the
          repository, so nothing is broken for visitors.
        </p>
      </div>
    </div>
  );
}
