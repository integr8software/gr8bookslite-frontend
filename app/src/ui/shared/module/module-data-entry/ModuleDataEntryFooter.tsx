import type { ReactNode } from "react";

export function ModuleDataEntryFooter({
	actions,
	entryCountLabel,
}: {
	actions?: ReactNode;
	entryCountLabel: string;
}) {
	return (
		<div className="relative z-50 flex shrink-0 flex-col gap-3 rounded-b-lg border-t border-darknavy/10 bg-offwhite/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm font-medium text-darknavy/60">{entryCountLabel}</p>
			{actions}
		</div>
	);
}
