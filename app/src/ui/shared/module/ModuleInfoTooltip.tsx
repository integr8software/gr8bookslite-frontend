import { HelpCircle } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleInfoTooltipProps = {
	label: string;
	title?: string;
	className?: string;
};

export function ModuleInfoTooltip({
	className,
	label,
	title,
}: ModuleInfoTooltipProps) {
	if (!title) {
		return null;
	}

	return (
		<span
			className={joinClasses(
				"group relative inline-flex align-middle",
				className,
			)}
		>
			<button
				type="button"
				aria-label={label}
				className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full align-middle leading-none text-darknavy/38 transition hover:text-darknavy focus:outline-none focus:ring-4 focus:ring-skyblue/15"
			>
				<HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
			<span className="pointer-events-none absolute left-1/2 top-6 z-50 hidden w-72 -translate-x-1/2 rounded-lg border border-darknavy/10 bg-white p-3 text-left text-xs font-medium leading-5 text-darknavy/68 shadow-[0_18px_50px_rgba(33,39,56,0.18)] group-hover:block group-focus-within:block">
				<span className="mb-1 block text-sm font-bold text-darknavy">
					{label}
				</span>
				<span>{title}</span>
			</span>
		</span>
	);
}
