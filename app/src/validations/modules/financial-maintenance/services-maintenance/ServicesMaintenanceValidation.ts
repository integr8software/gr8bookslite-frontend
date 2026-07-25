import { z } from "zod";
import {
	ServicesMaintenanceAccountSetupModeOptions,
	ServicesMaintenanceStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import type {
	ServicesMaintenanceFormErrors,
	ServicesMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";

const ServicesMaintenanceFormSchema = z
	.object({
		serviceName: z.string().trim().min(1, "Service name is required."),
		description: z.string().max(500, "Description can only be up to 500 characters."),
		status: z.enum(ServicesMaintenanceStatusOptions),
		accountSetupMode: z.enum(ServicesMaintenanceAccountSetupModeOptions),
		revenueCoaId: z.string(),
	})
	.superRefine((values, ctx) => {
		if (values.accountSetupMode === "Existing" && !values.revenueCoaId.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Revenue account is required.",
				path: ["revenueCoaId"],
			});
		}
	});

export function validateServicesMaintenanceForm(
	values: ServicesMaintenanceFormValues,
): ServicesMaintenanceFormErrors {
	const parsed = ServicesMaintenanceFormSchema.safeParse(values);

	if (parsed.success) {
		return {};
	}

	const errors: ServicesMaintenanceFormErrors = {};

	for (const issue of parsed.error.issues) {
		const field = issue.path[0];

		if (isServicesMaintenanceField(field) && !errors[field]) {
			errors[field] = issue.message;
		}
	}

	return errors;
}

function isServicesMaintenanceField(
	value: unknown,
): value is keyof ServicesMaintenanceFormValues {
	return (
		typeof value === "string" &&
		[
			"serviceName",
			"description",
			"status",
			"accountSetupMode",
			"revenueCoaId",
		].includes(value)
	);
}
