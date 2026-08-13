import { useState } from "react";
import {
	Ban,
	Edit3,
	Eye,
	ThumbsDown,
	ThumbsUp,
	Undo2,
} from "lucide-react";
import {
	DisbursementVoucherHref,
	DisbursementVoucherStatuses,
	canApproveDisbursementVoucherStatus,
	canCancelDisbursementVoucherStatus,
	canDisapproveDisbursementVoucherStatus,
	canEditDisbursementVoucherStatus,
	getDisbursementVoucherStatusDialogCopy,
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
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

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
	const [statusToConfirm, setStatusToConfirm] =
		useState<DisbursementVoucherStatus | null>(null);
	const transactionId = row.transaction.id;
	const recordLabel = row.voucher?.voucherNo ?? row.transaction.transactionNo;
	const status = row.voucher?.status ?? row.transaction.status;
	const canEdit = row.voucher && canEditDisbursementVoucherStatus(status);
	const isPosted = status === DisbursementVoucherStatuses.posted;
	const isDisapproved = status === DisbursementVoucherStatuses.disapproved;
	const isCancelled = status === DisbursementVoucherStatuses.cancelled;
	const approvalUndoStatus: DisbursementVoucherStatus =
		DisbursementVoucherStatuses.forApproval;
	const cancelStatus: DisbursementVoucherStatus = isCancelled
		? row.voucher
			? DisbursementVoucherStatuses.draft
			: DisbursementVoucherStatuses.forApproval
		: DisbursementVoucherStatuses.cancelled;
	const statusDialogCopy = statusToConfirm
		? getDisbursementVoucherStatusDialogCopy(statusToConfirm, recordLabel)
		: null;
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
			icon: isPosted ? Undo2 : ThumbsUp,
			label: isPosted ? "Undo Approved" : "Approve",
			onSelect: () => {
				if (isPosted) {
					onUpdateStatus(row, approvalUndoStatus);
					return;
				}

				setStatusToConfirm(DisbursementVoucherStatuses.posted);
			},
			type: "button",
		},
		{
			disabled: !canDisapproveDisbursementVoucherStatus(status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () => {
				if (isDisapproved) {
					onUpdateStatus(row, approvalUndoStatus);
					return;
				}

				setStatusToConfirm(DisbursementVoucherStatuses.disapproved);
			},
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelDisbursementVoucherStatus(status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Undo Cancelled" : "Cancel",
			onSelect: () => {
				if (isCancelled) {
					onUpdateStatus(row, cancelStatus);
					return;
				}

				setStatusToConfirm(DisbursementVoucherStatuses.cancelled);
			},
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<>
			<ModuleTableActions className="!justify-center">
				<ModuleActionMenu
					items={items}
					label={`Actions for disbursement voucher ${recordLabel}`}
				/>
			</ModuleTableActions>
			{statusDialogCopy ? (
				<AppDialog
					isOpen
					title={statusDialogCopy.title}
					description={statusDialogCopy.description}
					cancelLabel="Keep Current Status"
					confirmLabel={statusDialogCopy.confirmLabel}
					iconTone={statusDialogCopy.iconTone}
					pendingLabel={statusDialogCopy.pendingLabel}
					tone={statusDialogCopy.tone}
					onCancel={() => setStatusToConfirm(null)}
					onConfirm={() => {
						if (!statusToConfirm) {
							return;
						}

						onUpdateStatus(row, statusToConfirm);
						setStatusToConfirm(null);
					}}
				/>
			) : null}
		</>
	);
}
