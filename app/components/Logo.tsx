import Image from "next/image";

type LogoProps = {
  className?: string;
  white?: boolean;
};

export function Logo({ className = "", white = false }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/simtec-black.svg"
        alt="Simtec"
        width={160}
        height={48}
        className="h-10 w-auto object-contain"
        style={white ? { filter: "brightness(0) invert(1)" } : undefined}
        priority
      />
    </div>
  );
}
