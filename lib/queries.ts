import { prisma } from "./prisma";

export type StatementType = "balance_sheet" | "income_statement" | "cash_flow";

export type StatementPeriod = {
  periodEndDate: string; // ISO date
  audited: boolean;
  consolidated: boolean;
  values: Record<string, number>;
};

type FilingWithItems = {
  statement_type: string;
  period_end_date: Date;
  audited: boolean;
  amended: boolean;
  consolidated: boolean;
  standard_line_items: { standard_key: string; value: unknown }[];
};

/** Iranian filings can have several versions of the same period (unaudited,
 * audited, amended). Prefer audited, then amended (a correction), then
 * consolidated, over their alternatives. */
function pickBestFiling<T extends { audited: boolean; amended: boolean; consolidated: boolean }>(
  filings: T[]
): T {
  const score = (f: T) => (f.audited ? 4 : 0) + (f.amended ? 2 : 0) + (f.consolidated ? 1 : 0);
  return filings.reduce((best, f) => (score(f) > score(best) ? f : best));
}

export async function getCompanies() {
  return prisma.companies.findMany({ orderBy: { symbol: "asc" } });
}

export async function getCompanyBySymbol(symbol: string) {
  return prisma.companies.findUnique({ where: { symbol } });
}

/** All standardized statements for a company, grouped by type, one entry
 * per period (best available version), most recent period first. */
export async function getStandardStatements(
  companyId: number
): Promise<Record<StatementType, StatementPeriod[]>> {
  const filings = await prisma.filings.findMany({
    where: { company_id: companyId },
    include: { standard_line_items: true },
  });

  const groups = new Map<string, FilingWithItems[]>();
  for (const f of filings) {
    const key = `${f.statement_type}|${f.period_end_date.toISOString()}`;
    const arr = groups.get(key) ?? [];
    arr.push(f);
    groups.set(key, arr);
  }

  const result: Record<StatementType, StatementPeriod[]> = {
    balance_sheet: [],
    income_statement: [],
    cash_flow: [],
  };

  for (const group of groups.values()) {
    const best = pickBestFiling(group);
    const values: Record<string, number> = {};
    for (const item of best.standard_line_items) {
      values[item.standard_key] = Number(item.value);
    }
    result[best.statement_type as StatementType].push({
      periodEndDate: best.period_end_date.toISOString().slice(0, 10),
      audited: best.audited,
      consolidated: best.consolidated,
      values,
    });
  }

  for (const key of Object.keys(result) as StatementType[]) {
    result[key].sort((a, b) => (a.periodEndDate < b.periodEndDate ? 1 : -1));
  }

  return result;
}
