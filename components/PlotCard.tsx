import { formatNumber } from "@/lib/format";
import type { Plot } from "@/types";

export default function PlotCard({ plot }: { plot: Plot }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-stone-800">{plot.name}</h3>
        <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          ปาล์มน้ำมัน
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-stone-500">จำนวนต้น</p>
          <p className="text-xl font-bold text-stone-800">{formatNumber(plot.amount)} ต้น</p>
        </div>
        <div>
          <p className="text-xs text-stone-500">ขนาดพื้นที่</p>
          <p className="text-xl font-bold text-stone-800">{formatNumber(plot.area_size, 2)} ไร่</p>
        </div>
      </div>
    </div>
  );
}
