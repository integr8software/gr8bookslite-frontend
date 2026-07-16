import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  SalesInvoiceFormValues,
  SalesInvoiceLineItem,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export type SalesInvoiceValidationResult = {
  message?: string;
  isValid: boolean;
};

export function validateSalesInvoiceForm(
  values: SalesInvoiceFormValues,
): SalesInvoiceValidationResult {
  if (!values.vceCode.trim() && !values.vceName.trim()) {
    return { isValid: false, message: "Select a party code or party name." };
  }

  if (!values.transNo.trim()) {
    return { isValid: false, message: "Enter the transaction number." };
  }

  if (!values.documentDate.trim()) {
    return { isValid: false, message: "Enter the document date." };
  }

  if (!values.lineItems.some(salesInvoiceLineHasAmount)) {
    return {
      isValid: false,
      message: "Add at least one invoice line with quantity and unit price.",
    };
  }

  return { isValid: true };
}

function salesInvoiceLineHasAmount(item: SalesInvoiceLineItem) {
  return (
    parseMoneyNumberInput(item.quantity) > 0 &&
    parseMoneyNumberInput(item.price) > 0
  );
}
