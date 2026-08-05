import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type DeliveryReceiptEntryTab = "accounting" | "delivery";

type DeliveryReceiptEntryTabsProps = {
	activeTab: DeliveryReceiptEntryTab;
	onTabChange: (tab: DeliveryReceiptEntryTab) => void;
};

export function DeliveryReceiptEntryTabs({
	activeTab,
	onTabChange,
}: DeliveryReceiptEntryTabsProps) {
	return (
		<div
			role="tablist"
			aria-label="Delivery receipt row entry sections"
			className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
		>
			{DeliveryReceiptEntryTabsList.map((tab) => {
				const isActive = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onTabChange(tab.id)}
						className={joinClasses(
							"h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25",
							isActive
								? "bg-white text-skyblue shadow-sm ring-1 ring-skyblue/25"
								: "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
						)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

const DeliveryReceiptEntryTabsList = [
	{ id: "delivery", label: "Delivery Details" },
	{ id: "accounting", label: "Accounting Entries" },
] satisfies Array<{
	id: DeliveryReceiptEntryTab;
	label: string;
}>;
