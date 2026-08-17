import { validateOfficialReceiptForm } from "@/app/src/validations/modules/cash-receipt/official-receipt/OfficialReceiptValidation";
import type { CollectionReceiptFormValues } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

export function validateCollectionReceiptForm(values: CollectionReceiptFormValues) {
  return validateOfficialReceiptForm(values);
}
