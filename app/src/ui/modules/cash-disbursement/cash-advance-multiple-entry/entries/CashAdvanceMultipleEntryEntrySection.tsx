import { useState } from "react";
import { CashAdvanceMultipleEntryEntryTabs } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { useCashAdvanceEmployeeOptions } from "@/app/src/hooks/modules/party-management/useCashAdvanceEmployeeOptions";
import type {
  CashAdvanceMultipleEntryEntrySectionProps,
  CashAdvanceMultipleEntryTab,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { CashAdvanceMultipleEntryAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryAccountingEntryTable";
import { CashAdvanceMultipleEntryDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/entries/CashAdvanceMultipleEntryDetailEntryTable";

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
  const { employeeOptions, isEmployeeOptionsEmpty, isEmployeeOptionsError, isEmployeeOptionsLoading } =
    useCashAdvanceEmployeeOptions("cash-advance-multiple-entry");
  const employeeOptionsState = isEmployeeOptionsLoading
    ? "Loading employee lookup options…"
    : isEmployeeOptionsError
      ? "Employee lookup options could not be loaded."
      : isEmployeeOptionsEmpty
        ? "No employee lookup options are available."
        : "";

  return (
    <section className="grid gap-4">
      <div
        role="tablist"
        aria-label="Cash advance multiple entry lines"
        className="inline-flex w-fit rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
      >
        {CashAdvanceMultipleEntryEntryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              activeTab === tab.id
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "accounting" ? (
        <CashAdvanceMultipleEntryAccountingEntryTable
          description={employeeOptionsState}
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
          description={employeeOptionsState}
          employeeOptions={employeeOptions}
          isReadonly={isReadonly}
          onAddRows={onAddRows}
          onOpenPartyDrawer={onOpenItemPartyDrawer}
          onOpenResponsibilityCenterDrawer={onOpenItemResponsibilityCenterDrawer}
          onRowsChange={onRowsChange}
          rows={rows}
        />
      )}
    </section>
  );
}
