import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleStatisticCardItem = {
	icon: LucideIcon;
	iconClassName: string;
	label: ReactNode;
	summary?: ReactNode;
	value: number | string;
};

export function ModuleStatisticCards({
	className,
	isLoading = false,
	items,
}: {
	className?: string;
	isLoading?: boolean;
	items: ModuleStatisticCardItem[];
}) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div
			className={joinClasses(
				"grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				className,
			)}
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

function ModuleStatisticCard({ item }: { item: ModuleStatisticCardItem }) {
	const Icon = item.icon;

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{item.label}
					</p>
					<p
						className={joinClasses(
							"mt-3 max-w-36 truncate font-semibold leading-none text-darknavy",
							getStatisticValueClassName(item.value),
						)}
					>
						{item.value}
					</p>
					{item.summary ? (
						<p className="mt-2 truncate text-xs font-medium text-darknavy/60">
							{item.summary}
						</p>
					) : null}
				</div>
				<span
					className={joinClasses(
						"inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
						item.iconClassName,
					)}
				>
					<Icon className="h-6 w-6" aria-hidden="true" />
				</span>
			</div>
		</div>
	);
}

function ModuleStatisticCardSkeleton() {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
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

function getStatisticValueClassName(value: number | string) {
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
