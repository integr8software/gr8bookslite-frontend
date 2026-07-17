"use client";

import { useCallback, useState } from "react";
import { useResponsibilityCenterListPage } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenterListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type { ResponsibilityCenterDrawerState } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ResponsibilityCenterHeader } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterHeader";
import { ResponsibilityCenterStatisticCards } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterStatisticCards";
import { ResponsibilityCenterTable } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTable";

export function ResponsibilityCenterListPage() {
	const page = useResponsibilityCenterListPage();
	const [drawerState, setDrawerState] =
		useState<ResponsibilityCenterDrawerState>(null);
	const closeDrawer = useCallback(() => setDrawerState(null), []);

	useMaintenanceAddDrawerSpotlight(
		() => {
			if (page.permissions.canCreate) {
				setDrawerState({ mode: "add" });
			}
		},
		closeDrawer,
	);

	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.categoryFilter !== "All" ||
		page.financialTypeFilter !== "All" ||
		page.statusFilter !== "Active";

	return (
		<section className="grid gap-5">
			<ResponsibilityCenterHeader
				onAdd={() => setDrawerState({ mode: "add" })}
				permissions={page.permissions}
			/>
			<ResponsibilityCenterStatisticCards
				statistics={page.statistics}
				isLoading={page.isLoading}
			/>
			<ResponsibilityCenterTable
				categoryFilter={page.categoryFilter}
				centers={page.centers}
				expandedTreeIds={page.expandedTreeIds}
				filteredCenters={page.filteredCenters}
				financialTypeFilter={page.financialTypeFilter}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				permissions={page.permissions}
				query={page.query}
				statusFilter={page.statusFilter}
				tablePreferences={page.tablePreferences}
				treeTable={page.treeTable}
				viewMode={page.viewMode}
				onCategoryFilterChange={page.setCategoryFilter}
				onEditCenter={(center) => setDrawerState({ center, mode: "edit" })}
				onFinancialTypeFilterChange={page.setFinancialTypeFilter}
				onQueryChange={page.setQuery}
				onRefresh={page.refreshCenters}
				onStatusFilterChange={page.setStatusFilter}
				onToggleStatus={page.setPendingStatusCenter}
				onToggleTreeNode={page.toggleTreeNode}
				onViewCenter={(center) => setDrawerState({ center, mode: "view" })}
				onViewModeChange={page.setViewMode}
			/>
			<ResponsibilityCenterDrawer
				center={drawerState?.center}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={closeDrawer}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingStatusCenter)}
				isPending={page.isMutating}
				title={
					page.pendingStatusCenter?.status === "Active"
						? "Deactivate responsibility center?"
						: "Activate responsibility center?"
				}
				description={
					page.pendingStatusCenter?.status === "Active"
						? `${page.pendingStatusCenter.name} will remain available in history, but will no longer be active for normal selection.`
						: `${page.pendingStatusCenter?.name ?? "This responsibility center"} will be available for normal selection again.`
				}
				confirmLabel={
					page.pendingStatusCenter?.status === "Active"
						? "Deactivate"
						: "Activate"
				}
				tone={
					page.pendingStatusCenter?.status === "Active"
						? "deactivate"
						: "activate"
				}
				onCancel={() => page.setPendingStatusCenter(null)}
				onConfirm={page.confirmCenterStatusChange}
			/>
		</section>
	);
}
