import {
	Ban,
	CheckCircle2,
	Edit3,
	Eye,
	PackageCheck,
	Trash2,
	Undo2,
	Clock3,
} from "lucide-react";
import { SalesJournalHref } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import {
	formatSalesJournalAmount,
	getSalesJournalTotals,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
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
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type SalesJournalTableRowProps = {
	record: SalesJournalRecord;
	onDeleteRecord: (record: SalesJournalRecord) => void;
	onUpdateStatus: (
		record: SalesJournalRecord,
		status: SalesJournalStatus,
	) => void;
};

export function SalesJournalTableRow({
	record,
	onDeleteRecord,
	onUpdateStatus,
}: SalesJournalTableRowProps) {
	const totals = getSalesJournalTotals(record.lines);

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold text-skyblue">
				{record.documentNo}
			</td>
			<td className="px-4 py-4">
				{formatSalesJournalDate(record.documentDate)}
			</td>
			<td className="px-4 py-4">{record.partyName}</td>
			<td className="px-4 py-4">{record.currency}</td>
			<td className="px-4 py-4 font-semibold text-darknavy">
				{formatSalesJournalAmount(totals.totalDebit)}
			</td>
			<td className="px-4 py-4 font-semibold text-darknavy">
				{formatSalesJournalAmount(totals.totalCredit)}
			</td>
			<td className="px-4 py-4">
				<SalesJournalStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4 text-center">
				<SalesJournalRecordActions
					record={record}
					onDeleteRecord={onDeleteRecord}
					onUpdateStatus={onUpdateStatus}
				/>
			</td>
		</tr>
	);
}

function SalesJournalRecordActions({
	onDeleteRecord,
	onUpdateStatus,
	record,
}: SalesJournalTableRowProps) {
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

function SalesJournalStatusBadge({ status }: { status: SalesJournalStatus }) {
	const Icon = statusIconByStatus[status];

	return (
		<span
			className={joinClasses(
				"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
				statusClassNameByStatus[status],
			)}
		>
			<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			{status}
		</span>
	);
}

function canEditSalesJournalStatus(status: SalesJournalStatus) {
	return status === "Draft" || status === "Open";
}

function canApproveSalesJournalStatus(status: SalesJournalStatus) {
	return status === "Draft" || status === "Open" || status === "Approved";
}

function formatSalesJournalDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

const statusIconByStatus = {
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Draft: Clock3,
	Open: CheckCircle2,
} satisfies Record<SalesJournalStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Draft: "bg-offwhite text-darknavy/70",
	Open: "bg-citron/25 text-darknavy",
} satisfies Record<SalesJournalStatus, string>;
