import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleStatisticCardTone =
	| "amber"
	| "blue"
	| "cyan"
	| "emerald"
	| "red"
	| "slate"
	| "violet";

export type ModuleStatisticCardItem = {
	helper?: ReactNode;
	icon: LucideIcon;
	iconClassName?: string;
	isActive?: boolean;
	label: ReactNode;
	onClick?: () => void;
	summary?: ReactNode;
	tone?: ModuleStatisticCardTone;
	value: ReactNode;
};

export function ModuleStatisticCards({
	className,
	isLoading = false,
	items,
	...props
}: ComponentPropsWithoutRef<"div"> & {
	isLoading?: boolean;
	items: ModuleStatisticCardItem[];
}) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div
			className={joinClasses(
				getStatisticGridClassName(items.length),
				className,
			)}
			{...props}
		>
			{items.map((item) =>
				isLoading ? (
					<ModuleStatisticCardSkeleton key={String(item.label)} />
				) : (
					<ModuleStatisticCard item={item} key={String(item.label)} />
				),
			)}
		</div>
	);
}

function getStatisticGridClassName(itemCount: number) {
	if (itemCount > 0 && itemCount % 4 === 0) {
		return "grid gap-4 sm:grid-cols-2 2xl:grid-cols-4";
	}

	return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
}

function ModuleStatisticCard({ item }: { item: ModuleStatisticCardItem }) {
	const Icon = item.icon;
	const tone = item.tone ?? "blue";
	const cardClassName = joinClasses(
		"module-statistic-card rounded-lg border border-darknavy/10 bg-white p-5 text-left shadow-sm shadow-darknavy/5 transition",
		moduleStatisticCardToneClassNames[tone],
		item.onClick &&
			"cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
		item.isActive && "ring-2",
	);
	const content = (
		<div className="flex items-center justify-between gap-4">
			<div className="min-w-0">
				<div className="module-statistic-card-label truncate text-sm font-semibold text-darknavy">
					{item.label}
				</div>
				<div
					className={joinClasses(
						"module-statistic-card-value mt-3 max-w-36 truncate font-semibold leading-none text-darknavy",
						getStatisticValueClassName(item.value),
					)}
				>
					{item.value}
				</div>
				{item.summary ? (
					<div className="module-statistic-card-summary mt-2 truncate text-xs font-medium text-darknavy/60">
						{item.summary}
					</div>
				) : item.helper ? (
					<div
						className={joinClasses(
							"module-statistic-card-summary mt-2 truncate text-xs font-medium text-darknavy/60",
							item.tone === "emerald" && "text-emerald-600",
						)}
					>
						{item.helper}
					</div>
				) : null}
			</div>
			<span
				className={joinClasses(
					"module-statistic-card-icon inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
					item.iconClassName ??
						moduleStatisticCardIconClassNames[tone],
				)}
			>
				<Icon className="h-6 w-6" aria-hidden="true" />
			</span>
		</div>
	);

	if (item.onClick) {
		return (
			<button
				type="button"
				className={cardClassName}
				aria-pressed={item.isActive}
				onClick={item.onClick}
			>
				{content}
			</button>
		);
	}

	return (
		<div className={cardClassName}>
			{content}
		</div>
	);
}

function ModuleStatisticCardSkeleton() {
	return (
		<div className="module-statistic-card rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0 flex-1">
					<AppSkeleton className="h-4 w-24 rounded-md" />
					<AppSkeleton className="mt-3 h-8 w-16 rounded-md" />
					<AppSkeleton className="mt-2 h-3 w-32 rounded-md" />
				</div>
				<AppSkeleton className="h-14 w-14 shrink-0 rounded-full" />
			</div>
		</div>
	);
}

function getStatisticValueClassName(value: ReactNode) {
	const digitCount = String(value).length;

	if (digitCount > 9) {
		return "text-base";
	}

	if (digitCount > 7) {
		return "text-lg";
	}

	if (digitCount > 5) {
		return "text-xl";
	}

	if (digitCount > 3) {
		return "text-2xl";
	}

	return "text-3xl";
}

const moduleStatisticCardIconClassNames: Record<
	ModuleStatisticCardTone,
	string
> = {
	amber: "bg-amber-50 text-amber-700",
	blue: "bg-blue-50 text-blue-700",
	cyan: "bg-cyan-50 text-cyan-700",
	emerald: "bg-emerald-50 text-emerald-700",
	red: "bg-red-50 text-red-700",
	slate: "bg-slate-100 text-slate-700",
	violet: "module-status-metric-icon-total bg-violet-100/80 text-violet-700",
};

const moduleStatisticCardToneClassNames: Record<
	ModuleStatisticCardTone,
	string
> = {
	amber:
		"module-statistic-card-tone-warning hover:border-amber-300 focus-visible:ring-amber-300/45 aria-pressed:border-amber-300 aria-pressed:ring-amber-200/60",
	blue:
		"module-statistic-card-tone-draft hover:border-blue-300 focus-visible:ring-blue-300/45 aria-pressed:border-blue-300 aria-pressed:ring-blue-200/60",
	cyan:
		"module-statistic-card-tone-cyan hover:border-cyan-300 focus-visible:ring-cyan-300/45 aria-pressed:border-cyan-300 aria-pressed:ring-cyan-200/60",
	emerald:
		"module-statistic-card-tone-success hover:border-emerald-300 focus-visible:ring-emerald-300/45 aria-pressed:border-emerald-300 aria-pressed:ring-emerald-200/60",
	red:
		"module-statistic-card-tone-danger hover:border-red-300 focus-visible:ring-red-300/45 aria-pressed:border-red-300 aria-pressed:ring-red-200/60",
	slate:
		"module-statistic-card-tone-neutral hover:border-slate-300 focus-visible:ring-slate-300/45 aria-pressed:border-slate-300 aria-pressed:ring-slate-200/70",
	violet:
		"module-statistic-card-tone-total hover:border-violet-300 focus-visible:ring-violet-300/45 aria-pressed:border-violet-300 aria-pressed:ring-violet-200/60",
};
