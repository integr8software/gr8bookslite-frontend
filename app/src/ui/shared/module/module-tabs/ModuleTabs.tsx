"use client";

import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTabItem<TabId extends string> = {
	badge?: number;
	hasError?: boolean;
	id: TabId;
	label: string;
};

type ModuleTabsProps<TabId extends string> = {
	activeTab: TabId;
	ariaLabel: string;
	onTabChange: (tab: TabId) => void;
	tabClassName?: string;
	tabs: readonly ModuleTabItem<TabId>[];
	variant?: "filled" | "underline";
};

export function ModuleTabs<TabId extends string>({
	activeTab,
	ariaLabel,
	onTabChange,
	tabClassName,
	tabs,
	variant = "filled",
}: ModuleTabsProps<TabId>) {
	const isUnderline = variant === "underline";

	return (
		<div
			className={joinClasses(
				"overflow-x-auto [scrollbar-color:rgb(var(--skyblue-rgb)_/_0.45)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-skyblue/45 hover:[&::-webkit-scrollbar-thumb]:bg-skyblue/70",
				!isUnderline && "rounded-lg border border-darknavy/10 bg-white p-1 shadow-sm shadow-darknavy/5",
			)}
		>
			<div role="tablist" aria-label={ariaLabel} className={joinClasses("flex min-w-max", !isUnderline && "gap-1")}>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;

					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							data-has-error={tab.hasError || undefined}
							onClick={() => onTabChange(tab.id)}
							className={joinClasses(
								"inline-flex items-center gap-2 px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25",
								isUnderline
									? "h-11 border-b-2 font-medium focus-visible:ring-inset"
									: "h-10 rounded-md font-semibold",
								isUnderline && isActive && "border-skyblue text-skyblue",
								isUnderline && !isActive && "border-transparent text-darknavy/65 hover:border-darknavy/15 hover:text-darknavy",
								!isUnderline && isActive && "theme-accent-contrast-text bg-skyblue shadow-sm",
								!isUnderline && !isActive && "text-darknavy/65 hover:bg-[rgb(var(--skyblue-rgb)/0.06)] hover:text-darknavy",
								tabClassName,
							)}
						>
							<span>{tab.label}</span>
							{tab.hasError ? (
								<span
									className="text-base font-bold text-coralpink"
									title="Contains validation errors"
								>
									<span aria-hidden="true">*</span>
									<span className="sr-only"> Contains validation errors</span>
								</span>
							) : null}
							{tab.badge ? (
								<span
									className={joinClasses(
										"inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
										isActive && isUnderline
											? "bg-skyblue/10 text-skyblue"
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
