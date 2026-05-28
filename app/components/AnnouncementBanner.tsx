export function AnnouncementBanner() {
  return (
    <div className="w-full bg-[var(--color-accent-coral)] text-on-surface">
      <div className="mx-auto flex max-w-[var(--container-content)] flex-col items-center justify-center gap-x-8 gap-y-1 px-4 py-3 text-sm font-semibold sm:flex-row md:px-16">
        <span>Meet us at AGC 2026 Booth #125</span>
        <span className="hidden sm:inline opacity-70">·</span>
        <span className="font-normal text-on-surface/90">
          Join our session: 5/28 at 4pm:{" "}
          <span className="font-semibold">
            How Lorem Ipsum Modernized Field Reporting Through Site-Centered
            Workflows
          </span>
        </span>
      </div>
    </div>
  );
}
