import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { useState } from "react";
import { BillingInvoiceHref } from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import type {
	BillingInvoiceRecord,
	BillingInvoiceStatus,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function BillingInvoiceRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (
		record: BillingInvoiceRecord,
		status: BillingInvoiceStatus,
	) => void;
	record: BillingInvoiceRecord;
}) {
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const isApproved = record.status === "Approved";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditBillingInvoiceStatus(record.status);
	const approveLabel = isApproved ? "Undo Approved" : "Approve";
	const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
	const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
	const undoStatus: BillingInvoiceStatus = "Active";
	const cancelStatus: BillingInvoiceStatus = isCancelled ? "Draft" : "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveBillingInvoiceStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: approveLabel,
			onSelect: () =>
				onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapproveBillingInvoiceStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: disapproveLabel,
			onSelect: () =>
				onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelBillingInvoiceStatus(record.status),
			icon: isCancelled ? Undo2 : Ban,
			label: cancelLabel,
			onSelect: () => setIsCancelDialogOpen(true),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<>
			<ModuleTableActions className="!justify-center">
				<ModuleTableActionLink
					href={`${BillingInvoiceHref}/view/${record.id}`}
					icon={Eye}
					label={`View billing invoice ${record.transactionNo}`}
					title="View"
					variant="view"
				/>
				{canEdit ? (
					<ModuleTableActionLink
						href={`${BillingInvoiceHref}/edit/${record.id}`}
						icon={Edit3}
						label={`Edit billing invoice ${record.transactionNo}`}
						title="Edit"
						variant="edit"
					/>
				) : (
					<ModuleTableActionButton
						disabled
						icon={Edit3}
						label={`Edit billing invoice ${record.transactionNo}`}
						title="Edit"
						variant="edit"
					/>
				)}
				<ModuleActionMenu
					className="[&>button]:h-9 [&>button]:w-9"
					items={overflowItems}
					label={`More actions for billing invoice ${record.transactionNo}`}
				/>
			</ModuleTableActions>
			<AppDialog
				confirmLabel={cancelLabel}
				description={`This will mark billing invoice ${record.transactionNo} as ${cancelStatus}.`}
				iconTone={isCancelled ? "question" : "error"}
				isOpen={isCancelDialogOpen}
				title={`${cancelLabel} billing invoice?`}
				tone={isCancelled ? "success" : "danger"}
				onCancel={() => setIsCancelDialogOpen(false)}
				onConfirm={() => {
					onUpdateStatus(record, cancelStatus);
					setIsCancelDialogOpen(false);
				}}
			/>
		</>
	);
}

function canEditBillingInvoiceStatus(status: BillingInvoiceStatus) {
	return status === "Active" || status === "Draft" || status === "Pending";
}

function canApproveBillingInvoiceStatus(status: BillingInvoiceStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Approved"
	);
}

function canDisapproveBillingInvoiceStatus(status: BillingInvoiceStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Disapproved"
	);
}

function canCancelBillingInvoiceStatus(status: BillingInvoiceStatus) {
	return status !== "Closed";
}

