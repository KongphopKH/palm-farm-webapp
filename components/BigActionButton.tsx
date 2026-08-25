import Link from "next/link";
import type { ReactNode } from "react";

interface BigActionButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  colorClass: string;
}

/** Large, thumb-friendly call-to-action button used on the home dashboard. */
export default function BigActionButton({ href, icon, label, colorClass }: BigActionButtonProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl px-5 py-5 text-white shadow-md transition active:scale-[0.98] ${colorClass}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
        {icon}
      </span>
      <span className="text-lg font-bold leading-tight">{label}</span>
    </Link>
  );
}
