import { z } from "zod";
import type {
  CashVoucherEntryDraft,
  CashVoucherFormErrors,
  CashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

const CashVoucherDateValidationSchema = z.string().trim().min(1, "Select a CV Date.");

export function validateCashVoucherDetails(values: CashVoucherFormValues) {
  const errors: CashVoucherFormErrors = {};
  const voucherDateResult = CashVoucherDateValidationSchema.safeParse(values.voucherDate);

  if (!voucherDateResult.success) {
    errors.voucherDate = voucherDateResult.error.issues[0]?.message;
  }

  if (!values.partyCode.trim()) {
    errors.partyCode = "Party Code is required.";
  }

  if (!values.partyName.trim()) {
    errors.partyName = "Party Name is required.";
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
    errors.lineEntries = "Each line needs an Account Title, Account Code, and either a Debit or Credit Amount.";
  } else if (values.lineEntries.some(entryHasBothDebitAndCredit)) {
    errors.lineEntries = "Each line can only carry a Debit or Credit Amount.";
  } else if (totalDebit <= 0 || totalCredit <= 0) {
    errors.lineEntries = "Entries must include both Debit and Credit values.";
  } else if (Math.abs(totalDebit - totalCredit) > 0.001) {
    errors.lineEntries = "Debit and Credit totals must balance before review.";
  }

  return errors;
}

export function validateCashVoucherEntryDraft(draft: CashVoucherEntryDraft) {
  if (!draft.accountCode.trim()) {
    return "Account Code is required.";
  }

  if (!draft.accountName.trim()) {
    return "Account Title is required.";
  }

  const debit = parseMoneyNumberInput(draft.debit);
  const credit = parseMoneyNumberInput(draft.credit);

  if (debit <= 0 && credit <= 0) {
    return "Enter a Debit or Credit Amount.";
  }

  if (debit > 0 && credit > 0) {
    return "Each line can only carry a Debit or Credit Amount.";
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


