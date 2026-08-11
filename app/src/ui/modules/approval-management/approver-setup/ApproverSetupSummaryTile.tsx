import type { LucideIcon } from "lucide-react";

type ApproverSetupSummaryTileProps = {
	helper: string;
	icon: LucideIcon;
	label: string;
	value: number;
};

export function ApproverSetupSummaryTile({
	helper,
	icon: Icon,
	label,
	value,
}: ApproverSetupSummaryTileProps) {
	return (
		<div className="flex min-h-24 items-center gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
			<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-skyblue/12 text-skyblue">
				<Icon className="h-5 w-5" aria-hidden="true" />
			</span>
			<div>
				<div className="text-2xl font-semibold text-darknavy">
					{value}
				</div>
				<div className="text-sm font-medium text-darknavy/55">
					{label}
				</div>
				<div className="mt-1 text-xs font-medium text-darknavy/42">
					{helper}
				</div>
			</div>
		</div>
	);
}
