"use client";

import { Search } from "lucide-react";
import { WarehouseStockInquiryPaginationStorageKey } from "@/app/src/constants/modules/maintenance/warehouse-stock-inquiry/WarehouseStockInquiryConstants";
import type { useWarehouseStockInquiryListPage } from "@/app/src/hooks/modules/maintenance/warehouse-stock-inquiry/useWarehouseStockInquiryListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseStockInquiryTableRow } from "@/app/src/ui/modules/maintenance/warehouse-stock-inquiry/WarehouseStockInquiryTableRow";

type WarehouseStockInquiryTableProps = {
	hasActiveFilters: boolean;
	page: ReturnType<typeof useWarehouseStockInquiryListPage>;
};

export function WarehouseStockInquiryTable({
	hasActiveFilters,
	page,
}: WarehouseStockInquiryTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="No stock rows match the current inquiry filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Warehouse Stock Found"
				isLoading={page.isLoading}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[112rem] table-fixed"
				paginationStorageKey={WarehouseStockInquiryPaginationStorageKey}
				table={page.table}
				tableTitle="Warehouse stock inquiry"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search warehouse stock"
							placeholder="Search warehouse stock"
							value={page.query}
							onChange={page.setQuery}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All", value: "All" },
								...page.statuses.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							onChange={page.setStatusFilter}
						/>
						<ModuleTableResetButton
							aria-label={hasActiveFilters ? "Reset filters" : "Refresh inquiry"}
							isRefreshing={page.isRefreshing}
							onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
						/>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WarehouseStockInquiryTableRow key={row.id} row={row} />
				)}
			/>
		</div>
	);
}
