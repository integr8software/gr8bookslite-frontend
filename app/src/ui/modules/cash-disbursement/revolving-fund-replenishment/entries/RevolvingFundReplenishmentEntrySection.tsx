import { useState } from "react";
import { RevolvingFundReplenishmentEntryTabs } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type {
  RevolvingFundReplenishmentEntryTab,
  RevolvingFundReplenishmentEntrySectionProps,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { RevolvingFundReplenishmentAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentAccountingEntryTable";
import { RevolvingFundReplenishmentDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentDetailEntryTable";
import { ModuleDataEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";

export function RevolvingFundReplenishmentEntrySection({
  page,
}: RevolvingFundReplenishmentEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<RevolvingFundReplenishmentEntryTab>("vouchers");

  return (
    <ModuleDataEntryTabs
      activeTab={activeTab}
      ariaLabel="Revolving fund replenishment lines"
      onTabChange={setActiveTab}
      tabs={RevolvingFundReplenishmentEntryTabs}
    >
      {activeTab === "accounting" ? (
        <RevolvingFundReplenishmentAccountingEntryTable page={page} />
      ) : (
        <RevolvingFundReplenishmentDetailEntryTable page={page} />
      )}
    </ModuleDataEntryTabs>
  );
}
