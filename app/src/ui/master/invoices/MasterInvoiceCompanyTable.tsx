"use client";

import { Building2 } from "lucide-react";
import {
	MasterInvoiceBillingCycleOptions,
	MasterInvoiceCompanyStatusOptions,
	type MasterInvoiceBillingCycleFilter,
	type MasterInvoiceCompanyRowItem,
	type MasterInvoiceCompanyStatusFilter,
	type useMasterInvoiceListPage,
} from "@/app/src/hooks/master/invoices/useMasterInvoiceListPage";
import { MasterInvoiceCompanyPaginationStorageKey } from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";

import { MasterInvoiceCompanyTableRow } from "@/app/src/ui/master/invoices/MasterInvoiceCompanyTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	type ModuleTableExportColumn,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type MasterInvoiceCompanyTableProps = Pick<
	ReturnType<typeof useMasterInvoiceListPage>,
	| "allCompanyRows"
	| "billingCycleFilter"
	| "companyRows"
	| "hasActiveFilters"
	| "isLoading"
	| "isRefreshing"
	| "lastSyncedAt"
	| "query"
	| "resetFilters"
	| "setBillingCycleFilter"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
>;

export function MasterInvoiceCompanyTable({
	allCompanyRows,
	billingCycleFilter,
	companyRows,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	query,
	resetFilters,
	setBillingCycleFilter,
	setQuery,
	setStatusFilter,
	statusFilter,
	table,
}: MasterInvoiceCompanyTableProps) {
	return (
		<ModuleTable<MasterInvoiceCompanyRowItem>
			emptyDescription="Try a different company name, owner, plan, or status search."
			emptyIcon={<Building2 className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No subscriber companies found"
			isLoading={isLoading}
			isSyncing={isRefreshing}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[84rem]"
			paginationStorageKey={MasterInvoiceCompanyPaginationStorageKey}
			table={table}
			tableTitle="Subscriber companies"
			toolbar={
				<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
					<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(11rem,0.9fr)_minmax(11rem,0.9fr)]">
						<ModuleTableSearch
							label="Search companies"
							value={query}
							onChange={setQuery}
							placeholder="Search company, owner, plan, or status"
						/>
						<ModuleTableFilterSelect
							label="Status"
							options={MasterInvoiceCompanyStatusOptions.map((option) => ({
								label: option === "All" ? "All Company Statuses" : option,
								value: option,
							}))}
							value={statusFilter}
							onChange={(value) =>
								setStatusFilter(
									value as MasterInvoiceCompanyStatusFilter,
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Billing Cycle"
							options={MasterInvoiceBillingCycleOptions.map((option) => ({
								label: option === "All" ? "All Billing Cycles" : option,
								value: option,
							}))}
							value={billingCycleFilter}
							onChange={(value) =>
								setBillingCycleFilter(
									value as MasterInvoiceBillingCycleFilter,
								)
							}
						/>
					</div>
					<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
						<ModuleTableColumnVisibilityButton table={table} />
						<ModuleTableExportButton
							allRows={allCompanyRows}
							columns={MasterInvoiceCompanyExportColumns}
							fileName="subscriber-companies"
							filteredRows={companyRows}
							isFiltered={hasActiveFilters}
							table={table}
							title="Subscriber Companies"
						/>
						<ModuleTableResetButton
							className="px-2"
							disabled={!hasActiveFilters}
							onClick={resetFilters}
						>
							Reset
						</ModuleTableResetButton>
					</div>
				</ModuleTableToolbar>
			}
			renderRow={(row) => (
				<MasterInvoiceCompanyTableRow
					key={row.original.subscriber.id}
					row={row.original}
				/>
			)}
		/>
	);
}

const MasterInvoiceCompanyExportColumns: ModuleTableExportColumn<MasterInvoiceCompanyRowItem>[] = [
	{ header: "Company", id: "company", value: (row) => row.subscriber.name },
	{ header: "Owner", id: "owner", value: (row) => row.subscriber.ownerName },
	{ header: "Plan", id: "plan", value: (row) => row.plan?.name ?? "Custom" },
	{ header: "Billing Cycle", id: "billingCycle", value: (row) => row.subscriber.billingCycle },
	{ header: "Companies", id: "companies", value: (row) => `${row.subscriber.companyCount}` },
	{ header: "Branches", id: "branches", value: (row) => `${row.subscriber.branchCount}` },
	{ header: "Users", id: "users", value: (row) => `${row.subscriber.userCount}` },
	{ header: "Total Paid", id: "totalPaid", value: (row) => formatMasterInvoiceCurrency(row.summary.paidAmount) },
	{ header: "Paid Invoices", id: "paidInvoices", value: (row) => `${row.summary.paidInvoices}` },
	{ header: "Pending Invoices", id: "pendingInvoices", value: (row) => `${row.summary.pendingInvoices}` },
	{ header: "Status", id: "status", value: (row) => row.subscriber.status },
	{ header: "Renewal Date", id: "renewalDate", value: (row) => row.subscriber.renewalDate },
];

