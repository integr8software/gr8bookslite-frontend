import type { ReactNode } from "react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleTooltipProps = {
	children: ReactNode;
	description?: ReactNode;
	title: ReactNode;
	align?: "center" | "end" | "start";
	className?: string;
	contentClassName?: string;
	position?: "bottom" | "top";
};

export function ModuleTooltip({
	align = "center",
	children,
	className,
	contentClassName,
	description,
	position = "bottom",
	title,
}: ModuleTooltipProps) {
	return (
		<span
			className={joinClasses(
				"group/module-tooltip relative inline-flex",
				className,
			)}
		>
			{children}
			<span
				role="tooltip"
				className={joinClasses(
					"pointer-events-none absolute z-[90] hidden w-max max-w-64 rounded-lg border border-darknavy/10 bg-white px-3 py-2 text-left shadow-[0_18px_50px_rgba(33,39,56,0.18)] group-hover/module-tooltip:block group-focus-within/module-tooltip:block",
					position === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
					align === "start" && "left-0",
					align === "center" && "left-1/2 -translate-x-1/2",
					align === "end" && "right-0",
					contentClassName,
				)}
			>
				<span className="block text-xs font-bold text-darknavy">{title}</span>
				{description ? (
					<span className="mt-1 block text-xs font-medium leading-5 text-darknavy/62">
						{description}
					</span>
				) : null}
			</span>
		</span>
	);
}
