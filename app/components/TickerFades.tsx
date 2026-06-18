export function TickerFades({ color, widthClass = "w-16" }: { color: string; widthClass?: string }) {
  return (
    <>
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-10 ${widthClass}`} style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 z-10 ${widthClass}`} style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
    </>
  );
}
