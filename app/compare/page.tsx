import { SiteHeader } from "@/components/site/site-header";
import { formatAmount, formatPeriodLabel } from "@/lib/format";
import { getCompanies, getCompanyBySymbol, getStandardStatements } from "@/lib/queries";
import { STANDARD_LABELS_FA, STATEMENT_ROW_ORDER, STATEMENT_TYPE_LABELS, SUBTOTAL_KEYS } from "@/lib/standardLabels";
import type { StatementType } from "@/lib/queries";

export const revalidate = 300;

const SECTIONS: StatementType[] = ["income_statement", "balance_sheet", "cash_flow"];

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ symbols?: string | string[]; type?: string }>;
}) {
  const params = await searchParams;
  const selectedSymbols = asArray(params.symbols);
  const statementType: StatementType = SECTIONS.includes(params.type as StatementType)
    ? (params.type as StatementType)
    : "income_statement";

  const companies = await getCompanies();

  const selectedCompanies = await Promise.all(
    selectedSymbols.map(async (symbol) => {
      const company = await getCompanyBySymbol(symbol);
      if (!company) return null;
      const statements = await getStandardStatements(company.id);
      return { company, latestPeriod: statements[statementType][0] };
    })
  );
  const rows = selectedCompanies.filter((c): c is NonNullable<typeof c> => c !== null);

  const rowOrder = STATEMENT_ROW_ORDER[statementType];
  const visibleKeys = rowOrder.filter((key) => rows.some((r) => r.latestPeriod?.values[key] !== undefined));

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">مقایسه شرکت‌ها</h1>
        <p className="mt-1 text-sm text-slate-500">
          آخرین دوره‌ی گزارش‌شده‌ی هر شرکت، به‌صورت استاندارد و کنار هم.
        </p>

        <form method="get" className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-sm font-semibold text-slate-700">نوع صورت مالی:</span>
            {SECTIONS.map((type) => (
              <label key={type} className="flex items-center gap-1.5 text-sm text-slate-600">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  defaultChecked={type === statementType}
                  className="accent-slate-900"
                />
                {STATEMENT_TYPE_LABELS[type]}
              </label>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {companies.map((company) => (
              <label key={company.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="symbols"
                  value={company.symbol}
                  defaultChecked={selectedSymbols.includes(company.symbol)}
                  className="accent-slate-900"
                />
                <span>{company.symbol}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            مقایسه کن
          </button>
        </form>

        {rows.length > 0 && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {STATEMENT_TYPE_LABELS[statementType]}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="sticky right-0 bg-white py-2 pl-4 text-right font-medium text-slate-500">
                      سرفصل
                    </th>
                    {rows.map(({ company, latestPeriod }) => (
                      <th key={company.id} className="whitespace-nowrap py-2 pr-4 text-right font-medium text-slate-500">
                        {company.symbol}
                        <div className="text-xs font-normal text-slate-400">
                          {latestPeriod ? formatPeriodLabel(latestPeriod.periodEndDate) : "بدون داده"}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleKeys.map((key) => {
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
                        <td className="sticky right-0 bg-white py-2 pl-4 text-right">
                          {STANDARD_LABELS_FA[key] ?? key}
                        </td>
                        {rows.map(({ company, latestPeriod }) => (
                          <td key={company.id} className="whitespace-nowrap py-2 pr-4 text-right tabular-nums" dir="ltr">
                            {formatAmount(latestPeriod?.values[key])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
