import Link from "next/link";
import type { ReactNode } from "react";

interface QuickActionButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  colorClass: string;
}

/**
 * Compact icon-over-label button for the home dashboard's quick-action grid
 * — the most frequently tapped actions (log a harvest/activity/expense), so
 * this sits right at the top of the page, in easy thumb reach.
 */
export default function QuickActionButton({ href, icon, label, colorClass }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-stone-200 transition active:scale-[0.97]"
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${colorClass}`}>
        {icon}
      </span>
      <span className="text-xs font-bold leading-tight text-stone-700">{label}</span>
    </Link>
  );
}
