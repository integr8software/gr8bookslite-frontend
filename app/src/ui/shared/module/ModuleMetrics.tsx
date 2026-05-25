import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleMetricTone =
	| "amber"
	| "blue"
	| "cyan"
	| "emerald"
	| "slate"
	| "violet";

export type ModuleMetricItem = {
	helper?: ReactNode;
	icon: LucideIcon;
	iconClassName?: string;
	label: ReactNode;
	tone?: ModuleMetricTone;
	value: ReactNode;
};

type ModuleMetricsProps = ComponentPropsWithoutRef<"div"> & {
	metrics: ModuleMetricItem[];
};

export function ModuleMetrics({
	className,
	metrics,
	style,
	...props
}: ModuleMetricsProps) {
	if (metrics.length === 0) {
		return null;
	}

	return (
		<div
			className={joinClasses(
				"grid gap-4",
				className,
			)}
			style={{
				gridTemplateColumns:
					"repeat(auto-fit, minmax(min(100%, 18rem), 1fr))",
				...style,
			}}
			{...props}
		>
			{metrics.map((metric, index) => (
				<ModuleMetricCard key={index} metric={metric} />
			))}
		</div>
	);
}

function ModuleMetricCard({ metric }: { metric: ModuleMetricItem }) {
	const Icon = metric.icon;

	return (
		<div className="flex min-h-24 items-center gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<span
				className={joinClasses(
					"flex h-14 w-14 shrink-0 items-center justify-center rounded-lg",
					metric.iconClassName ??
						moduleMetricToneClassNames[metric.tone ?? "blue"],
				)}
			>
				<Icon className="h-7 w-7" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<p className="text-sm font-medium text-darknavy/70">
					{metric.label}
				</p>
				<p className="text-2xl font-semibold leading-tight text-darknavy">
					{metric.value}
				</p>
				{metric.helper ? (
					<p className="text-sm text-darknavy/65">{metric.helper}</p>
				) : null}
			</div>
		</div>
	);
}

const moduleMetricToneClassNames: Record<ModuleMetricTone, string> = {
	amber: "bg-amber-50 text-amber-500",
	blue: "bg-blue-50 text-blue-600",
	cyan: "bg-cyan-50 text-cyan-600",
	emerald: "bg-emerald-50 text-emerald-600",
	slate: "bg-slate-100 text-slate-600",
	violet: "bg-violet-50 text-violet-600",
};
