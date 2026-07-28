"use client";

import { Search } from "lucide-react";
import type { DeliveryVehicleModulePageState, DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
	type ModuleTableExportColumn,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type DeliveryVehicleModuleTableProps = {
	hasActiveFilters: boolean;
	href: string;
	page: DeliveryVehicleModulePageState;
	paginationStorageKey: string;
};

export function DeliveryVehicleModuleTable({
	hasActiveFilters,
	href,
	page,
	paginationStorageKey,
}: DeliveryVehicleModuleTableProps) {
	const exportColumns = createExportColumns(page);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription={`Add a ${page.config.noun} record to start managing delivery vehicle operations.`}
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle={`No ${page.config.title} Found`}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[92rem] table-fixed"
				paginationStorageKey={paginationStorageKey}
				table={page.table}
				tableTitle={page.config.title}
				toolbar={
					<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none lg:!grid-cols-[minmax(0,1fr)_auto]">
						<div className="grid min-w-0 gap-2 md:grid-cols-3">
							<ModuleTableSearch
								label={`Search ${page.config.title}`}
								placeholder={page.config.searchPlaceholder}
								value={page.query}
								onChange={page.setQuery}
							/>
							<ModuleTableFilterSelect
								label="Status"
								value={page.statusFilter}
								options={[
									{ label: "All Statuses", value: "All" },
									...page.config.statuses.map((status) => ({ label: status, value: status })),
								]}
								onChange={page.setStatusFilter}
							/>
							{page.config.categories ? (
								<ModuleTableFilterSelect
									label="Workspace"
									value={page.categoryFilter}
									options={[
										{ label: "All Workspaces", value: "All" },
										...page.config.categories.map((category) => ({
											label: category,
											value: category,
										})),
									]}
									onChange={page.setCategoryFilter}
								/>
							) : null}
						</div>
						<div className="grid grid-cols-3 gap-2 lg:w-44">
							<ModuleTableColumnVisibilityButton table={page.table} />
							<ModuleTableExportButton
								allRows={page.records}
								columns={exportColumns}
								fileName={page.config.key}
								filteredRows={page.filteredRecords}
								isFiltered={hasActiveFilters}
								table={page.table}
								title={page.config.title}
							/>
							<ModuleTableResetButton
								aria-label={hasActiveFilters ? "Reset filters" : "Refresh records"}
								isRefreshing={page.isRefreshing}
								onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
							/>
						</div>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<tr key={row.id} className={joinClasses("module-table-row", row.original.alert && "bg-amber-50/30")}>
						{row.getVisibleCells().map((cell) => (
							<td
								key={cell.id}
								className={`px-4 py-3.5 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
							>
								{cell.column.id === "status" ? (
									<ModuleStatusBadge status={row.original.status} />
								) : cell.column.id === "actions" ? (
									<ModuleTableActions className="w-full !justify-center">
										<ModuleTableActionLink
											href={`${href}/view/${row.original.id}`}
											variant="view"
											label={`View ${row.original.name}`}
										/>
										<ModuleTableActionLink
											href={`${href}/edit/${row.original.id}`}
											variant="edit"
											label={`Edit ${row.original.name}`}
										/>
									</ModuleTableActions>
								) : (
									String(cell.getValue() || "-")
								)}
							</td>
						))}
					</tr>
				)}
			/>
		</div>
	);
}

function createExportColumns(
	page: DeliveryVehicleModulePageState,
): ModuleTableExportColumn<DeliveryVehicleModuleRecord>[] {
	const fieldColumns = page.config.tableFieldKeys.map((fieldKey) => ({
		header: page.config.fields.find((field) => field.key === fieldKey)?.label ?? fieldKey,
		id: fieldKey,
		value: (record: DeliveryVehicleModuleRecord) => record.fields[fieldKey] ?? "",
	}));

	return [
		{ header: "Reference", id: "code", value: (record) => record.code },
		{ header: page.config.noun, id: "name", value: (record) => record.name },
		{ header: "Workspace", id: "category", value: (record) => record.category ?? "" },
		...fieldColumns,
		{ header: "Status", id: "status", value: (record) => record.status },
		{ header: "Alert", id: "alert", value: (record) => record.alert ?? "" },
	];
}
