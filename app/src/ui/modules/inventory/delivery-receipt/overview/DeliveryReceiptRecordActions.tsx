import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { DeliveryReceiptHref } from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
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
	const isApproved = record.status === "Approved";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditDeliveryReceiptStatus(record.status);
	const undoStatus: DeliveryReceiptStatus = "Active";
	const cancelStatus: DeliveryReceiptStatus = isCancelled ? "Draft" : "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveDeliveryReceiptStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapproveDeliveryReceiptStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
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
	return status === "Active" || status === "Draft" || status === "Pending";
}

function canApproveDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Approved"
	);
}

function canDisapproveDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Disapproved"
	);
}

function canCancelDeliveryReceiptStatus(status: DeliveryReceiptStatus) {
	return status !== "Closed";
}
