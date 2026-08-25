import type { ReactNode } from "react";

interface BannerProps {
  variant: "success" | "error" | "warning";
  children: ReactNode;
}

const styles: Record<BannerProps["variant"], string> = {
  success: "bg-green-50 text-green-700 ring-green-200",
  error: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function Banner({ variant, children }: BannerProps) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 ${styles[variant]}`}>
      {children}
    </div>
  );
}
