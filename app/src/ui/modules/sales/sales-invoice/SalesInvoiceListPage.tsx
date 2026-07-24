"use client";

import { FileText, Search } from "lucide-react";
import {
	SalesInvoiceStatusFilterOptions,
	SalesInvoiceTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import {
	useSalesInvoiceStore,
	useSalesInvoiceTable,
} from "@/app/src/hooks/modules/sales/sales-invoice/useSalesInvoice";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { SalesInvoiceListHeaderActions } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceListHeaderActions";
import { SalesInvoiceMetrics } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceMetrics";
import { SalesInvoiceTableRow } from "@/app/src/ui/modules/sales/sales-invoice/SalesInvoiceTableRow";

export function SalesInvoiceListPage() {
	const { invoices, lastSyncedAt, updateInvoiceStatus } = useSalesInvoiceStore();
	const tableState = useSalesInvoiceTable(invoices);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Invoice"
				description="Prepare sales invoices, review customer billing details, and track invoice status."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales
					</>
				}
				actions={<SalesInvoiceListHeaderActions />}
			/>

			<SalesInvoiceMetrics records={invoices} />

			<ModuleTable
				emptyDescription="Try a different invoice number, customer, reference, amount, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No sales invoices matched"
				lastSyncedAt={lastSyncedAt}
				minWidthClassName="min-w-[88rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="entries"
				paginationStorageKey={SalesInvoiceTablePaginationStorageKey}
				table={tableState.table}
				tableTitle="Sales invoice entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search Sales Invoices"
							value={tableState.query}
							onChange={tableState.setQuery}
							placeholder="Search by invoice no., customer, or reference"
						/>
						<DateRangePicker
							label="Date Range"
							value={tableState.dateRange}
							onChange={tableState.setDateRange}
						/>
						<AmountRangePicker
							label="Amount"
							value={tableState.amountRange}
							onChange={tableState.setAmountRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={tableState.statusFilter}
							options={SalesInvoiceStatusFilterOptions}
							onChange={(value) =>
								tableState.setStatusFilter(
									value as Parameters<typeof tableState.setStatusFilter>[0],
								)
							}
						/>
						<ModuleTableResetButton onClick={tableState.resetFilters} />
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<SalesInvoiceTableRow
						key={id}
						record={original}
						rowId={id}
						onUpdateStatus={updateInvoiceStatus}
					/>
				)}
			/>
		</section>
	);
}
