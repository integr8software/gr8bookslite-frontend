import { ChevronDown } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

export function AppCollapsibleSection({
	badge,
	children,
	className,
	contentClassName,
	defaultOpen = false,
	description,
	disabled = false,
	required = false,
	title,
}: {
	badge?: string;
	children: ReactNode;
	className?: string;
	contentClassName?: string;
	defaultOpen?: boolean;
	description?: string;
	disabled?: boolean;
	required?: boolean;
	title: string;
}) {
	function preventToggle(event: MouseEvent | KeyboardEvent) {
		if (!disabled) {
			return;
		}

		event.preventDefault();
	}

	return (
		<details
			className={joinClasses(
				"group rounded-lg border border-darknavy/10 bg-darknavy/[0.015]",
				className,
			)}
			open={disabled ? false : defaultOpen}
		>
			<summary
				aria-disabled={disabled}
				onClick={preventToggle}
				onKeyDown={preventToggle}
				className={joinClasses(
					"flex list-none items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/10 [&::-webkit-details-marker]:hidden",
					disabled
						? "cursor-not-allowed text-darknavy/45"
						: "cursor-pointer hover:bg-darknavy/[0.025]",
				)}
			>
				<span className="grid min-w-0 gap-0.5">
					<span className="flex min-w-0 items-center gap-2">
						<span
							className={joinClasses(
								"truncate text-sm font-semibold",
								disabled ? "text-darknavy/45" : "text-darknavy",
							)}
						>
							{title}
						</span>
						{badge ? (
							<span
								className={joinClasses(
									"rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em]",
									disabled
										? "bg-darknavy/5 text-darknavy/35"
										: "bg-skyblue/10 text-skyblue",
								)}
							>
								{badge}
							</span>
						) : null}
					</span>
					{description ? (
						<span
							className={joinClasses(
								"text-xs font-medium",
								disabled ? "text-darknavy/35" : "text-darknavy/52",
							)}
						>
							{description}
						</span>
					) : null}
				</span>
				<span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-darknavy/55">
					{disabled ? (
						<span>Disabled</span>
					) : (
						<>
							{required ? (
								<span className="group-open:hidden text-coralpink">
									Required
								</span>
							) : null}
							<span className="group-open:hidden">Show</span>
							<span className="hidden group-open:inline">Hide</span>
						</>
					)}
					<ChevronDown
						className={joinClasses(
							"h-4 w-4 transition-transform group-open:rotate-180",
							disabled && "opacity-45",
						)}
						aria-hidden="true"
					/>
				</span>
			</summary>
			<div
				className={joinClasses(
					"border-t border-darknavy/10 p-4",
					contentClassName,
				)}
			>
				{children}
			</div>
		</details>
	);
}

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}
