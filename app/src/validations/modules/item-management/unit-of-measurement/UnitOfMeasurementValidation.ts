import { z } from "zod";
import type {
	UnitOfMeasurementFormErrors,
	UnitOfMeasurementFormValues,
} from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";

const UnitOfMeasurementFormSchema = z.object({
	name: z.string().trim().min(1, "Enter a unit of measurement."),
	symbol: z.string().trim().min(1, "Enter a symbol."),
	quantityMode: z.enum(["Integer", "Float"], {
		message: "Select a quantity type.",
	}),
	status: z.enum(["Active", "Inactive"], {
		message: "Select a status.",
	}),
});

export function validateUnitOfMeasurementForm(
	values: UnitOfMeasurementFormValues,
): UnitOfMeasurementFormErrors {
	const errors: UnitOfMeasurementFormErrors = {};
	const result = UnitOfMeasurementFormSchema.safeParse(values);

	if (result.success) {
		return errors;
	}

	for (const issue of result.error.issues) {
		const field = issue.path[0] as keyof UnitOfMeasurementFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}
	}

	return errors;
}
