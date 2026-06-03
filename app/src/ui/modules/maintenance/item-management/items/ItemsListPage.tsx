"use client";

import Link from "next/link";
import { CheckCircle2, CirclePause, Layers, Package, Plus } from "lucide-react";
import {
	ItemsHref,
	ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemsListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemsTable } from "@/app/src/ui/modules/maintenance/item-management/items/ItemsTable";

export function ItemsListPage() {
	const page = useItemsListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Items"
				description="Maintain item master records, classifications, and bundle component definitions."
				eyebrow={
					<>
						<Package className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<Link
						href={`${ItemsHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Item
					</Link>
				}
			/>

			<ModuleMetrics
				metrics={[
					{
						helper: "All item master records",
						icon: Package,
						label: "Total Items",
						value: page.items.length,
					},
					{
						helper: "Available for use",
						icon: CheckCircle2,
						label: "Active Items",
						tone: "emerald",
						value: page.items.filter(
							(item) => item.status === "Active",
						).length,
					},
					{
						helper: "Currently inactive",
						icon: CirclePause,
						label: "Inactive Items",
						tone: "amber",
						value: page.items.filter(
							(item) => item.status === "Inactive",
						).length,
					},
					{
						helper: "Items with bundle components",
						icon: Layers,
						label: "Bundle Items",
						tone: "violet",
						value: page.items.filter((item) => item.supportsBundle)
							.length,
					},
				]}
			/>

			<ItemsTable
				isLoading={page.isLoading}
				setPendingDeleteItem={page.setPendingDeleteItem}
				table={page.table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search items"
							value={page.query}
							onChange={page.handleQueryChange}
							placeholder="Search by item, code, category, type, or status"
						/>
						<ModuleTableFilterSelect
							label="Category"
							value={page.categoryFilter}
							options={[
								{ label: "All", value: "All" },
								...page.categoryFilterOptions.map(
									(category) => ({
										label: category,
										value: category,
									}),
								),
							]}
							onChange={page.setCategoryFilter}
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
							onChange={page.setStatusFilter}
						/>
						<ModuleTableResetButton onClick={page.resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
			/>

			<AppDialog
				isOpen={Boolean(page.pendingDeleteItem)}
				isPending={page.isMutating}
				title="Delete item?"
				description={`This will remove ${page.pendingDeleteItem?.name ?? "the selected item"}.`}
				confirmLabel="Delete Item"
				tone="danger"
				onCancel={() => page.setPendingDeleteItem(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
