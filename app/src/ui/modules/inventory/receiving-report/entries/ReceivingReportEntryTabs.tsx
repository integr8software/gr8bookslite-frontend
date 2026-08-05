import {
  ReceivingReportEntryTabsList,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type { ReceivingReportEntryTab } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportEntryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ReceivingReportEntryTab;
  onTabChange: (tab: ReceivingReportEntryTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Receiving report row entry sections"
      className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {ReceivingReportEntryTabsList.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={joinClasses(
              "h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
