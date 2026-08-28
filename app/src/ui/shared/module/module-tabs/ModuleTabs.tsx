"use client";

import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTabItem<TabId extends string> = {
	badge?: number;
	badgeTone?: "error" | "info";
	id: TabId;
	label: string;
};

type ModuleTabsProps<TabId extends string> = {
	activeTab: TabId;
	ariaLabel: string;
	onTabChange: (tab: TabId) => void;
	tabClassName?: string;
	tabs: readonly ModuleTabItem<TabId>[];
	variant?: "default" | "compact" | "underline";
};

export function ModuleTabs<TabId extends string>({
	activeTab,
	ariaLabel,
	onTabChange,
	tabClassName,
	tabs,
	variant = "default",
}: ModuleTabsProps<TabId>) {
	return (
		<div
			className={joinClasses(
				"overflow-x-auto rounded-lg border border-darknavy/10 bg-white p-1 shadow-sm shadow-darknavy/5 [scrollbar-color:rgb(var(--skyblue-rgb)_/_0.45)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-skyblue/45 hover:[&::-webkit-scrollbar-thumb]:bg-skyblue/70",
				variant === "compact" ? "rounded-md border-darknavy/8 p-0.5 shadow-none" : "",
				variant === "underline" ? "rounded-none border-0 border-b border-darknavy/10 bg-transparent p-0 shadow-none" : "",
			)}
		>
			<div role="tablist" aria-label={ariaLabel} className={joinClasses("flex min-w-max gap-1", variant === "underline" ? "gap-4" : "")}>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					const badgeTone = tab.badgeTone ?? "info";

					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							onClick={() => onTabChange(tab.id)}
							className={joinClasses(
								"inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25",
								variant === "compact" ? "h-8 px-3 text-xs" : "",
								variant === "underline"
									? joinClasses(
											"h-9 rounded-none border-b-2 px-0 shadow-none",
											isActive
												? "border-skyblue bg-transparent text-skyblue"
												: "border-transparent bg-transparent text-darknavy/55 hover:text-darknavy",
										)
									: isActive
									? "theme-accent-contrast-text bg-skyblue shadow-sm"
									: "text-darknavy/65 hover:bg-[rgb(var(--skyblue-rgb)/0.06)] hover:text-darknavy",
								tabClassName,
							)}
						>
							<span>{tab.label}</span>
							{tab.badge ? (
								<span
									className={joinClasses(
										"inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
										badgeTone === "error"
											? isActive
												? "bg-white text-coralpink"
												: "bg-coralpink/10 text-coralpink"
											: isActive
												? "bg-white/20 text-[var(--skyblue-contrast)]"
												: "bg-skyblue/10 text-skyblue",
									)}
								>
									{tab.badge}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
}
