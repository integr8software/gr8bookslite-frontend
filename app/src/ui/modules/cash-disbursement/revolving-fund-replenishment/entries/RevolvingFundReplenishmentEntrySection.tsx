import { useState } from "react";
import { RevolvingFundReplenishmentEntryTabs } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type {
  RevolvingFundReplenishmentEntryTab,
  RevolvingFundReplenishmentEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentAccountingEntryTable";
import { RevolvingFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentDetailEntryTable";

export function RevolvingFundReplenishmentEntrySection({
  page,
}: RevolvingFundReplenishmentEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<RevolvingFundReplenishmentEntryTab>("vouchers");

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div
          role="tablist"
          aria-label="Revolving fund replenishment lines"
          className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
        >
          {RevolvingFundReplenishmentEntryTabs.map((tab) => (
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
        <RevolvingFundReplenishmentAccountingEntryTable page={page} />
      ) : (
        <RevolvingFundReplenishmentDetailEntryTable page={page} />
      )}
    </section>
  );
}
