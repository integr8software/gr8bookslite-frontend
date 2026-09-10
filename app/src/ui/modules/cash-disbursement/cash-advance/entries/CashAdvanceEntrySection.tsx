import { useCashAdvanceEmployeeOptions } from "@/app/src/hooks/modules/party-management/useCashAdvanceEmployeeOptions";
import type { CashAdvanceEntrySectionProps } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-advance/entries/CashAdvanceDetailEntryTable";

export function CashAdvanceEntrySection({
  isReadonly,
  onAddRows,
  onOpenItemResponsibilityCenterDrawer,
  onOpenItemPartyDrawer,
  onRowsChange,
  responsibilityCenterOptions = [],
  rows,
}: CashAdvanceEntrySectionProps) {
  const { employeeOptions } = useCashAdvanceEmployeeOptions("cash-advance");

  return (
    <CashAdvanceDetailEntryTable
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
