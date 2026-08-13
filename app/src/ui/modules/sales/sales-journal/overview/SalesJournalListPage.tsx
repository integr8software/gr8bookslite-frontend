"use client";

import { FileText, Search } from "lucide-react";
import {
	SalesJournalStatusFilterOptions,
	SalesJournalTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import { useSalesJournalListPage } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournalListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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
import { SalesJournalListHeaderActions } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalListHeaderActions";
import { SalesJournalMetrics } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalMetrics";
import { SalesJournalTableRow } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalTableRow";

export function SalesJournalListPage() {
	const {
		amountRange,
		dateRange,
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		pendingDeleteRecord,
		query,
		records,
		resetFilters,
		setAmountRange,
		setDateRange,
		setPendingDeleteRecord,
		setStatusFilter,
		statusFilter,
		table,
		updateRecordStatus,
	} = useSalesJournalListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Sales Journal"
				description="Search sales journals, review document dates, and create or update accounting entries."
				eyebrow={
					<>
						<FileText className="h-3.5 w-3.5" aria-hidden="true" />
						Sales
					</>
				}
				actions={<SalesJournalListHeaderActions />}
			/>

			<SalesJournalMetrics records={records} />

			<ModuleTable
				emptyDescription="Try a different document number, party, date, amount, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No sales journals matched"
				isLoading={isLoading}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName="min-w-[86rem]"
				pageSizeOptions={[5, 10, 15, 20, 25, 50]}
				paginationLabel="entries"
				paginationStorageKey={SalesJournalTablePaginationStorageKey}
				table={table}
				tableTitle="Journal entries"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
						<ModuleTableSearch
							label="Search sales journals"
							value={query}
							onChange={handleQueryChange}
							placeholder="Search by document no., party, remarks, or status"
						/>
						<DateRangePicker
							label="Document Date"
							value={dateRange}
							onChange={setDateRange}
						/>
						<AmountRangePicker
							label="Debit Amount"
							value={amountRange}
							onChange={setAmountRange}
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={SalesJournalStatusFilterOptions}
							onChange={(value) =>
								setStatusFilter(
									value as Parameters<typeof setStatusFilter>[0],
								)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters} />
					</ModuleTableToolbar>
				}
				renderRow={({ id, original }) => (
					<SalesJournalTableRow
						key={id}
						record={original}
						onDeleteRecord={setPendingDeleteRecord}
						onUpdateStatus={updateRecordStatus}
					/>
				)}
			/>

			<AppDialog
				isOpen={Boolean(pendingDeleteRecord)}
				isPending={isMutating}
				title="Delete sales journal?"
				description={`This will remove ${pendingDeleteRecord?.documentNo ?? "the selected sales journal"}.`}
				confirmLabel="Delete Sales Journal"
				tone="danger"
				onCancel={() => setPendingDeleteRecord(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}
