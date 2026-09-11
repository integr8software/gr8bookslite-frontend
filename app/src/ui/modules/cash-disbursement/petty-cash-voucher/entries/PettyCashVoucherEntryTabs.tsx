import { PettyCashVoucherEntryTabs as PettyCashVoucherEntryTabsList } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherEntryTab } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { ModuleEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleEntryTabs";

type PettyCashVoucherEntryTabsProps = {
  activeTab: PettyCashVoucherEntryTab;
  onTabChange: (tab: PettyCashVoucherEntryTab) => void;
};

export const PettyCashVoucherAccountingEntryView: PettyCashVoucherEntryTab = "accounting";
export const PettyCashVoucherItemEntryView: PettyCashVoucherEntryTab = "items";

export function PettyCashVoucherEntryTabs({ activeTab, onTabChange }: PettyCashVoucherEntryTabsProps) {
  return (
    <ModuleEntryTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={PettyCashVoucherEntryTabsList}
      ariaLabel="Petty cash voucher entry sections"
    />
  );
}
