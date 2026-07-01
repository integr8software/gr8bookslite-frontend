"use client";

import Link from "next/link";
import { Download, Plus, ReceiptText, Upload } from "lucide-react";
import {
	DisbursementVoucherHref,
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
import { DisbursementVoucherTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTable";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { DisbursementVoucherMetrics } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherHeader";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";

export function DisbursementVoucherListPage() {
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

		if (row.voucher) {
			updateVoucher({ ...row.voucher, status });
			return;
		}

		updateTransaction({ ...row.transaction, status });
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
					<>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							Upload
						</button>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Export
						</button>
						<Link
							href={`${DisbursementVoucherHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Start New Disbursement Voucher
						</Link>
					</>
				}
			/>

			<DisbursementVoucherMetrics previewRows={previewRows} />

			<DisbursementVoucherTable
				lastSyncedAt={lastSyncedAt}
				table={previewTable.table}
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
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
						<ModuleTableResetButton onClick={previewTable.resetFilters} />
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
	if (nextStatus === "Approved") {
		return canApproveDisbursementVoucherStatus(currentStatus);
	}

	if (nextStatus === "Disapproved") {
		return canDisapproveDisbursementVoucherStatus(currentStatus);
	}

	if (nextStatus === "Cancelled") {
		return canCancelDisbursementVoucherStatus(currentStatus);
	}

	if (nextStatus === "Pending") {
		return (
			currentStatus === "Approved" ||
			currentStatus === "Disapproved" ||
			currentStatus === "Cancelled"
		);
	}

	if (
		(nextStatus === "Active" || nextStatus === "Draft") &&
		(currentStatus === "Approved" || currentStatus === "Disapproved")
	) {
		return true;
	}

	if (nextStatus === "Draft" || nextStatus === "Active") {
		return currentStatus === "Cancelled";
	}

	return false;
}
