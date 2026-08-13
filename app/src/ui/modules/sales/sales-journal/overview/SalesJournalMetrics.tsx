import { CheckCircle2, Clock3, FileText, PackageCheck } from "lucide-react";
import {
	formatSalesJournalAmount,
	getSalesJournalTotals,
} from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import type {
	SalesJournalRecord,
	SalesJournalStatus,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function SalesJournalMetrics({
	records,
}: {
	records: SalesJournalRecord[];
}) {
	const draftCount = countSalesJournalsByStatus(records, "Draft");
	const openCount = countSalesJournalsByStatus(records, "Open");
	const approvedCount = countSalesJournalsByStatus(records, "Approved");
	const closedCount = countSalesJournalsByStatus(records, "Closed");
	const totalDebit = records.reduce(
		(sum, record) => sum + getSalesJournalTotals(record.lines).totalDebit,
		0,
	);

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-5"
			items={[
				{
					label: "Total Journals",
					value: records.length,
					summary: "All time",
					icon: FileText,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Open",
					value: openCount,
					summary: formatSalesJournalPercentage(openCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Draft",
					value: draftCount,
					summary: formatSalesJournalPercentage(draftCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatSalesJournalPercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Total Debit",
					value: formatSalesJournalAmount(totalDebit),
					summary: `${closedCount} closed`,
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}

function countSalesJournalsByStatus(
	records: SalesJournalRecord[],
	status: SalesJournalStatus,
) {
	return records.filter((record) => record.status === status).length;
}

function formatSalesJournalPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}
