"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Wallet2 } from "lucide-react";

const items = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/plots", label: "แปลงปาล์ม", icon: Map },
  { href: "/finance", label: "บัญชีฟาร์ม", icon: Wallet2 },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-stone-200 bg-white/95 backdrop-blur">
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-semibold ${
                  active ? "text-green-700" : "text-stone-400"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
