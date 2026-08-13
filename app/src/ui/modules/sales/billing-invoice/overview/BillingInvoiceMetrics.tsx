import { CheckCircle2, Clock3, FileText, PackageCheck, XCircle } from "lucide-react";
import {
	countBillingInvoicesByStatus,
	formatBillingInvoicePercentage,
	isBillingInvoiceActiveStatus,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type { BillingInvoiceRecord } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function BillingInvoiceMetrics({
	records,
}: {
	records: BillingInvoiceRecord[];
}) {
	const activeCount = records.filter((record) =>
		isBillingInvoiceActiveStatus(record.status),
	).length;
	const approvedCount = countBillingInvoicesByStatus(records, "Approved");
	const disapprovedCount = countBillingInvoicesByStatus(records, "Disapproved");
	const pendingCount = countBillingInvoicesByStatus(records, "Pending");
	const closedCount = countBillingInvoicesByStatus(records, "Closed");

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
					summary: formatBillingInvoicePercentage(activeCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-emerald-50 text-emerald-700",
				},
				{
					label: "Pending",
					value: pendingCount,
					summary: formatBillingInvoicePercentage(pendingCount, records.length),
					icon: Clock3,
					iconClassName: "bg-offwhite text-darknavy",
				},
				{
					label: "Approved",
					value: approvedCount,
					summary: formatBillingInvoicePercentage(approvedCount, records.length),
					icon: CheckCircle2,
					iconClassName: "bg-citron/25 text-darknavy",
				},
				{
					label: "Disapproved",
					value: disapprovedCount,
					summary: formatBillingInvoicePercentage(
						disapprovedCount,
						records.length,
					),
					icon: XCircle,
					iconClassName: "bg-coralpink/15 text-coralpink",
				},
				{
					label: "Closed",
					value: closedCount,
					summary: formatBillingInvoicePercentage(closedCount, records.length),
					icon: PackageCheck,
					iconClassName: "bg-skyblue/15 text-skyblue",
				},
			]}
		/>
	);
}
