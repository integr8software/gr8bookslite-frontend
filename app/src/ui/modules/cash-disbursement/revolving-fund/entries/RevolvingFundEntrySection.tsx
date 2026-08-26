import { useState } from "react";
import { RevolvingFundEntryTabs } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundEntryTab,
  RevolvingFundEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { RevolvingFundAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundAccountingEntryTable";
import { RevolvingFundDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundDetailEntryTable";
import { ModuleDataEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";

export function RevolvingFundEntrySection({ page }: RevolvingFundEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<RevolvingFundEntryTab>("items");

  return (
    <ModuleDataEntryTabs
      activeTab={activeTab}
      ariaLabel="Revolving fund lines"
      onTabChange={setActiveTab}
      tabs={RevolvingFundEntryTabs}
    >
      {activeTab === "accounting" ? (
        <RevolvingFundAccountingEntryTable page={page} />
      ) : (
        <RevolvingFundDetailEntryTable page={page} />
      )}
    </ModuleDataEntryTabs>
  );
}
