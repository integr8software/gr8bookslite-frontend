import { useState } from "react";
import { PettyCashFundEntryTabs } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundEntryTab,
  PettyCashFundEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundAccountingEntryTable";
import { PettyCashFundDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundDetailEntryTable";

export function PettyCashFundEntrySection({ page }: PettyCashFundEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<PettyCashFundEntryTab>("items");

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div
          role="tablist"
          aria-label="Petty cash fund lines"
          className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
        >
          {PettyCashFundEntryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
                activeTab === tab.id
                  ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                  : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "accounting" ? (
        <PettyCashFundAccountingEntryTable page={page} />
      ) : (
        <PettyCashFundDetailEntryTable page={page} />
      )}
    </section>
  );
}
