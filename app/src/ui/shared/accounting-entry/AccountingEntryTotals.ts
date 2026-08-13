import type { AccountingEntry, AccountingEntryAmount, AccountingEntryTotals } from "@/app/src/types/shared/accounting/AccountingEntryTypes";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

export function getAccountingEntryTotals<TRow extends AccountingEntry>(rows: TRow[]): AccountingEntryTotals {
  const totals = rows.reduce(
    (summary, row) => ({
      credit: summary.credit + toAmount(row.credit),
      debit: summary.debit + toAmount(row.debit),
    }),
    { credit: 0, debit: 0 },
  );
  const difference = Number((totals.debit - totals.credit).toFixed(2));

  return {
    ...totals,
    difference,
    isBalanced: difference === 0,
  };
}

export function toAccountingEntryAmount(value: AccountingEntryAmount): number {
  return parseMoneyNumberInput(String(value));
}

function toAmount(value: AccountingEntryAmount) {
  return toAccountingEntryAmount(value);
}
