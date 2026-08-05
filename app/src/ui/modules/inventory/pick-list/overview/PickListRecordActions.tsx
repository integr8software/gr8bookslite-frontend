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
	const isPosted = record.status === "Posted";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditPickListStatus(record.status);
	const undoStatus: PickListStatus = "Draft";
	const cancelStatus: PickListStatus = isCancelled ? "Draft" : "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canPostPickListStatus(record.status),
			icon: isPosted ? Undo2 : CheckCircle2,
			label: isPosted ? "Undo Posted" : "Post",
			onSelect: () =>
				onUpdateStatus(record, isPosted ? undoStatus : "Posted"),
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
	return status === "Draft" || status === "For Approval";
}

function canPostPickListStatus(status: PickListStatus) {
	return (
		status === "Draft" ||
		status === "For Approval" ||
		status === "Posted"
	);
}

function canDisapprovePickListStatus(status: PickListStatus) {
	return (
		status === "Draft" ||
		status === "For Approval" ||
		status === "Disapproved"
	);
}

function canCancelPickListStatus(status: PickListStatus) {
	return status !== "Posted";
}
