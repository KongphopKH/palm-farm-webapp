import { formatCurrency } from "@/lib/format";

interface FinanceSummaryCardProps {
  monthLabel: string;
  income: number;
  expense: number;
  loading: boolean;
}

/**
 * Bold primary-colored monthly finance summary for the dashboard — total
 * income, net profit, and an income/expense split bar. Matches the Figma
 * reference's dark-green summary card.
 */
export default function FinanceSummaryCard({
  monthLabel,
  income,
  expense,
  loading,
}: FinanceSummaryCardProps) {
  const profit = income - expense;
  const total = income + expense;
  const incomeShare = total > 0 ? Math.round((income / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />

      <p className="text-xs font-semibold text-white/70">สรุปการเงิน — {monthLabel}</p>

      <div className="mt-1 flex items-end justify-between">
        <div>
          <p className="text-3xl font-extrabold text-white">
            {loading ? "…" : formatCurrency(income)}
          </p>
          <p className="mt-0.5 text-xs text-white/65">รายรับรวม</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${profit < 0 ? "text-red-200" : "text-green-200"}`}>
            {loading ? "…" : `${profit >= 0 ? "+" : ""}${formatCurrency(profit)}`}
          </p>
          <p className="text-[11px] text-white/55">กำไรสุทธิ</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white/10 px-3.5 py-2.5">
        <div className="flex justify-between">
          <div>
            <p className="text-[11px] text-white/60">รายรับ</p>
            <p className="text-sm font-bold text-green-200">{loading ? "…" : formatCurrency(income)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/60">รายจ่าย</p>
            <p className="text-sm font-bold text-red-200">{loading ? "…" : formatCurrency(expense)}</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-1.5 rounded-full bg-green-200"
            style={{ width: `${loading ? 0 : incomeShare}%` }}
          />
        </div>
      </div>
    </div>
  );
}
