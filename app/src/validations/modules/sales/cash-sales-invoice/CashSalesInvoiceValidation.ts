import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { CashSalesInvoiceFormValues } from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";

export function validateCashSalesInvoiceForm(values: CashSalesInvoiceFormValues) {
  if (!values.partyCode.trim()) {
    return { isValid: false, message: "Enter a party code." };
  }

  if (!values.partyName.trim()) {
    return { isValid: false, message: "Enter a party name." };
  }

  if (!values.transNo.trim()) {
    return { isValid: false, message: "Enter a transaction number." };
  }

  if (!values.sjNo.trim()) {
    return { isValid: false, message: "Enter an SJ number." };
  }

  if (!values.drNo.trim()) {
    return { isValid: false, message: "Enter a DR number." };
  }

  if (!values.warehouse.trim()) {
    return { isValid: false, message: "Select a warehouse." };
  }

  if (!values.defaultAccount.trim()) {
    return { isValid: false, message: "Select a default account." };
  }

  const hasLine = values.lineEntries.some(
    (entry) =>
      entry.description.trim() !== "" &&
      parseMoneyNumberInput(entry.grossAmount) > 0,
  );

  if (!hasLine) {
    return { isValid: false, message: "Add at least one cash sales invoice line." };
  }

  return { isValid: true };
}
