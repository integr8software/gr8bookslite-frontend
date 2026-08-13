import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	DeliveryReceiptHref,
	DeliveryReceiptStatuses,
} from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
import type {
	DeliveryReceiptRecord,
	DeliveryReceiptStatus,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function DeliveryReceiptRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (
		record: DeliveryReceiptRecord,
		status: DeliveryReceiptStatus,
	) => void;
	record: DeliveryReceiptRecord;
}) {
	const isPosted = record.status === DeliveryReceiptStatuses.posted;
	const isDisapproved = record.status === DeliveryReceiptStatuses.disapproved;
	const isCancelled = record.status === DeliveryReceiptStatuses.cancelled;
	const canEdit = canEditDeliveryReceiptStatus(record.status);
	const undoStatus: DeliveryReceiptStatus = DeliveryReceiptStatuses.draft;
	const cancelStatus: DeliveryReceiptStatus = isCancelled
		? DeliveryReceiptStatuses.draft
		: DeliveryReceiptStatuses.cancelled;
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canPostDeliveryReceiptStatus(record.status),
			icon: isPosted ? Undo2 : CheckCircle2,
			label: isPosted ? "Undo Posted" : "Post",
			onSelect: () =>
				onUpdateStatus(record, isPosted ? undoStatus : DeliveryReceiptStatuses.posted),
			type: "button",
		},
		{
			disabled: !canDisapproveDeliveryReceiptStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(
					record,
					isDisapproved ? undoStatus : DeliveryReceiptStatuses.disapproved,
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelDeliveryReceiptStatus(record.status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateStatus(record, cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="!justify-center">
			<ModuleTableActionLink
				href={`${DeliveryReceiptHref}/view/${record.id}`}
				icon={Eye}
				label={`View delivery receipt ${record.transactionNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${DeliveryReceiptHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit delivery receipt ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit delivery receipt ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for delivery receipt ${record.transactionNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return (
		status === DeliveryReceiptStatuses.draft ||
		status === DeliveryReceiptStatuses.forApproval
	);
}

function canPostDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return (
		status === DeliveryReceiptStatuses.draft ||
		status === DeliveryReceiptStatuses.forApproval ||
		status === DeliveryReceiptStatuses.posted
	);
}

function canDisapproveDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return (
		status === DeliveryReceiptStatuses.draft ||
		status === DeliveryReceiptStatuses.forApproval ||
		status === DeliveryReceiptStatuses.disapproved
	);
}

function canCancelDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return status !== DeliveryReceiptStatuses.posted;
}
