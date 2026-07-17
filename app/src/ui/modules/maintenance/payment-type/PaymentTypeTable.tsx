"use client";

import { Search } from "lucide-react";
import { PaymentTypeTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/payment-type/PaymentTypeConstants";
import { getPaymentTypeTableMinWidthClassName } from "@/app/src/data/modules/maintenance/payment-type/PaymentTypeData";
import { usePaymentTypeTable } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentTypeTable";
import type { PaymentTypeTableProps } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { PaymentTypeFilters } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeFilters";
import { PaymentTypeTableRow } from "@/app/src/ui/modules/maintenance/payment-type/PaymentTypeTableRow";

export function PaymentTypeTable({
	filteredPaymentTypes,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	paymentTypes,
	permissions,
	searchTerm,
	statusFilter,
	typeFilter,
	typeFilterOptions,
	onEdit,
	onRefresh,
	onReorder,
	onSearchTermChange,
	onStatusFilterChange,
	onToggleStatus,
	onTypeFilterChange,
	onView,
}: PaymentTypeTableProps) {
	const table = usePaymentTypeTable(filteredPaymentTypes);
	const tableMinWidthClassName = getPaymentTypeTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);
	const hasActiveFilters =
		searchTerm.trim().length > 0 || typeFilter !== "" || statusFilter !== "Active";

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a payment type to start managing payment methods for voucher workflows."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Payment Types Found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={PaymentTypeTablePaginationStorageKey}
				table={table}
				tableTitle="Payment types"
				toolbar={
					<PaymentTypeFilters
						exportAllRows={paymentTypes}
						exportFilteredRows={filteredPaymentTypes}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						searchTerm={searchTerm}
						statusFilter={statusFilter}
						table={table}
						typeFilter={typeFilter}
						typeFilterOptions={typeFilterOptions}
						onRefresh={onRefresh}
						onSearchTermChange={onSearchTermChange}
						onStatusFilterChange={onStatusFilterChange}
						onTypeFilterChange={onTypeFilterChange}
					/>
				}
				renderRow={(row) => (
					<PaymentTypeTableRow
						key={row.id}
						row={row}
						permissions={permissions}
						visiblePaymentTypeIds={filteredPaymentTypes.map(
							(paymentType) => paymentType.id,
						)}
						onEdit={onEdit}
						onReorder={onReorder}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				)}
			/>
		</div>
	);
}


