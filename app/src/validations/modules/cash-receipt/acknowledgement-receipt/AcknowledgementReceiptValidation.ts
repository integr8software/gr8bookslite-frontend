import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AcknowledgementReceiptFormValues,
  AcknowledgementReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";

export type AcknowledgementReceiptValidationResult = {
  message?: string;
  isValid: boolean;
};

export function validateAcknowledgementReceiptForm(values: AcknowledgementReceiptFormValues): AcknowledgementReceiptValidationResult {
  if (!values.paymentType.trim()) {
    return { isValid: false, message: "Select a payment type." };
  }

  if (!values.customerName.trim()) {
    return { isValid: false, message: "Select a party name." };
  }

  if (!values.receiptNo.trim()) {
    return { isValid: false, message: "Enter the transaction number." };
  }

  if (!values.receiptDate.trim()) {
    return { isValid: false, message: "Enter the document date." };
  }

  if (!values.lineEntries.some(acknowledgementReceiptEntryHasPostableAmount)) {
    return {
      isValid: false,
      message: "Add at least one receipt entry with an amount.",
    };
  }

  return { isValid: true };
}

function acknowledgementReceiptEntryHasPostableAmount(entry: AcknowledgementReceiptLineEntry) {
  return parseMoneyNumberInput(entry.grossReceipt) > 0 || parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0;
}
