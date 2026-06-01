"use client";

import Link from "next/link";
import {
	CheckCircle2,
	CirclePause,
	Package,
	Plus,
	Warehouse,
} from "lucide-react";
import { WarehouseManagementHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseTable } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseTable";

export function WarehouseListPage() {
	const page = useWarehouseListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Warehouse Management"
				description="Maintain warehouses, branch availability, and access assignments by location."
				eyebrow={
					<>
						<Warehouse className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory maintenance
					</>
				}
				actions={
					<Link
						href={`${WarehouseManagementHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Warehouse
					</Link>
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
				table={page.table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
						<ModuleTableSearch
							label="Search warehouses"
							value={page.query}
							onChange={page.handleQueryChange}
							placeholder="Search by warehouse, branch, availability, manager, or status"
						/>
					</ModuleTableToolbar>
				}
			/>

			<AppDialog
				isOpen={Boolean(page.pendingDeleteWarehouse)}
				isPending={page.isMutating}
				title="Delete warehouse?"
				description={`This will remove ${page.pendingDeleteWarehouse?.name ?? "the selected warehouse"}.`}
				confirmLabel="Delete Warehouse"
				tone="danger"
				onCancel={() => page.setPendingDeleteWarehouse(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
