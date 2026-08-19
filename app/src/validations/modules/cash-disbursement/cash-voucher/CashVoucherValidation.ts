import type {
  CashVoucherEntryDraft,
  CashVoucherFormErrors,
  CashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

export function validateCashVoucherDetails(values: CashVoucherFormValues) {
  const errors: CashVoucherFormErrors = {};

  if (!values.partyCode.trim()) {
    errors.partyCode = "Party code is required.";
  }

  if (!values.partyName.trim()) {
    errors.partyName = "Party name is required.";
  }

  return errors;
}

export function validateCashVoucherEntries(values: CashVoucherFormValues) {
  const errors: CashVoucherFormErrors = {};
  const totalDebit = values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0);

  if (values.lineEntries.length < 2) {
    errors.lineEntries = "Add at least two line entries.";
  } else if (values.lineEntries.some(entryHasMissingRequiredFields)) {
    errors.lineEntries = "Each line needs an account title, account code, and either a debit or credit amount.";
  } else if (values.lineEntries.some(entryHasBothDebitAndCredit)) {
    errors.lineEntries = "Each line can only carry a debit or a credit amount.";
  } else if (totalDebit <= 0 || totalCredit <= 0) {
    errors.lineEntries = "Entries must include both debit and credit values.";
  } else if (Math.abs(totalDebit - totalCredit) > 0.001) {
    errors.lineEntries = "Debit and credit totals must balance before review.";
  }

  return errors;
}

export function validateCashVoucherEntryDraft(draft: CashVoucherEntryDraft) {
  if (!draft.accountCode.trim()) {
    return "Account code is required.";
  }

  if (!draft.accountName.trim()) {
    return "Account title is required.";
  }

  const debit = parseMoneyNumberInput(draft.debit);
  const credit = parseMoneyNumberInput(draft.credit);

  if (debit <= 0 && credit <= 0) {
    return "Enter a debit or credit amount.";
  }

  if (debit > 0 && credit > 0) {
    return "Each line can only carry a debit or a credit amount.";
  }

  return undefined;
}

function entryHasMissingRequiredFields(entry: CashVoucherFormValues["lineEntries"][number]) {
  const debit = parseMoneyNumberInput(entry.debit);
  const credit = parseMoneyNumberInput(entry.credit);

  return !entry.accountName.trim() || !entry.accountCode.trim() || (debit <= 0 && credit <= 0);
}

function entryHasBothDebitAndCredit(entry: CashVoucherFormValues["lineEntries"][number]) {
  return parseMoneyNumberInput(entry.debit) > 0 && parseMoneyNumberInput(entry.credit) > 0;
}


