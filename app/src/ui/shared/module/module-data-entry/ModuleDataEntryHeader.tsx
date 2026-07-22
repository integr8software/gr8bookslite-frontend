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
	title: ReactNode;
}) {
	return (
		<div className="relative z-50 flex shrink-0 flex-col gap-2 rounded-t-lg border-b border-darknavy/10 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="text-base font-semibold text-darknavy">
						{title}
					</div>
					<span className="inline-flex h-6 items-center rounded-full border border-darknavy/10 bg-offwhite px-2.5 text-[11px] font-semibold text-darknavy/60">
						{entryCountLabel}
					</span>
				</div>
				{description ? (
					<p className="mt-1 text-sm text-darknavy/60">
						{description}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex w-full flex-wrap items-center gap-1.5 lg:w-auto lg:justify-end">
					{actions}
				</div>
			) : null}
		</div>
	);
}
