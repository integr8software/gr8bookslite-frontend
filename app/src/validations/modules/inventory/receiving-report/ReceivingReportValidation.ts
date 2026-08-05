import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { RequiredReceivingReportFields } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import type {
  ReceivingReportFormValues,
  ReceivingReportLine,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import type { ReceivingReportFormErrors } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function validateReceivingReport(
  values: ReceivingReportFormValues,
): ReceivingReportFormErrors {
  const errors: ReceivingReportFormErrors = {};

  RequiredReceivingReportFields.forEach(({ field, message }) => {
    const value = values[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      errors[field] = message;
    }
  });

  if (!values.lines.some(receivingReportEntryIsComplete)) {
    errors.lines =
      "Add at least one received item with item code, item name, and RR quantity.";
  }

  return errors;
}

export function receivingReportEntryIsComplete(entry: ReceivingReportLine) {
  return (
    entry.itemCode.trim().length > 0 &&
    entry.description.trim().length > 0 &&
    parseMoneyNumberInput(entry.rrQty) > 0
  );
}
