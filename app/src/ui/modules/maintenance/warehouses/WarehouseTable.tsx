"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { WarehouseTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import type { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouseListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { WarehouseTableRow } from "@/app/src/ui/modules/maintenance/warehouses/WarehouseTableRow";

type WarehouseTableProps = Pick<
	ReturnType<typeof useWarehouseListPage>,
	"isLoading" | "lastSyncedAt" | "setPendingDeleteWarehouse" | "table"
> & {
	toolbar?: ReactNode;
	onEditWarehouse: (warehouse: ReturnType<typeof useWarehouseListPage>["warehouses"][number]) => void;
};

export function WarehouseTable({
	isLoading,
	lastSyncedAt,
	setPendingDeleteWarehouse,
	table,
	toolbar,
	onEditWarehouse,
}: WarehouseTableProps) {
	return (
		<ModuleTable
			emptyDescription="Add a warehouse to start tracking access and item counts."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No warehouses found"
			isLoading={isLoading}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[92rem]"
			paginationStorageKey={WarehouseTablePaginationStorageKey}
			table={table}
			tableTitle="Warehouses"
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<WarehouseTableRow
					key={id}
					warehouse={original}
					onDeleteWarehouse={setPendingDeleteWarehouse}
					onEditWarehouse={onEditWarehouse}
				/>
			)}
		/>
	);
}
