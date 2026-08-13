import type {
  BillingStatementFormErrors,
  BillingStatementFormValues,
  BillingStatementItem,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

export function validateBillingStatementForm(
  values: BillingStatementFormValues,
): BillingStatementFormErrors {
  const errors: BillingStatementFormErrors = {};

  if (!values.code.trim()) errors.code = "Enter a customer code.";
  if (!values.name.trim()) errors.name = "Enter a customer name.";
  if (!values.transNo.trim()) errors.transNo = "Enter a transaction number.";
  if (!values.documentDate.trim()) errors.documentDate = "Select a document date.";
  if (!values.defaultAccount.trim() || values.defaultAccount.startsWith("--Select")) {
    errors.defaultAccount = "Select a default account.";
  }
  if (!values.items.some(billingStatementItemIsComplete)) {
    errors.items = "Add at least one billing line with description, amount, and quantity.";
  }

  return errors;
}

function billingStatementItemIsComplete(item: BillingStatementItem) {
  return Boolean(
    item.description.trim() &&
      (Number(item.amount) > 0 || Number(item.netAmount) > 0) &&
      Number(item.quantity) >= 0,
  );
}
