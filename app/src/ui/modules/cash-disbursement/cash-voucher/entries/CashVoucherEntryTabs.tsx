import type { CashVoucherEntryView } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import { CashVoucherExpenseEntryView } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import { ModuleEntryTabs, type ModuleEntryTabItem } from "@/app/src/ui/shared/module/module-data-entry/ModuleEntryTabs";

type CashVoucherEntryTabsProps = {
  activeTab: CashVoucherEntryView;
  onTabChange: (tab: CashVoucherEntryView) => void;
};

export const CashVoucherAccountingEntryView: CashVoucherEntryView = "accounting";

export const CashVoucherEntryTabsList: readonly ModuleEntryTabItem<CashVoucherEntryView>[] = [
  { id: CashVoucherExpenseEntryView, label: "Disbursement Details" },
  { id: CashVoucherAccountingEntryView, label: "Accounting Entries" },
];

export function CashVoucherEntryTabs({ activeTab, onTabChange }: CashVoucherEntryTabsProps) {
  return (
    <ModuleEntryTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={CashVoucherEntryTabsList}
      ariaLabel="Cash voucher line entry sections"
    />
  );
}
