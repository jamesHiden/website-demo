export function formatAmount(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "—";
  const negative = value < 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return negative ? `(${formatted})` : formatted;
}

export function formatPeriodLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}
