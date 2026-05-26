import type { WorkspaceSummaryCard } from "@/app/src/data/modules/dashboard/WorkspaceOverviewData";

type WorkspaceOverviewStatsGridProps = {
  activeCompanies: number;
  cards: WorkspaceSummaryCard[];
  totalCompanies: number;
};

export function WorkspaceOverviewStatsGrid({
  activeCompanies,
  cards,
  totalCompanies,
}: WorkspaceOverviewStatsGridProps) {
  return (
    <section
      data-spotlight-id="workspace-dashboard-summary"
      className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const supportingText =
          card.title === "Total Companies"
            ? `${activeCompanies} active / ${totalCompanies - activeCompanies} inactive`
            : card.supportingText;

        return (
          <article
            key={card.title}
            className="rounded-3xl border border-darknavy/10 bg-white p-5 shadow-[0_18px_50px_rgba(33,39,56,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${summaryTone(card.tone)}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-6 text-sm font-medium text-darknavy/52">
              {card.title}
            </p>
            <p className="mt-2 text-[2rem] font-semibold tracking-tight text-darknavy">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-darknavy/55">{supportingText}</p>
            <button
              type="button"
              className="mt-5 text-sm font-semibold text-skyblue transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              {card.actionLabel}
            </button>
          </article>
        );
      })}
    </section>
  );
}

function summaryTone(tone: WorkspaceSummaryCard["tone"]) {
  switch (tone) {
    case "citron":
      return "bg-amber-100 text-amber-700";
    case "coral":
      return "bg-coralpink/18 text-coralpink";
    case "mint":
      return "bg-emerald-100 text-emerald-700";
    case "violet":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-skyblue/18 text-darknavy";
  }
}
