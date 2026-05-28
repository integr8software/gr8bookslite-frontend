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
				"grid overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5",
				className,
			)}
			style={{
				gridTemplateColumns:
					"repeat(auto-fit, minmax(min(100%, 14rem), 1fr))",
				...style,
			}}
			{...props}
		>
			{metrics.map((metric, index) => (
				<ModuleMetricCard
					key={index}
					metric={metric}
					hasDivider={index > 0}
				/>
			))}
		</div>
	);
}

function ModuleMetricCard({
	hasDivider,
	metric,
}: {
	hasDivider: boolean;
	metric: ModuleMetricItem;
}) {
	return (
		<div className="relative min-h-24 bg-white px-6 py-5">
			{hasDivider ? (
				<span
					className="absolute bottom-4 left-0 top-4 w-px bg-darknavy/10"
					aria-hidden="true"
				/>
			) : null}
			<span
				className={joinClasses(
					"absolute bottom-6 left-6 top-6 w-0.5 rounded-full",
					moduleMetricAccentClassNames[metric.tone ?? "blue"],
					metric.iconClassName,
				)}
				aria-hidden="true"
			/>
			<div className="min-w-0 pl-5">
				<div className="text-xs font-bold text-darknavy/70">
					{metric.label}
				</div>
				<div className="mt-2 text-2xl font-bold leading-none text-darknavy">
					{metric.value}
				</div>
				{metric.helper ? (
					<div
						className={joinClasses(
							"mt-2 text-sm font-medium text-darknavy/60",
							metric.tone === "emerald" && "text-emerald-600",
						)}
					>
						{metric.helper}
					</div>
				) : null}
			</div>
		</div>
	);
}

const moduleMetricAccentClassNames: Record<ModuleMetricTone, string> = {
	amber: "bg-amber-500",
	blue: "bg-blue-600",
	cyan: "bg-cyan-500",
	emerald: "bg-emerald-500",
	slate: "bg-slate-500",
	violet: "bg-violet-600",
};
