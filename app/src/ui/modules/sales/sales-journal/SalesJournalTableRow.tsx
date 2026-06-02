import { CalendarDays } from "lucide-react";
import { SalesJournalHref } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import {
	formatSalesJournalAmount,
	getSalesJournalTotals,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import type { SalesJournalRecord } from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

type SalesJournalTableRowProps = {
	record: SalesJournalRecord;
	onDeleteRecord: (record: SalesJournalRecord) => void;
};

export function SalesJournalTableRow({
	record,
	onDeleteRecord,
}: SalesJournalTableRowProps) {
	const totals = getSalesJournalTotals(record.lines);

	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{record.documentNo}</td>
			<td className="px-4 py-4">
				<span className="inline-flex items-center gap-2">
					<CalendarDays className="h-4 w-4 text-skyblue" aria-hidden="true" />
					{record.documentDate}
				</span>
			</td>
			<td className="px-4 py-4">
				<div className="font-medium">{record.partyName}</div>
				<div className="text-xs text-darknavy/55">{record.partyCode}</div>
			</td>
			<td className="px-4 py-4">{record.currency}</td>
			<td className="px-4 py-4 text-right font-semibold tabular-nums">
				{formatSalesJournalAmount(totals.totalDebit)}
			</td>
			<td className="px-4 py-4 text-right font-semibold tabular-nums">
				{formatSalesJournalAmount(totals.totalCredit)}
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{record.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${SalesJournalHref}/view/${record.id}`}
						label={`View sales journal ${record.documentNo}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${SalesJournalHref}/edit/${record.id}`}
						label={`Edit sales journal ${record.documentNo}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteRecord(record)}
						label={`Delete sales journal ${record.documentNo}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}
