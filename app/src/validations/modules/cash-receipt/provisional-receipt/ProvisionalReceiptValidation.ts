import { validateOfficialReceiptForm } from "@/app/src/validations/modules/cash-receipt/official-receipt/OfficialReceiptValidation";
import type { ProvisionalReceiptFormValues } from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";

export function validateProvisionalReceiptForm(values: ProvisionalReceiptFormValues) {
  return validateOfficialReceiptForm(values);
}
