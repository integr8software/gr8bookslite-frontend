import { CheckCircle2, ClipboardList, Clock3, PackageCheck, XCircle } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type MaterialRequestMetricsProps = {
	metrics: {
		totalRequests: number;
		active: number;
		pending: number;
		approved: number;
		disapproved: number;
		closed: number;
	};
};

export function MaterialRequestMetrics({ metrics }: MaterialRequestMetricsProps) {
	const cards = [
		{
			label: "Total Requests",
			value: metrics.totalRequests,
			summary: "All time",
			icon: ClipboardList,
			iconClassName: "bg-skyblue/20 text-skyblue",
		},
		{
			label: "Active",
			value: metrics.active,
			summary: formatPercentage(metrics.active, metrics.totalRequests),
			icon: CheckCircle2,
			iconClassName: "bg-emerald-50 text-emerald-700",
		},
		{
			label: "Pending",
			value: metrics.pending,
			summary: formatPercentage(metrics.pending, metrics.totalRequests),
			icon: Clock3,
			iconClassName: "bg-offwhite text-darknavy",
		},
		{
			label: "Approved",
			value: metrics.approved,
			summary: formatPercentage(metrics.approved, metrics.totalRequests),
			icon: CheckCircle2,
			iconClassName: "bg-citron/25 text-darknavy",
		},
		{
			label: "Disapproved",
			value: metrics.disapproved,
			summary: formatPercentage(metrics.disapproved, metrics.totalRequests),
			icon: XCircle,
			iconClassName: "bg-coralpink/15 text-coralpink",
		},
		{
			label: "Closed",
			value: metrics.closed,
			summary: formatPercentage(metrics.closed, metrics.totalRequests),
			icon: PackageCheck,
			iconClassName: "bg-skyblue/15 text-skyblue",
		},
	];

	return (
		<ModuleStatisticCards items={cards} className="2xl:grid-cols-6" />
	);
}

function formatPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}
