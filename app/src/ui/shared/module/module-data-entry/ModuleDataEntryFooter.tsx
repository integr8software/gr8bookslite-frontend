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
		<div className="relative z-50 grid shrink-0 gap-3 rounded-b-lg border-t border-darknavy/10 bg-offwhite/50 px-5 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
			<div className="min-w-0">
				<p className="text-sm font-medium text-darknavy/60">
					{entryCountLabel}
				</p>
			</div>
			<div className="flex min-w-0 justify-start sm:justify-center">
				{details}
			</div>
			<div className="flex min-w-0 justify-start sm:justify-end">
				{actions}
			</div>
		</div>
	);
}
