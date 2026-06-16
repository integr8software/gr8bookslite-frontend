import {
	Ban,
	CheckCircle2,
	Clock3,
	PackageCheck,
	Search,
	XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { DisbursementVoucherTablePaginationStorageKey } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
	formatCurrency,
	formatDateLabel,
	getDisbursementVoucherDisplayStatus,
	type DisbursementVoucherDisplayStatus,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import type {
	DisbursementVoucherPreviewRow,
	DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherRecordActions";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementVoucherTable({
	table,
	toolbar,
	onUpdateStatus,
}: {
	table: ReturnType<
		typeof import("@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher").useDisbursementVoucherPreviewTable
	>["table"];
	toolbar?: ReactNode;
	onUpdateStatus: (
		row: DisbursementVoucherPreviewRow,
		status: DisbursementVoucherStatus,
	) => void;
}) {
	return (
		<ModuleTable
			emptyDescription="Try a different payee, transaction number, or status."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No transactions matched"
			minWidthClassName="min-w-[87rem]"
			paginationLabel="entries"
			paginationStorageKey={DisbursementVoucherTablePaginationStorageKey}
			pageSizeOptions={[5, 10, 15, 20, 25, 50]}
			table={table}
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<tr key={id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
					<td className="px-4 py-4 font-semibold text-skyblue">
						{original.voucher?.voucherNo ?? original.transaction.transactionNo}
					</td>
					<td className="px-4 py-4">
						{formatDateLabel(
							original.voucher?.voucherDate ??
								original.transaction.transactionDate,
						)}
					</td>
					<td className="px-4 py-4">
						{original.transaction.payee}
					</td>
					<td className="px-4 py-4">
						{original.transaction.disbursementType}
					</td>
					<td className="px-4 py-4 font-semibold text-darknavy">
						{formatCurrency(
							original.voucher?.amount ??
								original.transaction.amount,
						)}
					</td>
					<td className="px-4 py-4">
						<DisbursementVoucherStatusBadge
							status={
								getDisbursementVoucherDisplayStatus(
									original.voucher?.status ??
										original.transaction.status,
								)
							}
						/>
					</td>
					<td className="px-4 py-4 text-center">
						<DisbursementVoucherRecordActions
							row={original}
							onUpdateStatus={onUpdateStatus}
						/>
					</td>
				</tr>
			)}
		/>
	);
}

function DisbursementVoucherStatusBadge({
	status,
}: {
	status: DisbursementVoucherDisplayStatus;
}) {
	const Icon = statusIconByStatus[status];

	return (
		<span
			className={joinClasses(
				"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
				statusClassNameByStatus[status],
			)}
		>
			<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			{status}
		</span>
	);
}

const statusIconByStatus = {
	Active: CheckCircle2,
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Disapproved: XCircle,
	Draft: Clock3,
	Pending: Clock3,
} satisfies Record<DisbursementVoucherDisplayStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
} satisfies Record<DisbursementVoucherDisplayStatus, string>;
