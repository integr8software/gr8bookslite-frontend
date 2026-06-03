import { CheckCircle2, ClipboardList, Clock3, PackageCheck, XCircle } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MaterialRequestMetricsProps = {
	metrics: {
		totalRequests: number;
		pending: number;
		approved: number;
		rejected: number;
		completed: number;
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
			label: "Rejected",
			value: metrics.rejected,
			summary: formatPercentage(metrics.rejected, metrics.totalRequests),
			icon: XCircle,
			iconClassName: "bg-coralpink/15 text-coralpink",
		},
		{
			label: "Completed",
			value: metrics.completed,
			summary: formatPercentage(metrics.completed, metrics.totalRequests),
			icon: PackageCheck,
			iconClassName: "bg-skyblue/15 text-skyblue",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div
						key={card.label}
						className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5"
					>
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold text-darknavy">
									{card.label}
								</p>
								<p className="mt-3 text-3xl font-semibold leading-none text-darknavy">
									{card.value}
								</p>
								<p className="mt-2 text-xs font-medium text-darknavy/60">
									{card.summary}
								</p>
							</div>
							<span
								className={joinClasses(
									"inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
									card.iconClassName,
								)}
							>
								<Icon className="h-6 w-6" aria-hidden="true" />
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function formatPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}
