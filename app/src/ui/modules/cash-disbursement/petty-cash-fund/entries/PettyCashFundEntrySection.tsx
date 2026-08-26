import { useState } from "react";
import { PettyCashFundEntryTabs } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundEntryTab,
  PettyCashFundEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { PettyCashFundAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundAccountingEntryTable";
import { PettyCashFundDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundDetailEntryTable";
import { ModuleDataEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";

export function PettyCashFundEntrySection({ page }: PettyCashFundEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<PettyCashFundEntryTab>("items");

  return (
    <ModuleDataEntryTabs
      activeTab={activeTab}
      ariaLabel="Petty cash fund lines"
      onTabChange={setActiveTab}
      tabs={PettyCashFundEntryTabs}
    >
      {activeTab === "accounting" ? (
        <PettyCashFundAccountingEntryTable page={page} />
      ) : (
        <PettyCashFundDetailEntryTable page={page} />
      )}
    </ModuleDataEntryTabs>
  );
}
