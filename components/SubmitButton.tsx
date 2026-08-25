import type { ReactNode } from "react";

interface SubmitButtonProps {
  loading?: boolean;
  children: ReactNode;
  colorClass?: string;
}

export default function SubmitButton({
  loading,
  children,
  colorClass = "bg-green-600 active:bg-green-700",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full rounded-2xl py-4 text-lg font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60 ${colorClass}`}
    >
      {loading ? "กำลังบันทึก..." : children}
    </button>
  );
}
