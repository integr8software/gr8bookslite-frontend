import type { DisbursementEntryView } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import { DisbursementVoucherExpenseEntryView } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import { ModuleEntryTabs, type ModuleEntryTabItem } from "@/app/src/ui/shared/module/module-data-entry/ModuleEntryTabs";

type DisbursementVoucherEntryTabsProps = {
  activeTab: DisbursementEntryView;
  onTabChange: (tab: DisbursementEntryView) => void;
};

export const DisbursementVoucherAccountingEntryView: DisbursementEntryView = "accounting";

export const DisbursementVoucherEntryTabsList: readonly ModuleEntryTabItem<DisbursementEntryView>[] = [
  { id: DisbursementVoucherExpenseEntryView, label: "Disbursement Details" },
  { id: DisbursementVoucherAccountingEntryView, label: "Accounting Entries" },
];

export function DisbursementVoucherEntryTabs({ activeTab, onTabChange }: DisbursementVoucherEntryTabsProps) {
  return (
    <ModuleEntryTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={DisbursementVoucherEntryTabsList}
      ariaLabel="Disbursement voucher line entry sections"
    />
  );
}
