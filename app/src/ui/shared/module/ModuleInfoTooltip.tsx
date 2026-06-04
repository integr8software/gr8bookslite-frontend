import { HelpCircle } from "lucide-react";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
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
		<ModuleTooltip
			className={joinClasses("align-middle", className)}
			description={title}
			title={label}
		>
			<button
				type="button"
				aria-label={label}
				className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full align-middle leading-none text-darknavy/38 transition hover:text-darknavy focus:outline-none focus:ring-4 focus:ring-skyblue/15"
			>
				<HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
		</ModuleTooltip>
	);
}
