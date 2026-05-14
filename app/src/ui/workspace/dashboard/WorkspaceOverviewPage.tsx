import {
  WorkspaceApprovalQueue,
  WorkspaceCompanies,
  WorkspaceRecentActivity,
  WorkspaceSummaryCards,
  WorkspaceSystemNotifications,
} from "@/app/src/data/modules/dashboard/WorkspaceOverviewData";
import { WorkspaceOverviewCompaniesPanel } from "@/app/src/ui/workspace/dashboard/WorkspaceOverviewCompaniesPanel";
import { WorkspaceOverviewHero } from "@/app/src/ui/workspace/dashboard/WorkspaceOverviewHero";
import { WorkspaceOverviewPanels } from "@/app/src/ui/workspace/dashboard/WorkspaceOverviewPanels";
import { WorkspaceOverviewStatsGrid } from "@/app/src/ui/workspace/dashboard/WorkspaceOverviewStatsGrid";

export function WorkspaceOverviewPage() {
  const activeCompanies = WorkspaceCompanies.filter(
    (company) => company.status === "Active",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-376 flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <WorkspaceOverviewCompaniesPanel companies={WorkspaceCompanies} />

        <div className="flex flex-col gap-6">
          <WorkspaceOverviewHero />
          <WorkspaceOverviewStatsGrid
            activeCompanies={activeCompanies}
            cards={WorkspaceSummaryCards}
            totalCompanies={WorkspaceCompanies.length}
          />
        </div>
      </section>

      <WorkspaceOverviewPanels
        approvals={WorkspaceApprovalQueue}
        companies={WorkspaceCompanies}
        recentActivity={WorkspaceRecentActivity}
        systemNotifications={WorkspaceSystemNotifications}
      />
    </div>
  );
}
