import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { getCompanies } from "@/lib/queries";

export const revalidate = 300;

export default async function HomePage() {
  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">
          Financial statements sourced from Codal, standardized for comparison. {companies.length} companies tracked.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/company/${encodeURIComponent(company.symbol)}`}
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="text-lg font-medium text-slate-900" dir="rtl">
                {company.symbol}
              </div>
              {company.industry && <div className="mt-1 text-sm text-slate-500">{company.industry}</div>}
            </Link>
          ))}
        </div>

        {companies.length === 0 && (
          <p className="mt-8 text-sm text-slate-500">
            No companies ingested yet. Run the ingestion pipeline in the financial_statements repo.
          </p>
        )}
      </main>
    </div>
  );
}
