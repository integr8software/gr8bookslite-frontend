import { z } from "zod";
import {
  ServicesMaintenanceAccountSetupModeOptions,
  ServicesMaintenanceServiceTypeOptions,
  ServicesMaintenanceStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import type {
  ServicesMaintenance,
  ServicesMaintenanceFormErrors,
  ServicesMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";

type ServicesMaintenanceValidationOptions = {
  excludedServiceId?: string;
  services?: ServicesMaintenance[];
};

const ServicesMaintenanceFormSchema = z
  .object({
    serviceName: z.string().trim().min(1, "Service name is required.").max(150, "Service name must be 150 characters or fewer."),
    serviceType: z.enum(ServicesMaintenanceServiceTypeOptions),
    description: z.string().trim().max(500, "Description can only be up to 500 characters."),
    status: z.enum(ServicesMaintenanceStatusOptions),
    accountSetupMode: z.enum(ServicesMaintenanceAccountSetupModeOptions),
    revenueCoaId: z.string(),
    expenseParentCoaId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.accountSetupMode === "Existing" && !values.revenueCoaId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account title is required.",
        path: ["revenueCoaId"],
      });
    }

    if (
      values.serviceType === "Purchase of Service" &&
      values.accountSetupMode === "Auto" &&
      !values.expenseParentCoaId?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expense type is required.",
        path: ["expenseParentCoaId"],
      });
    }
  });

export function validateServicesMaintenanceForm(
  values: ServicesMaintenanceFormValues,
  options: ServicesMaintenanceValidationOptions = {},
): ServicesMaintenanceFormErrors {
  const parsed = ServicesMaintenanceFormSchema.safeParse(values);
  const errors: ServicesMaintenanceFormErrors = {};

  if (parsed.success) {
    const normalizedName = normalizeLowercaseWhitespace(values.serviceName);
    const hasDuplicateName = options.services?.some(
      (service) => service.id !== options.excludedServiceId && normalizeLowercaseWhitespace(service.serviceName) === normalizedName,
    );

    if (hasDuplicateName) {
      errors.serviceName = "A service with this name already exists.";
    }

    return errors;
  }

  for (const issue of parsed.error.issues) {
    const field = issue.path[0];

    if (isServicesMaintenanceField(field) && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  if (!errors.serviceName) {
    const normalizedName = normalizeLowercaseWhitespace(values.serviceName);
    const hasDuplicateName = options.services?.some(
      (service) => service.id !== options.excludedServiceId && normalizeLowercaseWhitespace(service.serviceName) === normalizedName,
    );

    if (hasDuplicateName) {
      errors.serviceName = "A service with this name already exists.";
    }
  }

  return errors;
}

function isServicesMaintenanceField(value: unknown): value is keyof ServicesMaintenanceFormValues {
  return (
    typeof value === "string" &&
    [
      "serviceName",
      "serviceType",
      "description",
      "status",
      "accountSetupMode",
      "revenueCoaId",
      "expenseParentCoaId",
    ].includes(value)
  );
}
