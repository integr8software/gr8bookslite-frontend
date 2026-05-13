"use client";

import { getWorkspaceDashboardData } from "@/app/src/services/modules/dashboard/ErpDashboardService";
import {
	ApprovalQueuePanel,
	InfoPanel,
	WorkspaceCompaniesPanel,
	WorkspaceOverviewHero,
	WorkspacePerformanceTable,
	WorkspaceStatsGrid,
} from "./WorkspaceOverviewSections";

export function WorkspaceOverviewPage() {
	const data = getWorkspaceDashboardData();

	return (
		<div className="space-y-6">
			<WorkspaceOverviewHero />

			<div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
				<WorkspaceCompaniesPanel companies={data.companies} />

				<div className="space-y-6">
					<WorkspaceStatsGrid stats={data.stats} />

					<div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)]">
						<WorkspacePerformanceTable companies={data.companies} />

						<div className="space-y-6">
							<ApprovalQueuePanel items={data.approvalQueue} />
							<InfoPanel
								title="Recent Activity"
								items={data.recentActivity}
							/>
							<InfoPanel
								title="System Notifications"
								items={data.systemNotifications}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
