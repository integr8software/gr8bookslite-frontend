import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { GoodsIssueHref } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
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
	const isApproved = record.status === "Approved";
	const isDisapproved = record.status === "Disapproved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditGoodsIssueStatus(record.status);
	const undoStatus: GoodsIssueStatus = "Active";
	const cancelStatus: GoodsIssueStatus = isCancelled ? "Draft" : "Cancelled";
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveGoodsIssueStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
			type: "button",
		},
		{
			disabled: !canDisapproveGoodsIssueStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
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
	return status === "Active" || status === "Draft" || status === "Pending";
}

function canApproveGoodsIssueStatus(status: GoodsIssueStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Approved"
	);
}

function canDisapproveGoodsIssueStatus(status: GoodsIssueStatus) {
	return (
		status === "Active" ||
		status === "Draft" ||
		status === "Pending" ||
		status === "Disapproved"
	);
}

function canCancelGoodsIssueStatus(status: GoodsIssueStatus) {
	return status !== "Closed";
}
