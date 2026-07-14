"use client";

import { useId, useState, type ReactNode } from "react";

export type AppTabItem = {
	badge?: number;
	content: ReactNode;
	id: string;
	label: string;
};

export function AppTabs({
	ariaLabel,
	tabs,
}: {
	ariaLabel: string;
	tabs: AppTabItem[];
}) {
	const generatedId = useId();
	const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
	const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

	if (!activeTab) {
		return null;
	}

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div
				className="flex gap-1 overflow-x-auto border-b border-darknavy/15 bg-slate-50/60 px-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				role="tablist"
				aria-label={ariaLabel}
			>
				{tabs.map((tab) => {
					const isActive = tab.id === activeTab.id;
					const tabId = `${generatedId}-${tab.id}-tab`;
					const panelId = `${generatedId}-${tab.id}-panel`;

					return (
						<button
							key={tab.id}
							id={tabId}
							type="button"
							role="tab"
							aria-controls={panelId}
							aria-selected={isActive}
							onClick={() => setActiveTabId(tab.id)}
							className={[
								"-mb-px inline-flex h-11 shrink-0 items-center gap-2 rounded-t-md border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25",
								isActive
									? "border-darknavy/15 border-b-white bg-white text-darknavy shadow-sm"
									: "border-transparent bg-transparent text-darknavy/55 hover:border-darknavy/10 hover:bg-white/80 hover:text-darknavy",
							].join(" ")}
						>
							<span>{tab.label}</span>
							{tab.badge ? (
								<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-coralpink/10 px-1.5 text-xs font-semibold text-coralpink">
									{tab.badge}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
			<div
				id={`${generatedId}-${activeTab.id}-panel`}
				role="tabpanel"
				aria-labelledby={`${generatedId}-${activeTab.id}-tab`}
				className="p-4 sm:p-5"
			>
				{activeTab.content}
			</div>
		</div>
	);
}
