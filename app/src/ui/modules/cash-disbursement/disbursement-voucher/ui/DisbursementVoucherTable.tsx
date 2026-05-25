import { Search } from "lucide-react";
import { DisbursementVoucherTablePaginationStorageKey } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
	formatCurrency,
	formatDateLabel,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherRecordActions";

export function DisbursementVoucherTable({
  onCreateVoucher,
  onEditVoucher,
	rows,
	table,
	onDeleteVoucher,
}: {
	onCreateVoucher: (row: DisbursementVoucherPreviewRow) => void;
	onEditVoucher: (row: DisbursementVoucherPreviewRow) => void;
	rows: DisbursementVoucherPreviewRow[];
	table: ReturnType<
		typeof import("@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher").useDisbursementVoucherPreviewTable
	>["table"];
	onDeleteVoucher: (row: DisbursementVoucherPreviewRow) => void;
}) {
	return (
		<div className="overflow-hidden rounded-[28px] border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]">
			<ModuleTable
				emptyDescription="Try a different payee, transaction number, or status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No transactions matched"
				minWidthClassName="min-w-[74rem]"
				paginationStorageKey={
					DisbursementVoucherTablePaginationStorageKey
				}
				table={table}
				renderRow={({ id, original }) => (
					<tr
						key={id}
						className="border-b border-darknavy/8 last:border-b-0"
					>
						<td className="px-4 py-4 align-top">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-skyblue">
								{original.voucher?.voucherNo ??
									"No voucher yet"}
							</p>
							<p className="mt-2 text-sm font-medium text-darknavy/55">
								{original.transaction.transactionNo}
							</p>
						</td>
						<td className="px-4 py-4 align-top">
							<p className="text-sm font-semibold text-darknavy">
								{original.transaction.payee}
							</p>
							<p className="mt-1 max-w-sm text-sm leading-6 text-darknavy/55">
								{original.transaction.purpose}
							</p>
						</td>
						<td className="px-4 py-4 align-top text-sm text-darknavy/70">
							<p>{original.transaction.disbursementType}</p>
							<p className="mt-1 text-xs uppercase tracking-[0.18em] text-darknavy/35">
								{original.transaction.department}
							</p>
						</td>
						<td className="px-4 py-4 align-top text-sm text-darknavy/70">
							{formatDateLabel(
								original.voucher?.voucherDate ??
									original.transaction.transactionDate,
							)}
						</td>
						<td className="px-4 py-4 align-top text-sm font-semibold text-darknavy">
							{formatCurrency(
								original.voucher?.amount ??
									original.transaction.amount,
							)}
						</td>
						<td className="px-4 py-4 align-top">
							<StatusBadge
								status={
									original.voucher?.status ??
									original.transaction.status
								}
							/>
						</td>
						<td className="px-4 py-4 align-top">
							<DisbursementVoucherRecordActions
								onCreateVoucher={onCreateVoucher}
								onEditVoucher={onEditVoucher}
								row={original}
								onDeleteVoucher={onDeleteVoucher}
							/>
						</td>
					</tr>
				)}
			/>
			<div className="flex items-center justify-between gap-3 border-t border-darknavy/8 bg-offwhite/70 px-4 py-3 text-sm text-darknavy/60">
				<p>
					Search transaction results and voucher actions stay aligned
					here.
				</p>
				<p>{rows.length} records loaded</p>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const tone =
		status === "Approved"
			? "bg-citron/30 text-darknavy"
			: status === "Pending Review"
				? "bg-skyblue/18 text-darknavy"
				: status === "Rejected"
					? "bg-coralpink/18 text-coralpink"
					: "bg-darknavy/8 text-darknavy/65";

	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
		>
			{status}
		</span>
	);
}
