import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { PickListHref } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import type {
	PickListRecord,
	PickListStatus,
} from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PickListRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (record: PickListRecord, status: PickListStatus) => void;
	record: PickListRecord;
}) {
	const isApproved = record.status === "Approved";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditPickListStatus(record.status);
	const undoStatus: PickListStatus = "Active";
	const cancelStatus: PickListStatus = isCancelled ? "Draft" : "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApprovePickListStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapprovePickListStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelPickListStatus(record.status),
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
				href={`${PickListHref}/view/${record.id}`}
				icon={Eye}
				label={`View pick list ${record.transactionNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${PickListHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit pick list ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit pick list ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for pick list ${record.transactionNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditPickListStatus(status: PickListStatus) {
	return status === "Active" || status === "Draft" || status === "Pending";
}

function canApprovePickListStatus(status: PickListStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Approved"
	);
}

function canDisapprovePickListStatus(status: PickListStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Disapproved"
	);
}

function canCancelPickListStatus(status: PickListStatus) {
	return status !== "Closed";
}
