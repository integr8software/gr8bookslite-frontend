import { z } from "zod";
import type {
	TermManagementFormErrors,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

const TermManagementFormSchema = z.object({
	name: z.string().trim().min(1, "Enter a name."),
	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer."),
	datemode: z.enum(["Day", "Month", "Year"], {
		message: "Select a datemode.",
	}),
	period: z
		.string()
		.trim()
		.min(1, "Enter a period.")
		.refine((value) => Number(value) >= 0 && !Number.isNaN(Number(value)), {
			message: "Enter a valid period.",
		}),
	status: z.enum(["Active", "Inactive"], {
		message: "Select a status.",
	}),
});

export function validateTermManagementForm(
	values: TermManagementFormValues,
): TermManagementFormErrors {
	const errors: TermManagementFormErrors = {};
	const result = TermManagementFormSchema.safeParse(values);

	if (result.success) {
		return errors;
	}

	for (const issue of result.error.issues) {
		const field = issue.path[0] as keyof TermManagementFormValues | undefined;
		if (field && !errors[field]) {
			errors[field] = issue.message;
		}
	}

	return errors;
}
