"use client";

import { FileText, Search } from "lucide-react";
import {
	BillingInvoiceStatusFilterOptions,
	BillingInvoiceTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import {
	useBillingInvoiceStore,
	useBillingInvoiceTable,
} from "@/app/src/hooks/modules/sales/billing-invoice/useBillingInvoice";
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
import { BillingInvoiceListHeaderActions } from "@/app/src/ui/modules/sales/billing-invoice/overview/BillingInvoiceListHeaderActions";
import { BillingInvoiceMetrics } from "@/app/src/ui/modules/sales/billing-invoice/overview/BillingInvoiceMetrics";
import { BillingInvoiceTableRow } from "@/app/src/ui/modules/sales/billing-invoice/overview/BillingInvoiceTableRow";

export function BillingInvoiceListPage() {
	const { invoices, lastSyncedAt, updateInvoiceStatus } =
		useBillingInvoiceStore();
	const tableState = useBillingInvoiceTable(invoices);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Billing Invoice"
				description="Prepare billing charges, tax amounts, shipment references, and invoice line entries."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales
					</>
				}
				actions={<BillingInvoiceListHeaderActions />}
			/>

			<BillingInvoiceMetrics records={invoices} />

			<ModuleTable
				emptyDescription="Try a different transaction number, customer, invoice, reference, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No billing invoices matched"
				minWidthClassName="min-w-[88rem]"
				paginationLabel="entries"
				paginationStorageKey={BillingInvoiceTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				table={tableState.table}
				tableTitle="Billing invoice entries"
				toolbar={<BillingInvoiceTableToolbar tableState={tableState} />}
				renderRow={({ id, original }) => (
					<BillingInvoiceTableRow
						key={id}
						rowId={id}
						record={original}
						onUpdateStatus={updateInvoiceStatus}
					/>
				)}
			/>
		</section>
	);
}

function BillingInvoiceTableToolbar({
	tableState,
}: {
	tableState: ReturnType<typeof useBillingInvoiceTable>;
}) {
	return (
		<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
			<ModuleTableSearch
				label="Search Billing Invoices"
				value={tableState.query}
				onChange={tableState.setQuery}
				placeholder="Search by trans no., customer, invoice no., or reference"
			/>
			<DateRangePicker
				label="Date Range"
				value={tableState.dateRange}
				onChange={tableState.setDateRange}
			/>
			<AmountRangePicker
				label="Gross Amount"
				value={tableState.amountRange}
				onChange={tableState.setAmountRange}
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={tableState.statusFilter}
				options={BillingInvoiceStatusFilterOptions}
				onChange={(value) =>
					tableState.setStatusFilter(
						value as Parameters<typeof tableState.setStatusFilter>[0],
					)
				}
			/>
			<ModuleTableResetButton onClick={tableState.resetFilters} />
		</ModuleTableToolbar>
	);
}
