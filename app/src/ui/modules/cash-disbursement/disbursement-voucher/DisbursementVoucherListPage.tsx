"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, ReceiptText, Upload } from "lucide-react";
import {
	DisbursementVoucherHref,
	DisbursementVoucherStatusFilterOptions,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
	useDisbursementVoucherPreviewTable,
	useDisbursementVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
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

export function DisbursementVoucherListPage() {
	const router = useRouter();
	const previewRows = useDisbursementVoucherStore(
		(state) => state.previewRows,
	);
	const deleteVoucher = useDisbursementVoucherStore(
		(state) => state.deleteVoucher,
	);
	const isMutating = useDisbursementVoucherStore((state) => state.isMutating);
	const [pendingDeleteRow, setPendingDeleteRow] =
		useState<DisbursementVoucherPreviewRow | null>(null);
	const previewTable = useDisbursementVoucherPreviewTable(previewRows);

	function handleConfirmDelete() {
		if (!pendingDeleteRow?.voucher) {
			return;
		}

		deleteVoucher(pendingDeleteRow.voucher.id);
		setPendingDeleteRow(null);
	}

	return (
		<>
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
					onCreateVoucher={(row) =>
						router.push(
							`${DisbursementVoucherHref}/add?transactionId=${row.transaction.id}`,
						)
					}
					table={previewTable.table}
					toolbar={
						<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
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
					onDeleteVoucher={setPendingDeleteRow}
				/>
			</section>

			<AppDialog
				isOpen={Boolean(pendingDeleteRow)}
				isPending={isMutating}
				title="Delete linked voucher?"
				description={`This will remove ${pendingDeleteRow?.voucher?.voucherNo ?? "the selected voucher"} from ${pendingDeleteRow?.transaction.payee ?? "the selected transaction"}.`}
				confirmLabel="Delete Voucher"
				tone="danger"
				onCancel={() => setPendingDeleteRow(null)}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}
