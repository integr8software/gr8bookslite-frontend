"use client";

import Link from "next/link";
import { CheckCircle2, CirclePause, Layers, Package, Plus } from "lucide-react";
import {
	ItemsHref,
	ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import { useItemsListPage } from "@/app/src/hooks/modules/maintenance/items/useItemsListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemsTable } from "@/app/src/ui/modules/maintenance/items/ItemsTable";

export function ItemsListPage() {
	const page = useItemsListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Items"
				description="Maintain products, services, assets, suppliers, categories, inventory setup, and pricing."
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

			<ModuleStatisticCards
				items={[
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
						helper: "Items tracked in inventory",
						icon: Layers,
						label: "Tracked Items",
						tone: "violet",
						value: page.items.filter((item) => item.trackInventory)
							.length,
					},
				]}
			/>

			<ItemsTable
				isLoading={page.isLoading}
				lastSyncedAt={page.lastSyncedAt}
				setPendingStatusItem={page.setPendingStatusItem}
				table={page.table}
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search items"
							value={page.query}
							onChange={page.handleQueryChange}
							placeholder="Search by item, code, category, model, or status"
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
				isOpen={Boolean(page.pendingStatusItem)}
				isPending={page.isMutating}
				title={
					page.pendingStatusItem?.status === "Active"
						? "Set item inactive?"
						: "Reactivate item?"
				}
				description={
					page.pendingStatusItem?.status === "Active"
						? `${page.pendingStatusItem.name} will remain in history and references, but will no longer be active for normal selection.`
						: `${page.pendingStatusItem?.name ?? "This item"} will be available for selection again.`
				}
				confirmLabel={
					page.pendingStatusItem?.status === "Active"
						? "Set Inactive"
						: "Reactivate"
				}
				tone={
					page.pendingStatusItem?.status === "Active"
						? "deactivate"
						: "activate"
				}
				onCancel={() => page.setPendingStatusItem(null)}
				onConfirm={page.handleConfirmStatusChange}
			/>
		</section>
	);
}
