import { useMemo, useState } from "react";
import {
  createBlankPettyCashVoucherItem,
  createPettyCashVoucherAccountingRows,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { usePettyCashVoucherEntryLookups } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherEntryLookups";
import type {
  PettyCashVoucherEntrySectionProps,
  PettyCashVoucherEntryTab,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { PettyCashVoucherAccountingEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherAccountingEntryTable";
import { PettyCashVoucherDetailEntryTable } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherDetailEntryTable";
import {
  PettyCashVoucherAccountingEntryView,
  PettyCashVoucherEntryTabs,
  PettyCashVoucherItemEntryView,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/entries/PettyCashVoucherEntryTabs";

export function PettyCashVoucherEntrySection({
  onOpenDisbursementTypeDrawer,
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  page,
}: PettyCashVoucherEntrySectionProps) {
  const [entryView, setEntryView] = useState<PettyCashVoucherEntryTab>(PettyCashVoucherItemEntryView);
  const {
    disbursementTypeOptions,
    ewtDefaultAccountOptions,
    ewtOptions,
    responsibilityCenterOptions,
    supplierOptions,
    taxCodes,
    vatDefaultAccountOptions,
    vatOptions,
  } = usePettyCashVoucherEntryLookups({ items: page.values.items });

  const accountingRows = useMemo(
    () =>
      createPettyCashVoucherAccountingRows(
        page.values.items,
        page.values.accountCode,
        page.values.accountTitle,
        disbursementTypeOptions,
        vatDefaultAccountOptions,
        ewtDefaultAccountOptions,
      ),
    [
      page.values.accountCode,
      page.values.accountTitle,
      page.values.items,
      disbursementTypeOptions,
      ewtDefaultAccountOptions,
      vatDefaultAccountOptions,
    ],
  );

  const accountingTotals = useMemo(
    () =>
      accountingRows.reduce(
        (totals, row) => ({
          debit: totals.debit + parseMoneyNumberInput(row.debit),
          credit: totals.credit + parseMoneyNumberInput(row.credit),
        }),
        { debit: 0, credit: 0 },
      ),
    [accountingRows],
  );
  const variance = Math.abs(accountingTotals.debit - accountingTotals.credit);
  const title = <PettyCashVoucherEntryTabs activeTab={entryView} onTabChange={setEntryView} />;

  if (entryView === PettyCashVoucherAccountingEntryView) {
    return (
      <PettyCashVoucherAccountingEntryTable
        rows={accountingRows}
        title={title}
        totalCredit={accountingTotals.credit}
        totalDebit={accountingTotals.debit}
        variance={variance}
      />
    );
  }

  return (
    <PettyCashVoucherDetailEntryTable
      disbursementTypeOptions={disbursementTypeOptions}
      errors={page.errors}
      ewtOptions={ewtOptions}
      isReadonly={page.isReadonly}
      items={page.values.items}
      onAddItems={page.addItems}
      onClearItems={() => page.updateItems([createBlankPettyCashVoucherItem()])}
      onDuplicateItem={page.duplicateItem}
      onInsertItem={page.insertItem}
      onMoveItem={page.moveItem}
      onRemoveItem={page.removeItem}
      onUpdateItem={page.updateItem}
      onUpdateItems={page.updateItems}
      responsibilityCenterOptions={responsibilityCenterOptions}
      supplierOptions={supplierOptions}
      taxCodes={taxCodes}
      totals={page.totals}
      title={title}
      vatOptions={vatOptions}
      onOpenDisbursementTypeDrawer={onOpenDisbursementTypeDrawer}
      onOpenResponsibilityCenterDrawer={onOpenResponsibilityCenterDrawer}
      onOpenSupplierDrawer={onOpenSupplierDrawer}
    />
  );
}
