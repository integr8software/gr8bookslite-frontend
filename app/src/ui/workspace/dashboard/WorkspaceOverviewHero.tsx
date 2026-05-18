import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

type WorkspaceOverviewHeroProps = {
  isEditingLayout: boolean;
  onCustomize: () => void;
  onToggleLayoutEditing: () => void;
};

export function WorkspaceOverviewHero({
  isEditingLayout,
  onCustomize,
  onToggleLayoutEditing,
}: WorkspaceOverviewHeroProps) {
  return (
    <section
      data-spotlight-id="workspace-dashboard-hero"
      className="overflow-hidden rounded-[1.75rem] border border-darknavy/10 bg-white shadow-[0_20px_60px_rgba(33,39,56,0.08)]"
    >
      <div className="relative px-6 py-7 sm:px-8">
        <div
          className="absolute inset-x-0 top-0 h-36"
          style={{
            backgroundImage:
              "radial-gradient(circle at top left, rgb(var(--skyblue-rgb) / 0.22), transparent 54%), radial-gradient(circle at top right, rgb(var(--skyblue-rgb) / 0.08), transparent 46%), linear-gradient(180deg, rgb(var(--background-rgb) / 0.72), rgb(var(--background-rgb) / 0.08))",
          }}
        />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-darknavy sm:text-[2.2rem]">
              Welcome back, John.
            </h2>
            <p className="mt-2 text-sm text-darknavy/55 sm:text-base">
              Here&apos;s what&apos;s happening across your companies.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCustomize}
              data-spotlight-id="workspace-dashboard-customize"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Customize
            </button>
            <button
              type="button"
              onClick={onToggleLayoutEditing}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 ${
                isEditingLayout
                  ? "bg-skyblue text-darknavy shadow-[0_18px_35px_rgba(87,196,229,0.28)] hover:bg-skyblue/90"
                  : "border border-darknavy/10 bg-white text-darknavy hover:border-skyblue/35 hover:bg-skyblue/10"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              {isEditingLayout ? "Done Layout" : "Edit Layout"}
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              May 20 - May 26, 2024
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-skyblue px-4 text-sm font-semibold text-darknavy shadow-[0_18px_35px_rgba(87,196,229,0.35)] transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create New
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
