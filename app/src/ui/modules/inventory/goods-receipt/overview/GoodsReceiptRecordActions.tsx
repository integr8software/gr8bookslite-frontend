import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	GoodsReceiptHref,
	GoodsReceiptStatuses,
} from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import type {
	GoodsReceiptRecord,
	GoodsReceiptStatus,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function GoodsReceiptRecordActions({
	onUpdateStatus,
	record,
}: {
	onUpdateStatus: (
		record: GoodsReceiptRecord,
		status: GoodsReceiptStatus,
	) => void;
	record: GoodsReceiptRecord;
}) {
	const isPosted = record.status === GoodsReceiptStatuses.posted;
	const isDisapproved = record.status === GoodsReceiptStatuses.disapproved;
	const isCancelled = record.status === GoodsReceiptStatuses.cancelled;
	const canEdit = canEditGoodsReceiptStatus(record.status);
	const undoStatus: GoodsReceiptStatus = GoodsReceiptStatuses.draft;
	const cancelStatus: GoodsReceiptStatus = isCancelled
		? GoodsReceiptStatuses.draft
		: GoodsReceiptStatuses.cancelled;
	const overflowItems: ModuleActionMenuItem[] = [
		{
			disabled: !canPostGoodsReceiptStatus(record.status),
			icon: isPosted ? Undo2 : CheckCircle2,
			label: isPosted ? "Undo Posted" : "Post",
			onSelect: () =>
				onUpdateStatus(record, isPosted ? undoStatus : GoodsReceiptStatuses.posted),
			type: "button",
		},
		{
			disabled: !canDisapproveGoodsReceiptStatus(record.status),
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				onUpdateStatus(
					record,
					isDisapproved ? undoStatus : GoodsReceiptStatuses.disapproved,
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelGoodsReceiptStatus(record.status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateStatus(record, cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="justify-center!">
			<ModuleTableActionLink
				href={`${GoodsReceiptHref}/view/${record.id}`}
				icon={Eye}
				label={`View goods receipt ${record.transactionNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${GoodsReceiptHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit goods receipt ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit goods receipt ${record.transactionNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={overflowItems}
				label={`More actions for goods receipt ${record.transactionNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditGoodsReceiptStatus(status: GoodsReceiptStatus) {
	return (
		status === GoodsReceiptStatuses.draft ||
		status === GoodsReceiptStatuses.forApproval
	);
}

function canPostGoodsReceiptStatus(status: GoodsReceiptStatus) {
	return (
		status === GoodsReceiptStatuses.draft ||
		status === GoodsReceiptStatuses.forApproval ||
		status === GoodsReceiptStatuses.posted
	);
}

function canDisapproveGoodsReceiptStatus(status: GoodsReceiptStatus) {
	return (
		status === GoodsReceiptStatuses.draft ||
		status === GoodsReceiptStatuses.forApproval ||
		status === GoodsReceiptStatuses.disapproved
	);
}

function canCancelGoodsReceiptStatus(status: GoodsReceiptStatus) {
	return status !== GoodsReceiptStatuses.posted;
}
