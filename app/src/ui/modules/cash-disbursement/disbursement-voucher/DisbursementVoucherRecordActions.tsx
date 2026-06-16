import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	DisbursementVoucherHref,
	canApproveDisbursementVoucherStatus,
	canCancelDisbursementVoucherStatus,
	canDisapproveDisbursementVoucherStatus,
	canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
	DisbursementVoucherPreviewRow,
	DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";

export function DisbursementVoucherRecordActions({
	row,
	onUpdateStatus,
}: {
	row: DisbursementVoucherPreviewRow;
	onUpdateStatus: (
		row: DisbursementVoucherPreviewRow,
		status: DisbursementVoucherStatus,
	) => void;
}) {
	const transactionId = row.transaction.id;
	const recordLabel = row.voucher?.voucherNo ?? row.transaction.transactionNo;
	const status = row.voucher?.status ?? row.transaction.status;
	const canEdit = row.voucher && canEditDisbursementVoucherStatus(status);
	const isApproved = status === "Approved";
	const isDisapproved = status === "Disapproved";
	const isCancelled = status === "Cancelled";
	const approvalUndoStatus: DisbursementVoucherStatus = "Active";
	const cancelStatus: DisbursementVoucherStatus = isCancelled
		? row.voucher
			? "Draft"
			: "Pending"
		: "Cancelled";
	const items: ModuleActionMenuItem[] = [
		{
			href: `${DisbursementVoucherHref}/view/${transactionId}`,
			icon: Eye,
			label: "View",
			type: "link",
		},
		...(canEdit
			? [
				{
					href: `${DisbursementVoucherHref}/edit/${transactionId}`,
					icon: Edit3,
					label: "Edit",
					type: "link",
				} satisfies ModuleActionMenuItem,
			]
			: []),
		{
			disabled: !canApproveDisbursementVoucherStatus(status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateStatus(row, isApproved ? approvalUndoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapproveDisbursementVoucherStatus(status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(
					row,
					isDisapproved ? approvalUndoStatus : "Disapproved",
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelDisbursementVoucherStatus(status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateStatus(row, cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="!justify-center">
			<ModuleActionMenu
				items={items}
				label={`Actions for disbursement voucher ${recordLabel}`}
			/>
		</ModuleTableActions>
	);
}
