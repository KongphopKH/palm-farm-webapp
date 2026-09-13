import Link from "next/link";
import type { ReactNode } from "react";

interface QuickActionButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  /** Full Tailwind classes for the icon circle, e.g. "bg-primary/10 text-primary". */
  tintClass: string;
}

/**
 * Compact icon-over-label button for the home dashboard's quick-action grid
 * — the most frequently tapped actions (log a harvest/activity/expense), so
 * this sits right at the top of the page, in easy thumb reach. The icon sits
 * in a tinted circle (light background, colored icon) rather than a solid
 * filled one, matching the Figma reference.
 */
export default function QuickActionButton({ href, icon, label, tintClass }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-stone-200 transition active:scale-[0.97]"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tintClass}`}>
        {icon}
      </span>
      <span className="text-xs font-bold leading-tight text-stone-700">{label}</span>
    </Link>
  );
}
