"use client";

import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTabItem<TabId extends string> = {
	id: TabId;
	label: string;
};

type ModuleTabsProps<TabId extends string> = {
	activeTab: TabId;
	ariaLabel: string;
	onTabChange: (tab: TabId) => void;
	tabs: readonly ModuleTabItem<TabId>[];
};

export function ModuleTabs<TabId extends string>({
	activeTab,
	ariaLabel,
	onTabChange,
	tabs,
}: ModuleTabsProps<TabId>) {
	return (
		<div className="overflow-x-auto rounded-lg border border-darknavy/10 bg-white p-1 shadow-sm shadow-darknavy/5">
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
								"h-10 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
								isActive
									? "bg-skyblue text-white shadow-sm"
									: "text-darknavy/65 hover:bg-offwhite hover:text-darknavy",
							)}
						>
							{tab.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
