import type { ReactNode } from "react";

export function ModuleDataEntryFooter({
	actions,
	details,
	entryCountLabel,
}: {
	actions?: ReactNode;
	details?: ReactNode;
	entryCountLabel: string;
}) {
	return (
		<div className="relative z-50 flex shrink-0 flex-col gap-3 rounded-b-lg border-t border-darknavy/10 bg-offwhite/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
				<p className="text-sm font-medium text-darknavy/60">
					{entryCountLabel}
				</p>
				{details}
			</div>
			{actions}
		</div>
	);
}
