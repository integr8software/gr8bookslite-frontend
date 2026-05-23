"use client";

import Link from "next/link";
import { Plus, Search, Warehouse } from "lucide-react";
import { WarehouseManagementHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WarehouseTable } from "./WarehouseTable";

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

			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
				<label className="relative block">
					<span className="sr-only">Search warehouses</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
						aria-hidden="true"
					/>
					<input
						value={page.query}
						onChange={(event) => page.handleQueryChange(event.target.value)}
						placeholder="Search by warehouse, branch, availability, manager, or status"
						className="h-12 w-full rounded-lg border border-darknavy/10 bg-offwhite/65 pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15"
					/>
				</label>
			</div>

			<WarehouseTable
				isLoading={page.isLoading}
				setPendingDeleteWarehouse={page.setPendingDeleteWarehouse}
				table={page.table}
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
