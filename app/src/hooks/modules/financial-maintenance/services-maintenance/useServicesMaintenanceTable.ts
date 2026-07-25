"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ServicesMaintenanceDefaultColumnOrder,
	ServicesMaintenanceDefaultColumnVisibility,
	ServicesMaintenanceDefaultSorting,
	ServicesMaintenanceTableColumns,
	ServicesMaintenanceTablePreferencesModuleKey,
	ServicesMaintenanceTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	ServicesMaintenance,
	ServicesMaintenanceTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

export function useServicesMaintenanceTable(services: ServicesMaintenance[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const {
		columnOrder,
		columnVisibility,
		sorting,
		setColumnOrder,
		setColumnVisibility,
		setSorting,
	} = useTablePreferences({
		defaultColumnOrder: ServicesMaintenanceDefaultColumnOrder,
		defaultColumnVisibility: ServicesMaintenanceDefaultColumnVisibility,
		defaultSorting: ServicesMaintenanceDefaultSorting,
		moduleKey: ServicesMaintenanceTablePreferencesModuleKey,
		storageKey: ServicesMaintenanceTablePreferencesStorageKey,
	});
	const columns = useMemo<ColumnDef<ServicesMaintenance>[]>(
		() =>
			ServicesMaintenanceTableColumns.map((column) => {
				const meta = { className: column.className, label: column.label };

				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta,
					};
				}

				return createServicesMaintenanceColumn(column.key, column.label, meta);
			}),
		[],
	);

	return useReactTable({
		data: services,
		columns,
		initialState: {
			columnOrder: ServicesMaintenanceDefaultColumnOrder,
			columnVisibility: ServicesMaintenanceDefaultColumnVisibility,
			sorting: ServicesMaintenanceDefaultSorting,
		},
		state: {
			columnOrder,
			columnVisibility,
			pagination,
			sorting,
		},
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
}

function createServicesMaintenanceColumn(
	key: ServicesMaintenanceTableColumnKey,
	header: string,
	meta: {
		className: string;
		label: string;
	},
): ColumnDef<ServicesMaintenance> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta,
	};
}
