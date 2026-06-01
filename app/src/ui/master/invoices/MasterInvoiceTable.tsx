"use client";

import { ReceiptText } from "lucide-react";
import {
	MasterInvoicePaginationStorageKey,
	MasterInvoicePaymentMethodOptions,
	MasterInvoiceStatusOptions,
} from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import type { useMasterInvoiceListPage } from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import type {
	MasterInvoicePaymentMethodFilter,
	MasterInvoiceStatusFilter,
} from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import type { MasterInvoiceRecord } from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MasterInvoiceTableRow } from "@/app/src/ui/master/invoices/MasterInvoiceTableRow";

type MasterInvoiceTableProps = Pick<
	ReturnType<typeof useMasterInvoiceListPage>,
	| "paymentMethodFilter"
	| "query"
	| "resetFilters"
	| "setPaymentMethodFilter"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
>;

export function MasterInvoiceTable({
	paymentMethodFilter,
	query,
	resetFilters,
	setPaymentMethodFilter,
	setQuery,
	setStatusFilter,
	statusFilter,
	table,
}: MasterInvoiceTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterInvoiceRecord>
				variant="embedded"
				emptyDescription="Try a different subscriber, invoice number, payment method, date, or status."
				emptyIcon={
					<ReceiptText className="h-5 w-5" aria-hidden="true" />
				}
				emptyTitle="No invoices found"
				minWidthClassName="min-w-[95rem]"
				paginationStorageKey={MasterInvoicePaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search invoices"
							value={query}
							onChange={setQuery}
							placeholder="Search subscribers, invoices, availed items, references"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={MasterInvoiceStatusOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setStatusFilter(
									value as MasterInvoiceStatusFilter,
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Payment"
							value={paymentMethodFilter}
							options={MasterInvoicePaymentMethodOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setPaymentMethodFilter(
									value as MasterInvoicePaymentMethodFilter,
								)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<MasterInvoiceTableRow key={row.id} record={row.original} />
				)}
			/>
		</div>
	);
}
