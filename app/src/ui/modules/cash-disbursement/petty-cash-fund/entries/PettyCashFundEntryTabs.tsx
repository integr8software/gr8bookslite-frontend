import { PettyCashFundEntryTabs as EntryTabs } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type { PettyCashFundEntryTab } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";

export function PettyCashFundEntryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: PettyCashFundEntryTab;
  onTabChange: (tab: PettyCashFundEntryTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Petty cash fund entry sections"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {EntryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25 ${activeTab === tab.id ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10" : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
