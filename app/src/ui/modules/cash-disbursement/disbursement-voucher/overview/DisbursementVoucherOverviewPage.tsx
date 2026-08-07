"use client";

import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import {
	DisbursementVoucherHref,
	DisbursementVoucherStatuses,
	DisbursementVoucherStatusFilterOptions,
	canApproveDisbursementVoucherStatus,
	canCancelDisbursementVoucherStatus,
	canDisapproveDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
	useDisbursementVoucherPreviewTable,
	useDisbursementVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import type {
	DisbursementVoucherPreviewRow,
	DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherTable";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { DisbursementVoucherMetrics } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherMetrics";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";

export function DisbursementVoucherOverviewPage() {
	const previewRows = useDisbursementVoucherStore(
		(state) => state.previewRows,
	);
	const lastSyncedAt = useDisbursementVoucherStore(
		(state) => state.lastSyncedAt,
	);
	const updateTransaction = useDisbursementVoucherStore(
		(state) => state.updateTransaction,
	);
	const updateVoucher = useDisbursementVoucherStore(
		(state) => state.updateVoucher,
	);
	const previewTable = useDisbursementVoucherPreviewTable(previewRows);

	function updatePreviewRowStatus(
		row: DisbursementVoucherPreviewRow,
		status: DisbursementVoucherStatus,
	) {
		const currentStatus = row.voucher?.status ?? row.transaction.status;

	if (!canUpdatePreviewRowStatus(currentStatus, status)) {
		return;
	}

	const updatedAt = new Date().toISOString();

	if (row.voucher) {
		updateVoucher({
			...row.voucher,
			status,
			updatedBy: "Current User",
			updatedAt,
		});
		return;
	}

	updateTransaction({
		...row.transaction,
		status,
		updatedBy: "Current User",
		updatedAt,
	});
}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Disbursement Voucher"
				description="Search source transactions, preview linked vouchers, and create or update voucher entries."
				eyebrow={
					<>
						<ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
						Cash disbursement
					</>
				}
				actions={
					<Link
						href={`${DisbursementVoucherHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Start New Disbursement Voucher
					</Link>
				}
			/>

			<DisbursementVoucherMetrics
				previewRows={previewRows}
				statusFilter={previewTable.statusFilter}
				onStatusFilterChange={previewTable.setStatusFilter}
			/>

			<DisbursementVoucherTable
				lastSyncedAt={lastSyncedAt}
				table={previewTable.table}
				toolbar={
					<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
						<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
							<ModuleTableSearch
								label="Search disbursement vouchers"
								value={previewTable.query}
								onChange={previewTable.setQuery}
								placeholder="Search by voucher no., transaction no., payee, or remarks"
							/>
							<DateRangePicker
								label="Date Range"
								value={previewTable.dateRange}
								onChange={previewTable.setDateRange}
							/>
							<AmountRangePicker
								label="Total Amount"
								value={previewTable.amountRange}
								onChange={previewTable.setAmountRange}
							/>
							<ModuleTableFilterSelect
								label="Status"
								value={previewTable.statusFilter}
								options={DisbursementVoucherStatusFilterOptions}
								onChange={(value) =>
									previewTable.setStatusFilter(
										value as (typeof previewTable.statusOptions)[number],
									)
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-2 xl:w-[7rem]">
							<ModuleTableColumnVisibilityButton table={previewTable.table} />
							<ModuleTableResetButton
								className="px-2"
								onClick={previewTable.resetFilters}
							/>
						</div>
					</ModuleTableToolbar>
				}
				onUpdateStatus={updatePreviewRowStatus}
			/>
		</section>
	);
}

function canUpdatePreviewRowStatus(
	currentStatus: DisbursementVoucherStatus,
	nextStatus: DisbursementVoucherStatus,
) {
	if (nextStatus === DisbursementVoucherStatuses.posted) {
		return canApproveDisbursementVoucherStatus(currentStatus);
	}

	if (nextStatus === DisbursementVoucherStatuses.disapproved) {
		return canDisapproveDisbursementVoucherStatus(currentStatus);
	}

	if (nextStatus === DisbursementVoucherStatuses.cancelled) {
		return canCancelDisbursementVoucherStatus(currentStatus);
	}

	if (nextStatus === DisbursementVoucherStatuses.forApproval) {
		return (
			currentStatus === DisbursementVoucherStatuses.posted ||
			currentStatus === DisbursementVoucherStatuses.disapproved ||
			currentStatus === DisbursementVoucherStatuses.cancelled
		);
	}

	if (
		nextStatus === DisbursementVoucherStatuses.draft &&
		(currentStatus === DisbursementVoucherStatuses.posted ||
			currentStatus === DisbursementVoucherStatuses.disapproved)
	) {
		return true;
	}

	if (
		nextStatus === DisbursementVoucherStatuses.draft ||
		nextStatus === DisbursementVoucherStatuses.forApproval
	) {
		return currentStatus === DisbursementVoucherStatuses.cancelled;
	}

	return false;
}
