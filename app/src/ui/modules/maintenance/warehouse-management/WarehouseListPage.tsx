"use client";

import {
	CheckCircle2,
	CirclePause,
	Package,
	Plus,
	Warehouse,
} from "lucide-react";
import { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseListPage";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseTable } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseTable";
import { WarehouseDrawer } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseDrawer";
import { useState } from "react";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

type DrawerState = { mode: "add" | "edit"; warehouse?: WarehouseRecord } | null;

export function WarehouseListPage() {
	const page = useWarehouseListPage();
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
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

			<ModuleMetrics
				metrics={[
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
				setPendingDeleteWarehouse={page.setPendingDeleteWarehouse}
				onEditWarehouse={(warehouse) => setDrawerState({ mode: "edit", warehouse })}
				table={page.table}
				toolbar={
					<ModuleTableToolbar>
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
							label="Warehouse Type"
							value={page.typeFilter}
							options={[
								{ label: "All", value: "All" },
								...page.typeFilterOptions.map((type) => ({
									label: type,
									value: type,
								})),
							]}
							onChange={page.setTypeFilter}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
							]}
							onChange={page.setStatusFilter}
						/>
						<ModuleTableResetButton onClick={page.resetFilters}>
							Reset
						</ModuleTableResetButton>
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
				tone="danger"
				onCancel={() => page.setPendingDeleteWarehouse(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
