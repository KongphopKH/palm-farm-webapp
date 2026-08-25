interface StatCardProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

export default function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  const toneClass =
    tone === "positive" ? "text-green-700" : tone === "negative" ? "text-red-600" : "text-stone-800";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}
