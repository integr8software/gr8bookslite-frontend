"use client";

import {
	CheckCircle2,
	GitBranch,
	Layers3,
	Plus,
	RefreshCcw,
	Search,
	Tags,
} from "lucide-react";
import {
	ItemCategoryPaginationStorageKey,
	ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/item-category/ItemCategoryConstants";
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
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemCategoryDrawer } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryDrawer";
import { ItemCategoryTableRow } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryTableRow";
import { ItemCategoryConfigDescription } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryText";

const AccountingStatusOptions = [
	"Configured",
	"Inherited",
	"Override",
	"Not Set",
] as const;

export function ItemCategoryListPage() {
	const page = useItemCategoryPage();
	const metrics: ModuleStatisticCardItem[] = [
		{
			helper: "All parent and child category records",
			icon: Tags,
			label: "Records",
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
			helper: "Using parent accounting setup",
			icon: GitBranch,
			label: "Inherited",
			tone: "cyan",
			value: page.metrics.inheritedCount,
		},
		{
			helper: "Child setup overrides parent setup",
			icon: RefreshCcw,
			label: "Overrides",
			tone: "amber",
			value: page.metrics.overrideCount,
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
					<button
						type="button"
						onClick={() => page.setDrawerState({ mode: "add" })}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Category
					</button>
				}
			/>
			<ModuleStatisticCards items={metrics} className="xl:grid-cols-4" />

			<ModuleTable
				emptyDescription="Add a category to start grouping inventory, services, and item groups."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No categories found"
				isLoading={page.isLoading}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[74rem]"
				paginationStorageKey={ItemCategoryPaginationStorageKey}
				table={page.table}
				tableTitle="Item categories"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search item categories"
							value={page.query}
							onChange={page.handleQueryChange}
							placeholder="Search category, parent, status, or accounting setup"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "All" },
								...ItemStatusOptions.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							onChange={page.handleStatusFilterChange}
						/>
						<ModuleTableFilterSelect
							label="Accounting"
							value={page.accountingFilter}
							options={[
								{ label: "All", value: "All" },
								...AccountingStatusOptions.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							onChange={page.handleAccountingFilterChange}
						/>
						<ModuleTableResetButton onClick={page.resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<ItemCategoryTableRow
						key={id}
						expandedIds={page.expandedIds}
						row={original}
						onEditRecord={(row) =>
							page.setDrawerState({ mode: "edit", row })
						}
						onStatusChange={page.setPendingStatusRow}
						onToggleExpanded={page.toggleExpanded}
						onViewRecord={(row) =>
							page.setDrawerState({ mode: "view", row })
						}
					/>
				)}
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
