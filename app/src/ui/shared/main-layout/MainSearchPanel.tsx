import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import type { MainSearchItem } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";

type MainSearchPanelProps = {
  query: string;
  results: MainSearchItem[];
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onQueryChange: (value: string) => void;
};

export function MainSearchPanel({
  query,
  results,
  className,
  inputRef,
  onClose,
  onQueryChange,
}: MainSearchPanelProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const selectedResultIndex = results.length
    ? Math.min(selectedIndex, results.length - 1)
    : 0;
  const selectedResult = results[selectedResultIndex];

  useEffect(() => {
    resultRefs.current[selectedResultIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [selectedResultIndex]);

  function openSelectedResult() {
    if (!selectedResult) {
      return;
    }

    router.push(selectedResult.href);
    onClose();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!results.length) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(
        (current) => (current - 1 + results.length) % results.length,
      );
      return;
    }

    if (event.key === "Enter" && selectedResult) {
      event.preventDefault();
      openSelectedResult();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <div
      className={joinClasses(
        "z-50 overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.18)]",
        className,
      )}
    >
      <form
        className="flex items-center gap-3 border-b border-darknavy/10 px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          openSelectedResult();
        }}
      >
        <Search className="h-4 w-4 shrink-0 text-darknavy/45" aria-hidden="true" />
        <input
          autoFocus
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setSelectedIndex(0);
            onQueryChange(event.target.value);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search modules, reports, transactions..."
          role="combobox"
          aria-expanded="true"
          aria-controls="main-search-results"
          aria-activedescendant={
            selectedResult
              ? `main-search-result-${selectedResult.key}`
              : undefined
          }
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
      </form>

      <div
        id="main-search-results"
        role="listbox"
        className="max-h-84 overflow-y-auto p-2"
      >
        {results.length ? (
          results.map((result, index) => {
            const isSelected = index === selectedResultIndex;

            return (
              <Link
                key={result.key}
                id={`main-search-result-${result.key}`}
                ref={(element) => {
                  resultRefs.current[index] = element;
                }}
                href={result.href}
                role="option"
                aria-selected={isSelected}
                onClick={onClose}
                onFocus={() => setSelectedIndex(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={joinClasses(
                  "block rounded-md px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
                  isSelected ? "bg-skyblue/10" : "hover:bg-skyblue/10",
                )}
              >
                <span className="block truncate text-sm font-semibold text-darknavy">
                  {result.label}
                </span>
                <span className="mt-1 block truncate text-xs text-darknavy/55">
                  {result.trail.join(" / ")}
                </span>
              </Link>
            );
          })
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
