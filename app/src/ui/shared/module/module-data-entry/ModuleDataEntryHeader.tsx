import type { ReactNode } from "react";

export function ModuleDataEntryHeader({
	actions,
	description,
	entryCountLabel,
	title,
}: {
	actions?: ReactNode;
	description: string;
	entryCountLabel: string;
	title: string;
}) {
	return (
		<div className="relative z-50 flex shrink-0 flex-col gap-3 rounded-t-lg border-b border-darknavy/10 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
			<div>
				<div className="flex flex-wrap items-center gap-2">
					<h2 className="text-base font-semibold text-darknavy">{title}</h2>
					<span className="inline-flex h-6 items-center rounded-full border border-darknavy/10 bg-offwhite px-2.5 text-[11px] font-semibold text-darknavy/60">
						{entryCountLabel}
					</span>
				</div>
				<p className="mt-1 text-sm text-darknavy/60">{description}</p>
			</div>
			{actions ? (
				<div className="flex w-full flex-wrap items-center gap-1.5 xl:w-auto xl:justify-end">
					{actions}
				</div>
			) : null}
		</div>
	);
}
