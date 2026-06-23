"use client";

import { Search } from "lucide-react";
import { BankMasterfileTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import { useBankMasterfileTable } from "@/app/src/hooks/modules/maintenance/financial-management/bank-masterfile/useBankMasterfileTable";
import type { BankMasterfilePermissions } from "@/app/src/services/modules/maintenance/financial-management/bank-masterfile/BankMasterfileApi";
import type {
	BankMasterfile,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/financial-management/bank-masterfile/BankMasterfileTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { BankMasterfileTableFilters } from "@/app/src/ui/modules/maintenance/financial-management/bank-masterfile/BankMasterfileTableFilters";
import { BankMasterfileTableRow } from "@/app/src/ui/modules/maintenance/financial-management/bank-masterfile/BankMasterfileTableRow";

type BankMasterfileTableProps = {
	banks: BankMasterfile[];
	filteredBanks: BankMasterfile[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	permissions: BankMasterfilePermissions;
	query: string;
	statusFilter: "" | BankMasterfileStatus;
	onEditBank: (bank: BankMasterfile) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: "" | BankMasterfileStatus) => void;
	onToggleStatus: (bank: BankMasterfile) => void;
	onViewBank: (bank: BankMasterfile) => void;
};

export function BankMasterfileTable({
	banks,
	filteredBanks,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	onEditBank,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onViewBank,
}: BankMasterfileTableProps) {
	const table = useBankMasterfileTable(filteredBanks);
	const tableMinWidthClassName = getTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a bank account to start managing Cash in Bank chart accounts."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Bank Records Found"
				isLoading={isLoading}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={BankMasterfileTablePaginationStorageKey}
				table={table}
				toolbar={
					<BankMasterfileTableFilters
						exportAllRows={banks}
						exportFilteredRows={filteredBanks}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<BankMasterfileTableRow
						key={row.id}
						row={row}
						permissions={permissions}
						onEditBank={onEditBank}
						onToggleStatus={onToggleStatus}
						onViewBank={onViewBank}
					/>
				)}
			/>
		</div>
	);
}

function getTableMinWidthClassName(visibleColumnCount: number) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}