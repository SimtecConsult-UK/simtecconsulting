import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/simtec-black.svg"
        alt="Simtec"
        width={160}
        height={48}
        className="h-10 w-auto object-contain"
        priority
      />
    </div>
  );
}
