import { useState } from "react";
import { PettyCashFundReplenishmentEntryTabs } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import type {
  PettyCashFundReplenishmentEntryTab,
  PettyCashFundReplenishmentEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { PettyCashFundReplenishmentAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentAccountingEntryTable";
import { PettyCashFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentDetailEntryTable";
import { ModuleDataEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";

export function PettyCashFundReplenishmentEntrySection({
  page,
}: PettyCashFundReplenishmentEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<PettyCashFundReplenishmentEntryTab>("vouchers");

  return (
    <ModuleDataEntryTabs
      activeTab={activeTab}
      ariaLabel="Petty cash fund replenishment lines"
      onTabChange={setActiveTab}
      tabs={PettyCashFundReplenishmentEntryTabs}
    >
      {activeTab === "accounting" ? (
        <PettyCashFundReplenishmentAccountingEntryTable page={page} />
      ) : (
        <PettyCashFundReplenishmentDetailEntryTable page={page} />
      )}
    </ModuleDataEntryTabs>
  );
}
