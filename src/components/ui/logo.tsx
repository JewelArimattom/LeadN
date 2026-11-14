import Link from "next/link";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight ${className ?? ""}`}
      aria-label="Lead N — Home"
    >
      {/* Logo mark */}
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white text-sm font-extrabold">
        LN
      </span>
      <span>
        Lead<span className="text-[var(--primary)]"> N</span>
      </span>
    </Link>
  );
}
