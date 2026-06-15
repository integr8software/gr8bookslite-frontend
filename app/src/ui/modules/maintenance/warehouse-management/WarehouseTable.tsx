"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { WarehouseManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type { useWarehouseListPage } from "@/app/src/hooks/modules/maintenance/warehouse-management/useWarehouseListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { WarehouseTableRow } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseTableRow";

type WarehouseTableProps = Pick<
	ReturnType<typeof useWarehouseListPage>,
	"isLoading" | "setPendingDeleteWarehouse" | "table"
> & {
	toolbar?: ReactNode;
	onEditWarehouse: (warehouse: ReturnType<typeof useWarehouseListPage>["warehouses"][number]) => void;
};

export function WarehouseTable({
	isLoading,
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
			minWidthClassName="min-w-[106rem]"
			paginationStorageKey={WarehouseManagementTablePaginationStorageKey}
			table={table}
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
