"use client";

import {
	Ban,
	CheckCircle2,
	GitBranch,
	Layers3,
	Plus,
	Settings2,
	Tags,
	XCircle,
} from "lucide-react";
import { useItemCategoryPage } from "@/app/src/hooks/modules/maintenance/item-category/useItemCategoryPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	type ModuleStatisticCardItem,
	ModuleStatisticCards,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ItemCategoryDrawer } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryDrawer";
import { ItemCategoryTable } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryTable";
import { ItemCategoryConfigDescription } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryText";

export function ItemCategoryListPage() {
	const page = useItemCategoryPage();
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.accountingFilter !== "" ||
		page.statusFilter !== "Active";
	const metrics: ModuleStatisticCardItem[] = [
		{
			helper: "All parent and child category records",
			icon: Tags,
			label: "All Categories",
			value: page.metrics.totalCount,
		},
		{
			helper: "Available for selection",
			icon: CheckCircle2,
			label: "Active",
			tone: "emerald",
			value: page.metrics.activeCount,
		},
		{
			helper: "Unavailable for selection",
			icon: XCircle,
			label: "Inactive",
			tone: "slate",
			value: page.metrics.inactiveCount,
		},
		{
			helper: "Auto-created item accounts",
			icon: Settings2,
			label: "Configured",
			tone: "blue",
			value: page.metrics.configuredCount,
		},
		{
			helper: "Using parent accounting setup",
			icon: GitBranch,
			label: "Inherited",
			tone: "cyan",
			value: page.metrics.inheritedCount,
		},
		{
			helper: "Cannot add child categories",
			icon: Ban,
			label: "Subcategories Locked",
			tone: "amber",
			value: page.metrics.subcategoryLockedCount,
		},
	];

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Item Category"
				description={ItemCategoryConfigDescription}
				eyebrow={
					<>
						<Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
						Item setup
					</>
				}
				actions={
					page.permissions.canCreate ? (
						<button
							type="button"
							onClick={() => page.setDrawerState({ mode: "add" })}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Category
						</button>
					) : null
				}
			/>
			<ModuleStatisticCards items={metrics} className="xl:grid-cols-6" />

			<ItemCategoryTable
				accountingFilter={page.accountingFilter}
				allRows={page.allRows}
				expandedIds={page.expandedIds}
				filteredRows={page.filteredRows}
				hasActiveFilters={hasActiveFilters}
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				permissions={page.permissions}
				query={page.query}
				statusFilter={page.statusFilter}
				onAccountingFilterChange={page.handleAccountingFilterChange}
				onEditRecord={(row) => page.setDrawerState({ mode: "edit", row })}
				onQueryChange={page.handleQueryChange}
				onRefresh={page.refreshCategories}
				onStatusChange={page.setPendingStatusRow}
				onStatusFilterChange={page.handleStatusFilterChange}
				onToggleExpanded={page.toggleExpanded}
				onViewRecord={(row) => page.setDrawerState({ mode: "view", row })}
			/>
			<ItemCategoryDrawer
				drawerState={page.drawerState}
				onClose={() => page.setDrawerState(null)}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingStatusRow)}
				isPending={page.isMutating}
				title={
					page.pendingStatusRow?.record.status === "Active"
						? "Set category inactive?"
						: "Reactivate category?"
				}
				description={
					page.pendingStatusRow?.record.status === "Active"
						? `${page.pendingStatusRow.record.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusRow?.record.name ?? "This category"} will be available for selection again.`
				}
				confirmLabel={
					page.pendingStatusRow?.record.status === "Active"
						? "Set Inactive"
						: "Reactivate"
				}
				tone={
					page.pendingStatusRow?.record.status === "Active"
						? "deactivate"
						: "activate"
				}
				onCancel={() => page.setPendingStatusRow(null)}
				onConfirm={page.handleConfirmStatusChange}
			/>
		</section>
	);
}
