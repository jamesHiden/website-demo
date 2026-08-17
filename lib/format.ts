import { toJalaali } from "jalaali-js";

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function formatAmount(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "—";
  const negative = value < 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return negative ? `(${formatted})` : formatted;
}

/** Iranian financial periods are defined on the Persian (Jalali) calendar;
 * show dates that way even though they're stored as Gregorian in the DB. */
export function formatPeriodLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const j = toJalaali(year, month, day);
  return `${j.jd} ${PERSIAN_MONTHS[j.jm - 1]} ${j.jy}`;
}
