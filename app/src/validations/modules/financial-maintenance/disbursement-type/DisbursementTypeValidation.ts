import type {
  DisbursementTypeFormErrors,
  DisbursementTypeFormValues,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypes";

export function validateDisbursementTypeForm(values: DisbursementTypeFormValues): DisbursementTypeFormErrors {
  const errors: DisbursementTypeFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.type) {
    errors.type = "Type is required.";
  }

  if (!values.status) {
    errors.status = "Status is required.";
  }

  return errors;
}
