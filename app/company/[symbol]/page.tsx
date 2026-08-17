import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { StatementTable } from "@/components/site/statement-table";
import { getCompanyBySymbol, getStandardStatements } from "@/lib/queries";
import { STATEMENT_ROW_ORDER, STATEMENT_TYPE_LABELS } from "@/lib/standardLabels";
import type { StatementType } from "@/lib/queries";

export const revalidate = 300;

const SECTIONS: StatementType[] = ["income_statement", "balance_sheet", "cash_flow"];

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol);
  const company = await getCompanyBySymbol(symbol);
  if (!company) notFound();

  const statements = await getStandardStatements(company.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">{company.symbol}</h1>
        {company.industry && <p className="mt-1 text-sm text-slate-500">{company.industry}</p>}

        <div className="mt-8 space-y-10">
          {SECTIONS.map((statementType) => (
            <section key={statementType} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                {STATEMENT_TYPE_LABELS[statementType]}
              </h2>
              <StatementTable
                rowOrder={STATEMENT_ROW_ORDER[statementType]}
                periods={statements[statementType]}
              />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
