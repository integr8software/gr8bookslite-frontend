"use client";

import {
	CheckCircle2,
	CirclePause,
	Package,
	Plus,
	Warehouse,
} from "lucide-react";
import { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseListPage";
import {
	WarehouseExportColumns,
	WarehouseStatusOptions,
} from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseTable } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseTable";
import { WarehouseDrawer } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseDrawer";
import { useState } from "react";
import type { DrawerState } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export function WarehouseListPage() {
	const page = useWarehouseListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.branchFilter !== "All" ||
		page.statusFilter !== "Active";
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Warehouse Management"
				description="Maintain warehouse records, branch access, storage locations, stock visibility, and movement history."
				eyebrow={
					<>
						<Warehouse className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory maintenance
					</>
				}
				actions={
					<button
						type="button"
						onClick={() => setDrawerState({ mode: "add" })}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Warehouse
					</button>
				}
			/>

			<ModuleStatisticCards
				isLoading={page.isLoading}
				className="xl:grid-cols-4"
				items={[
					{
						helper: "All warehouse records",
						icon: Warehouse,
						label: "Total Warehouses",
						value: page.warehouses.length,
					},
					{
						helper: "Available locations",
						icon: CheckCircle2,
						label: "Active Warehouses",
						tone: "emerald",
						value: page.warehouses.filter(
							(warehouse) => warehouse.status === "Active",
						).length,
					},
					{
						helper: "Currently inactive",
						icon: CirclePause,
						label: "Inactive Warehouses",
						tone: "amber",
						value: page.warehouses.filter(
							(warehouse) => warehouse.status === "Inactive",
						).length,
					},
					{
						helper: "Assigned stock lines",
						icon: Package,
						label: "Tracked Items",
						tone: "violet",
						value: page.warehouses.reduce(
							(total, warehouse) =>
								total + warehouse.items.length,
							0,
						),
					},
				]}
			/>

			<WarehouseTable
				isLoading={page.isLoading}
				lastSyncedAt={page.lastSyncedAt}
				setPendingDeleteWarehouse={page.setPendingDeleteWarehouse}
				onEditWarehouse={(warehouse) => setDrawerState({ mode: "edit", warehouse })}
				table={page.table}
				toolbar={
					<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
						<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)]">
							<ModuleTableSearch
								label="Search warehouses"
								value={page.query}
								onChange={page.handleQueryChange}
								placeholder="Search by code, warehouse, branch, manager, or status"
							/>
							<ModuleTableFilterSelect
								label="Branch"
								value={page.branchFilter}
								options={[
									{ label: "All", value: "All" },
									...page.branchFilterOptions.map((branch) => ({
										label: branch,
										value: branch,
									})),
								]}
								onChange={page.setBranchFilter}
							/>
							<ModuleTableFilterSelect
								label="Status"
								value={page.statusFilter}
								options={[
									{ label: "All", value: "All" },
									...WarehouseStatusOptions.map((status) => ({
										label: status,
										value: status,
									})),
								]}
								onChange={page.setStatusFilter}
							/>
						</div>
						<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
							<ModuleTableColumnVisibilityButton table={page.table} />
							<ModuleTableExportButton
								allRows={page.tableWarehouses}
								columns={WarehouseExportColumns}
								fileName="warehouses"
								filteredRows={page.filteredWarehouses}
								isFiltered={hasActiveFilters}
								table={page.table}
								title="Warehouses"
							/>
							<ModuleTableResetButton
								className="px-2"
								isRefreshing={page.isRefreshing}
								onClick={
									hasActiveFilters ? page.resetFilters : page.refreshWarehouses
								}
							>
								<span className="sr-only">
									{hasActiveFilters ? "Reset" : "Refresh"}
								</span>
							</ModuleTableResetButton>
						</div>
					</ModuleTableToolbar>
				}
			/>
			<WarehouseDrawer isOpen={Boolean(drawerState)} mode={drawerState?.mode ?? "add"} onClose={() => setDrawerState(null)} warehouse={drawerState?.warehouse} />

			<AppDialog
				isOpen={Boolean(page.pendingDeleteWarehouse)}
				isPending={page.isMutating}
				title="Set warehouse inactive?"
				description={`${page.pendingDeleteWarehouse?.name ?? "The selected warehouse"} will remain in history and references, but will no longer be active for normal selection.`}
				confirmLabel="Set Inactive"
				tone="deactivate"
				onCancel={() => page.setPendingDeleteWarehouse(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
