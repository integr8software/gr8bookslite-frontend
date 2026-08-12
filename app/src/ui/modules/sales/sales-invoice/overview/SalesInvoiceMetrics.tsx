import { CheckCircle2, Clock3, FileText, PackageCheck } from "lucide-react";
import {
	countSalesInvoicesByStatus,
	isSalesInvoiceActiveStatus,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceStatusData";
import { formatSalesInvoicePercentage } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceFormatters";
import type { SalesInvoiceRecord } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function SalesInvoiceMetrics({
	records,
}: {
	records: SalesInvoiceRecord[];
}) {
	const activeCount = records.filter((record) =>
		isSalesInvoiceActiveStatus(record.status),
	).length;
	const approvedCount = countSalesInvoicesByStatus(records, "Approved");
	const pendingCount = countSalesInvoicesByStatus(records, "Pending");
	const draftCount = countSalesInvoicesByStatus(records, "Draft");
	const closedCount = countSalesInvoicesByStatus(records, "Closed");

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-6"
			items={[
				{
					label: "Total Invoices",
					value: records.length,
					summary: "All time",
					icon: FileText,
					iconClassName: "bg-skyblue/20 text-skyblue",
				},
				{
					label: "Active",
					value: activeCount,
					summary: formatSalesInvoicePercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatSalesInvoicePercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatSalesInvoicePercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Draft",
					value: draftCount,
					summary: formatSalesInvoicePercentage(draftCount, records.length),
					icon: Clock3,
					iconClassName: "bg-darknavy/10 text-darknavy",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatSalesInvoicePercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}
