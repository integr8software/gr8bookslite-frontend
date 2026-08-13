import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	GoodsIssueHref,
	GoodsIssueStatuses,
} from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import type {
	GoodsIssueRecord,
	GoodsIssueStatus,
} from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function GoodsIssueRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (record: GoodsIssueRecord, status: GoodsIssueStatus) => void;
	record: GoodsIssueRecord;
}) {
	const isPosted = record.status === GoodsIssueStatuses.posted;
	const isDisapproved = record.status === GoodsIssueStatuses.disapproved;
	const isCancelled = record.status === GoodsIssueStatuses.cancelled;
	const canEdit = canEditGoodsIssueStatus(record.status);
	const undoStatus: GoodsIssueStatus = GoodsIssueStatuses.draft;
	const cancelStatus: GoodsIssueStatus = isCancelled
		? GoodsIssueStatuses.draft
		: GoodsIssueStatuses.cancelled;
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canPostGoodsIssueStatus(record.status),
			icon: isPosted ? Undo2 : CheckCircle2,
			label: isPosted ? "Undo Posted" : "Post",
			onSelect: () =>
				onUpdateStatus(record, isPosted ? undoStatus : GoodsIssueStatuses.posted),
			type: "button",
		},
		{
			disabled: !canDisapproveGoodsIssueStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(
					record,
					isDisapproved ? undoStatus : GoodsIssueStatuses.disapproved,
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelGoodsIssueStatus(record.status),
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
				href={`${GoodsIssueHref}/view/${record.id}`}
				icon={Eye}
				label={`View goods issue ${record.transactionNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${GoodsIssueHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit goods issue ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit goods issue ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for goods issue ${record.transactionNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditGoodsIssueStatus(status: GoodsIssueStatus) {
	return (
		status === GoodsIssueStatuses.draft ||
		status === GoodsIssueStatuses.forApproval
	);
}

function canPostGoodsIssueStatus(status: GoodsIssueStatus) {
	return (
		status === GoodsIssueStatuses.draft ||
		status === GoodsIssueStatuses.forApproval ||
		status === GoodsIssueStatuses.posted
	);
}

function canDisapproveGoodsIssueStatus(status: GoodsIssueStatus) {
	return (
		status === GoodsIssueStatuses.draft ||
		status === GoodsIssueStatuses.forApproval ||
		status === GoodsIssueStatuses.disapproved
	);
}

function canCancelGoodsIssueStatus(status: GoodsIssueStatus) {
	return status !== GoodsIssueStatuses.posted;
}
