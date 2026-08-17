import { formatAmount, formatPeriodLabel } from "@/lib/format";
import { STANDARD_LABELS, SUBTOTAL_KEYS } from "@/lib/standardLabels";
import type { StatementPeriod } from "@/lib/queries";

export function StatementTable({
  rowOrder,
  periods,
  maxPeriods = 5,
}: {
  rowOrder: readonly string[];
  periods: StatementPeriod[];
  maxPeriods?: number;
}) {
  const shown = periods.slice(0, maxPeriods);

  if (shown.length === 0) {
    return <p className="text-sm text-slate-500">No data available yet.</p>;
  }

  const visibleRows = rowOrder.filter((key) => shown.some((p) => p.values[key] !== undefined));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="sticky left-0 bg-white py-2 pr-4 text-left font-medium text-slate-500">
              (in reported currency units)
            </th>
            {shown.map((p) => (
              <th key={p.periodEndDate} className="whitespace-nowrap py-2 pl-4 text-right font-medium text-slate-500">
                {formatPeriodLabel(p.periodEndDate)}
                {!p.audited && <span className="ml-1 text-amber-600">*</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((key) => {
            const isSubtotal = SUBTOTAL_KEYS.has(key);
            return (
              <tr
                key={key}
                className={
                  isSubtotal
                    ? "border-t border-slate-300 font-semibold text-slate-900"
                    : "border-t border-slate-100 text-slate-700"
                }
              >
                <td className="sticky left-0 bg-white py-2 pr-4">{STANDARD_LABELS[key] ?? key}</td>
                {shown.map((p) => (
                  <td key={p.periodEndDate} className="whitespace-nowrap py-2 pl-4 text-right tabular-nums">
                    {formatAmount(p.values[key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400">* unaudited</p>
    </div>
  );
}
