import { Ban, CheckCircle2, Edit3, Eye, Trash2, Undo2 } from "lucide-react";
import { SalesJournalHref } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import type {
	SalesJournalRecord,
	SalesJournalStatus,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type SalesJournalRecordActionsProps = {
	record: SalesJournalRecord;
	onDeleteRecord: (record: SalesJournalRecord) => void;
	onUpdateStatus: (
		record: SalesJournalRecord,
		status: SalesJournalStatus,
	) => void;
};

export function SalesJournalRecordActions({
	onDeleteRecord,
	onUpdateStatus,
	record,
}: SalesJournalRecordActionsProps) {
	const isApproved = record.status === "Approved";
	const isCancelled = record.status === "Cancelled";
	const canEdit = canEditSalesJournalStatus(record.status);
	const items: ModuleActionMenuItem[] = [
		{
			disabled: !canApproveSalesJournalStatus(record.status),
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () => onUpdateStatus(record, isApproved ? "Open" : "Approved"),
			type: "button",
		},
		{
			disabled: record.status === "Closed",
			icon: Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => onUpdateStatus(record, isCancelled ? "Draft" : "Cancelled"),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
		{
			icon: Trash2,
			label: "Delete",
			onSelect: () => onDeleteRecord(record),
			tone: "danger",
			type: "button",
		},
	];

	return (
		<ModuleTableActions className="!justify-center">
			<ModuleTableActionLink
				href={`${SalesJournalHref}/view/${record.id}`}
				icon={Eye}
				label={`View sales journal ${record.documentNo}`}
				title="View"
				variant="view"
			/>
			{canEdit ? (
				<ModuleTableActionLink
					href={`${SalesJournalHref}/edit/${record.id}`}
					icon={Edit3}
					label={`Edit sales journal ${record.documentNo}`}
					title="Edit"
					variant="edit"
				/>
			) : (
				<ModuleTableActionButton
					disabled
					icon={Edit3}
					label={`Edit sales journal ${record.documentNo}`}
					title="Edit"
					variant="edit"
				/>
			)}
			<ModuleActionMenu
				className="[&>button]:h-9 [&>button]:w-9"
				items={items}
				label={`More actions for sales journal ${record.documentNo}`}
			/>
		</ModuleTableActions>
	);
}

function canEditSalesJournalStatus(status: SalesJournalStatus) {
	return status === "Draft" || status === "Open";
}

function canApproveSalesJournalStatus(status: SalesJournalStatus) {
	return status === "Draft" || status === "Open" || status === "Approved";
}
