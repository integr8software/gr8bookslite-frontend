import { z } from "zod";
import type {
  RequestForPaymentFormErrors,
  RequestForPaymentFormValues,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { parseAmount } from "@/app/src/utils/number.util";

const schema = z.object({
  transactionNo: z.string().regex(/^RFP-\d{6}$/, "A valid RFP No. is required."),
  documentDate: z.string().min(1, "Select an RFP Date."),
  dateNeeded: z.string().min(1, "Select Date Needed."),
  partyCode: z.string().trim().min(1, "Select a Payee."),
  partyName: z.string().trim().min(1, "Select a Payee."),
  paymentMethod: z.enum(["Check", "Cash", "Bank Transfer", "Online"]),
});

export function validateRequestForPaymentForm(values: RequestForPaymentFormValues): RequestForPaymentFormErrors {
  const errors: RequestForPaymentFormErrors = {};
  const result = schema.safeParse(values);

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0] as keyof RequestForPaymentFormValues] ??= issue.message;
    }
  }

  if (values.documentDate && values.dateNeeded && values.dateNeeded < values.documentDate) {
    errors.dateNeeded = "Date Needed cannot be earlier than Document Date.";
  }

  if (
    values.items.length === 0 ||
    values.items.every((item) => !item.particulars.trim() && (parseAmount(item.amount) ?? 0) <= 0)
  ) {
    errors.items = "Add at least one payment request item.";
  } else if (values.items.some((item) => !item.particulars.trim() || (parseAmount(item.amount) ?? 0) <= 0)) {
    errors.items = "Each item needs particulars and an amount greater than zero.";
  }

  return errors;
}
