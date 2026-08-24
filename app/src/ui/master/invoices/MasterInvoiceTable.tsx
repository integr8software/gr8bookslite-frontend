"use client";

import { ReceiptText } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import {
	MasterInvoicePaginationStorageKey,
	MasterInvoicePaymentMethodOptions,
	MasterInvoiceStatusOptions,
	MasterInvoiceTransactionTypeOptions,
} from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import type {
	MasterInvoicePaymentMethodFilter,
	MasterInvoiceRecord,
	MasterInvoiceStatusFilter,
	MasterInvoiceTransactionTypeFilter,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MasterInvoiceTableRow } from "@/app/src/ui/master/invoices/MasterInvoiceTableRow";

export type MasterInvoiceTableProps = {
	paymentMethodFilter: MasterInvoicePaymentMethodFilter;
	query: string;
	resetFilters: () => void;
	setPaymentMethodFilter: (method: MasterInvoicePaymentMethodFilter) => void;
	setQuery: (query: string) => void;
	setStatusFilter: (status: MasterInvoiceStatusFilter) => void;
	setTransactionTypeFilter: (type: MasterInvoiceTransactionTypeFilter) => void;
	statusFilter: MasterInvoiceStatusFilter;
	table: Table<MasterInvoiceRecord>;
	transactionTypeFilter: MasterInvoiceTransactionTypeFilter;
};


export function MasterInvoiceTable({
	paymentMethodFilter,
	query,
	resetFilters,
	setPaymentMethodFilter,
	setQuery,
	setStatusFilter,
	setTransactionTypeFilter,
	statusFilter,
	table,
	transactionTypeFilter,
}: MasterInvoiceTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterInvoiceRecord>
				variant="embedded"
				emptyDescription="Try a different subscriber, transaction type, payment method, or status."
				emptyIcon={
					<ReceiptText className="h-5 w-5" aria-hidden="true" />
				}
				emptyTitle="No transactions found"
				minWidthClassName="min-w-[105rem]"
				paginationStorageKey={MasterInvoicePaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(22rem,2.5fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(9rem,1fr)]">
						<ModuleTableSearch
							label="Search transactions"
							value={query}
							onChange={setQuery}
							placeholder="Search subscribers, transactions, types, references..."
						/>
						<ModuleTableFilterSelect
							label="Type"
							value={transactionTypeFilter}
							options={MasterInvoiceTransactionTypeOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setTransactionTypeFilter(
									value as MasterInvoiceTransactionTypeFilter,
								)
							}
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

