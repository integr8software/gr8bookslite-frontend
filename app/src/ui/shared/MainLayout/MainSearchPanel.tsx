import Link from "next/link";
import { Search, X } from "lucide-react";
import type { MainSearchItem } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";

type MainSearchPanelProps = {
  query: string;
  results: MainSearchItem[];
  className?: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
};

export function MainSearchPanel({
  query,
  results,
  className,
  onClose,
  onQueryChange,
}: MainSearchPanelProps) {
  return (
    <div
      className={joinClasses(
        "z-50 overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.18)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-darknavy/10 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-darknavy/45" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search modules, reports, transactions..."
          className="min-w-0 flex-1 bg-transparent text-sm text-darknavy outline-none placeholder:text-darknavy/40"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-8 w-8 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-84 overflow-y-auto p-2">
        {results.length ? (
          results.map((result) => (
            <Link
              key={result.key}
              href={result.href}
              onClick={onClose}
              className="block rounded-md px-3 py-2.5 transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <span className="block truncate text-sm font-semibold text-darknavy">
                {result.label}
              </span>
              <span className="mt-1 block truncate text-xs text-darknavy/55">
                {result.trail.join(" / ")}
              </span>
            </Link>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-sm text-darknavy/55">
            No records found.
          </div>
        )}
      </div>
    </div>
  );
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
