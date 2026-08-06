import {
	formatSalesJournalAmount,
	getSalesJournalTotals,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import type {
	SalesJournalRecord,
	SalesJournalStatus,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { SalesJournalRecordActions } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalRecordActions";
import { SalesJournalStatusBadge } from "@/app/src/ui/modules/sales/sales-journal/overview/SalesJournalStatusBadge";

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

function formatSalesJournalDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}
