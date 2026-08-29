"use client";

import { useState } from "react";
import { formatCurrency, formatMonthShortThai, formatNumber } from "@/lib/format";
import type { MonthlyTrendPoint } from "@/lib/queries";

interface FinanceTrendChartProps {
  data: MonthlyTrendPoint[];
}

// Validated colorblind-safe categorical pair (light mode) — see the dataviz
// skill's default palette, slots 1 (blue) and 2 (orange). The app's usual
// green/red income/expense convention fails CVD separation (ΔE 5.0), so this
// chart intentionally uses a different, checked pair instead; the legend and
// tap-readout carry identity, not hue alone.
const INCOME_COLOR = "#2a78d6";
const EXPENSE_COLOR = "#eb6834";

const MAX_BAR_WIDTH = 24;
const BAR_GAP = 2;
const GROUP_PADDING = 6;
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 190;
const MARGIN = { top: 10, right: 8, bottom: 24, left: 42 };

function niceStep(rawStep: number): number {
  if (rawStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let niceResidual: number;
  if (residual > 5) niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;
  else niceResidual = 1;
  return niceResidual * magnitude;
}

/** Rectangle path with rounded top corners only, square at the baseline. */
function roundedTopBarPath(x: number, y: number, w: number, h: number, radius: number): string {
  if (h <= 0 || w <= 0) return "";
  const r = Math.min(radius, h, w / 2);
  return `M${x},${y + h} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h} Z`;
}

export default function FinanceTrendChart({ data }: FinanceTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  const maxValue = Math.max(0, ...data.flatMap((d) => [d.income, d.expense]));

  if (data.length === 0 || maxValue === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">
          แนวโน้มรายรับ-รายจ่าย
        </p>
        <p className="py-6 text-center text-stone-400">ยังไม่มีข้อมูลพอสำหรับแสดงกราฟ</p>
      </div>
    );
  }

  const plotWidth = VIEW_WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom;

  const step = niceStep(maxValue / 4);
  const yMax = Math.ceil(maxValue / step) * step;
  const tickCount = Math.round(yMax / step);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * step);

  const groupWidth = plotWidth / data.length;
  const innerWidth = Math.max(0, groupWidth - GROUP_PADDING * 2);
  const barWidth = Math.min(MAX_BAR_WIDTH, (innerWidth - BAR_GAP) / 2);
  const baseline = MARGIN.top + plotHeight;

  function yFor(value: number): number {
    return MARGIN.top + plotHeight - (value / yMax) * plotHeight;
  }

  const active = activeIndex != null ? data[activeIndex] : null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
          แนวโน้มรายรับ-รายจ่าย
        </p>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-stone-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
            รายรับ
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
            รายจ่าย
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="กราฟแนวโน้มรายรับและรายจ่ายรายเดือน แตะแท่งกราฟเพื่อดูตัวเลข"
      >
        {ticks.map((tickValue) => {
          const y = yFor(tickValue);
          return (
            <g key={tickValue}>
              <line
                x1={MARGIN.left}
                x2={VIEW_WIDTH - MARGIN.right}
                y1={y}
                y2={y}
                stroke="#e7e5e4"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-stone-400"
                fontSize={9}
              >
                {formatNumber(tickValue)}
              </text>
            </g>
          );
        })}

        {data.map((point, i) => {
          const groupX = MARGIN.left + i * groupWidth;
          const barsStartX = groupX + (groupWidth - (barWidth * 2 + BAR_GAP)) / 2;
          const incomeX = barsStartX;
          const expenseX = barsStartX + barWidth + BAR_GAP;
          const incomeY = yFor(point.income);
          const expenseY = yFor(point.expense);
          const isActive = activeIndex === i;
          const dim = activeIndex !== null && !isActive;

          return (
            <g key={`${point.year}-${point.month}`}>
              <path
                d={roundedTopBarPath(incomeX, incomeY, barWidth, baseline - incomeY, 4)}
                fill={INCOME_COLOR}
                opacity={dim ? 0.35 : 1}
              />
              <path
                d={roundedTopBarPath(expenseX, expenseY, barWidth, baseline - expenseY, 4)}
                fill={EXPENSE_COLOR}
                opacity={dim ? 0.35 : 1}
              />
              <text
                x={groupX + groupWidth / 2}
                y={VIEW_HEIGHT - 6}
                textAnchor="middle"
                className={isActive ? "fill-stone-700 font-bold" : "fill-stone-400"}
                fontSize={9}
              >
                {formatMonthShortThai(point.year, point.month)}
              </text>
              {/* Hit target spans the full group height/width — bigger than
                  the visual bars, per the dataviz interaction spec. */}
              <rect
                x={groupX}
                y={MARGIN.top}
                width={groupWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => setActiveIndex((current) => (current === i ? null : i))}
              />
            </g>
          );
        })}
      </svg>

      <div className="min-h-[1.75rem] rounded-xl bg-stone-50 px-3 py-2 text-xs">
        {active ? (
          <p className="font-semibold text-stone-700">
            {formatMonthShortThai(active.year, active.month)} — รายรับ{" "}
            <span className="font-bold" style={{ color: INCOME_COLOR }}>
              {formatCurrency(active.income)}
            </span>{" "}
            · รายจ่าย{" "}
            <span className="font-bold" style={{ color: EXPENSE_COLOR }}>
              {formatCurrency(active.expense)}
            </span>
          </p>
        ) : (
          <p className="text-stone-400">แตะแท่งกราฟหรือเดือนเพื่อดูตัวเลข</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setTableOpen((v) => !v)}
        className="self-start text-xs font-semibold text-stone-500 underline decoration-stone-300 underline-offset-2 active:text-stone-700"
      >
        {tableOpen ? "ซ่อนตาราง" : "ดูตาราง"}
      </button>

      {tableOpen ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-400">
                <th className="py-1.5 pr-2 font-semibold">เดือน</th>
                <th className="py-1.5 pr-2 text-right font-semibold">รายรับ</th>
                <th className="py-1.5 text-right font-semibold">รายจ่าย</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={`${point.year}-${point.month}`} className="border-b border-stone-100">
                  <td className="py-1.5 pr-2 text-stone-700">
                    {formatMonthShortThai(point.year, point.month)}
                  </td>
                  <td className="py-1.5 pr-2 text-right font-semibold text-stone-700">
                    {formatCurrency(point.income)}
                  </td>
                  <td className="py-1.5 text-right font-semibold text-stone-700">
                    {formatCurrency(point.expense)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
