"use client";

import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTabItem<TabId extends string> = {
	badge?: number;
	id: TabId;
	label: string;
};

type ModuleTabsProps<TabId extends string> = {
	activeTab: TabId;
	ariaLabel: string;
	onTabChange: (tab: TabId) => void;
	tabClassName?: string;
	tabs: readonly ModuleTabItem<TabId>[];
};

export function ModuleTabs<TabId extends string>({
	activeTab,
	ariaLabel,
	onTabChange,
	tabClassName,
	tabs,
}: ModuleTabsProps<TabId>) {
	return (
		<div className="overflow-x-auto rounded-lg border border-darknavy/10 bg-white p-1 shadow-sm shadow-darknavy/5 [scrollbar-color:rgb(var(--skyblue-rgb)_/_0.45)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-skyblue/45 hover:[&::-webkit-scrollbar-thumb]:bg-skyblue/70">
			<div role="tablist" aria-label={ariaLabel} className="flex min-w-max gap-1">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;

					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							onClick={() => onTabChange(tab.id)}
							className={joinClasses(
								"inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25",
								isActive
									? "bg-skyblue text-white shadow-sm"
									: "text-darknavy/65 hover:bg-offwhite hover:text-darknavy",
								tabClassName,
							)}
						>
							<span>{tab.label}</span>
							{tab.badge ? (
								<span
									className={joinClasses(
										"inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
										isActive
											? "bg-white/20 text-white"
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
