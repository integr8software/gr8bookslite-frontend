import { CheckCircle2, Clock3, FileText, PackageCheck } from "lucide-react";
import type { SalesQuotationServicesRecord } from "@/app/src/types/modules/sales/sales-quotation-services/SalesQuotationServicesTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function SalesQuotationServicesMetrics({ records }: { records: SalesQuotationServicesRecord[] }) {
	const count = (status: SalesQuotationServicesRecord["formValues"]["status"]) => records.filter((record) => record.formValues.status === status).length;
	const openCount = count("Open");
	const approvedCount = count("Approved");
	const draftCount = count("Draft");
	const closedCount = count("Closed");
	const totalAmount = records.reduce((total, record) => total + record.amount, 0);
	const percentage = (value: number) => records.length ? `${Math.round((value / records.length) * 100)}% of total` : "No quotations yet";
	return <ModuleStatisticCards className="2xl:grid-cols-6" items={[
		{ label: "Total Quotations", value: records.length, summary: "All time", icon: FileText, iconClassName: "bg-skyblue/20 text-skyblue" },
		{ label: "Open", value: openCount, summary: percentage(openCount), icon: CheckCircle2, iconClassName: "bg-emerald-50 text-emerald-700" },
		{ label: "Approved", value: approvedCount, summary: percentage(approvedCount), icon: CheckCircle2, iconClassName: "bg-citron/25 text-darknavy" },
		{ label: "Draft", value: draftCount, summary: percentage(draftCount), icon: Clock3, iconClassName: "bg-darknavy/10 text-darknavy" },
		{ label: "Closed", value: closedCount, summary: percentage(closedCount), icon: PackageCheck, iconClassName: "bg-skyblue/15 text-skyblue" },
		{ label: "Quotation Value", value: totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), summary: "Total gross amount", icon: FileText, iconClassName: "bg-offwhite text-darknavy" },
	]} />;
}
