import { useState } from "react";
import { CashAdvanceMultipleEntryEntryTabs } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { useCashAdvanceEmployeeOptions } from "@/app/src/hooks/modules/party-management/useCashAdvanceEmployeeOptions";
import type {
  CashAdvanceMultipleEntryEntrySectionProps,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { CashAdvanceMultipleEntryAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryAccountingEntryTable";
import { CashAdvanceMultipleEntryDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryDetailEntryTable";
import { ModuleDataEntryTabs } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTabs";

export function CashAdvanceMultipleEntryEntrySection({
  accountingRows,
  isReadonly,
  onAccountingRowsChange,
  onAddAccountingRows,
  onAddRows,
  onOpenAccountingPartyDrawer,
  onOpenAccountingResponsibilityCenterDrawer,
  onOpenItemResponsibilityCenterDrawer,
  onOpenItemPartyDrawer,
  responsibilityCenterOptions,
  onRowsChange,
  rows,
}: CashAdvanceMultipleEntryEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<CashAdvanceMultipleEntryTab>("items");
  const { employeeOptions } = useCashAdvanceEmployeeOptions("cash-advance-multiple-entry");

  return (
    <ModuleDataEntryTabs
      activeTab={activeTab}
      ariaLabel="Cash advance multiple entry lines"
      onTabChange={setActiveTab}
      tabs={CashAdvanceMultipleEntryEntryTabs}
    >
      {activeTab === "accounting" ? (
        <CashAdvanceMultipleEntryAccountingEntryTable
          employeeOptions={employeeOptions}
          isReadonly={isReadonly}
          onAddRows={onAddAccountingRows}
          onOpenPartyDrawer={onOpenAccountingPartyDrawer}
          onOpenResponsibilityCenterDrawer={onOpenAccountingResponsibilityCenterDrawer}
          onRowsChange={onAccountingRowsChange}
          responsibilityCenterOptions={responsibilityCenterOptions}
          rows={accountingRows}
        />
      ) : (
        <CashAdvanceMultipleEntryDetailEntryTable
          employeeOptions={employeeOptions}
          isReadonly={isReadonly}
          onAddRows={onAddRows}
          onOpenPartyDrawer={onOpenItemPartyDrawer}
          onOpenResponsibilityCenterDrawer={onOpenItemResponsibilityCenterDrawer}
          onRowsChange={onRowsChange}
          rows={rows}
        />
      )}
    </ModuleDataEntryTabs>
  );
}
