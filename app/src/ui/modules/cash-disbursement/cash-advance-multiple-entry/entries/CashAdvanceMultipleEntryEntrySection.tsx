import { useCashAdvanceEmployeeOptions } from "@/app/src/hooks/modules/party-management/useCashAdvanceEmployeeOptions";
import type { CashAdvanceMultipleEntryEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { CashAdvanceMultipleEntryDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryDetailEntryTable";

export function CashAdvanceMultipleEntryEntrySection({
  isReadonly,
  onAddRows,
  onOpenItemResponsibilityCenterDrawer,
  onOpenItemPartyDrawer,
  onRowsChange,
  responsibilityCenterOptions = [],
  rows,
}: CashAdvanceMultipleEntryEntrySectionProps) {
  const { employeeOptions } = useCashAdvanceEmployeeOptions("cash-advance-multiple-entry");

  return (
    <CashAdvanceMultipleEntryDetailEntryTable
      employeeOptions={employeeOptions}
      isReadonly={isReadonly}
      onAddRows={onAddRows}
      onOpenPartyDrawer={onOpenItemPartyDrawer}
      onOpenResponsibilityCenterDrawer={onOpenItemResponsibilityCenterDrawer}
      responsibilityCenterOptions={responsibilityCenterOptions}
      onRowsChange={onRowsChange}
      rows={rows}
    />
  );
}
