import type { GoodsReceiptEntryTab } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type GoodsReceiptEntryTabsProps = {
	activeTab: GoodsReceiptEntryTab;
	onTabChange: (tab: GoodsReceiptEntryTab) => void;
};

export function GoodsReceiptEntryTabs({
	activeTab,
	onTabChange,
}: GoodsReceiptEntryTabsProps) {
	return (
		<div
			role="tablist"
			aria-label="Goods receipt row entry sections"
			className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
		>
			{GoodsReceiptEntryTabsList.map((tab) => {
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

const GoodsReceiptEntryTabsList = [
	{ id: "goods", label: "Goods Receipt Details" },
	{ id: "accounting", label: "Accounting Entries" },
] satisfies Array<{
	id: GoodsReceiptEntryTab;
	label: string;
}>;
