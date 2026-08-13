import type { GoodsIssueEntryTab } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type GoodsIssueEntryTabsProps = {
  activeTab: GoodsIssueEntryTab;
  onTabChange: (tab: GoodsIssueEntryTab) => void;
};

export function GoodsIssueEntryTabs({ activeTab, onTabChange }: GoodsIssueEntryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Goods issue row entry sections"
      className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {GoodsIssueEntryTabsList.map((tab) => {
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

const GoodsIssueEntryTabsList = [
  { id: "goods", label: "Goods Issue Details" },
  { id: "accounting", label: "Accounting Entries" },
] satisfies Array<{ id: GoodsIssueEntryTab; label: string }>;
