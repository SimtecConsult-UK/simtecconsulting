import Image from "next/image";

type LogoProps = {
  className?: string;
  /** Rendered height in px. Defaults to the standard 40px (Tailwind h-10). */
  height?: number;
  opacity?: number;
};

export function Logo({ className = "", height = 40, opacity = 1 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/simtec-black.svg"
        alt="Simtec"
        width={160}
        height={48}
        className="w-auto object-contain"
        style={{ height, opacity }}
        priority
      />
    </div>
  );
}
