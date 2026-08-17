import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          کدال‌استاکس
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="transition hover:text-slate-900">
            شرکت‌ها
          </Link>
          <Link href="/compare" className="transition hover:text-slate-900">
            مقایسه
          </Link>
        </nav>
      </div>
    </header>
  );
}
