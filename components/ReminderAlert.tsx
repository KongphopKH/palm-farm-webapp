import type { ReactNode } from "react";

type Variant = "success" | "warning" | "info";

const styles: Record<Variant, { wrap: string; icon: string }> = {
  success: { wrap: "bg-primary/5 ring-primary/15", icon: "bg-primary/10 text-primary" },
  warning: { wrap: "bg-amber-50 ring-amber-200", icon: "bg-amber-100 text-amber-600" },
  info: { wrap: "bg-blue-50 ring-blue-200", icon: "bg-blue-100 text-blue-600" },
};

interface ReminderAlertProps {
  variant: Variant;
  icon: ReactNode;
  title: string;
  description: string;
}

/**
 * Icon + title + description alert row for the dashboard's Smart Reminders
 * section — replaces plain-text Banner rows so each reminder reads at a
 * glance (matches the Figma reference's alert-card pattern, using a
 * lucide icon instead of an emoji glyph).
 */
export default function ReminderAlert({ variant, icon, title, description }: ReminderAlertProps) {
  const s = styles[variant];
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-3 ring-1 ${s.wrap}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${s.icon}`}>
        {icon}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-bold text-stone-800">{title}</p>
        <p className="mt-0.5 text-xs text-stone-500">{description}</p>
      </div>
    </div>
  );
}
