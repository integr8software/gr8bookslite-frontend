import { useState } from "react";
import { PettyCashFundReplenishmentEntryTabs } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import type {
  PettyCashFundReplenishmentEntryTab,
  PettyCashFundReplenishmentEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { PettyCashFundReplenishmentAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentAccountingEntryTable";
import { PettyCashFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentDetailEntryTable";

export function PettyCashFundReplenishmentEntrySection({
  page,
}: PettyCashFundReplenishmentEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<PettyCashFundReplenishmentEntryTab>("vouchers");

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div
          role="tablist"
          aria-label="Petty cash fund replenishment lines"
          className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
        >
          {PettyCashFundReplenishmentEntryTabs.map((tab) => (
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
        <PettyCashFundReplenishmentAccountingEntryTable page={page} />
      ) : (
        <PettyCashFundReplenishmentDetailEntryTable page={page} />
      )}
    </section>
  );
}
