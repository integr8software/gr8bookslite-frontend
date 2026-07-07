import { z } from "zod";
import {
	DefaultAccountStatusOptions,
	DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/default-account/DefaultAccountConstants";
import type {
	DefaultAccountFormErrors,
	DefaultAccountFormValues,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";

const DefaultAccountTypeValues = DefaultAccountTypeOptions.map(
	(option) => option.value,
);

export const DefaultAccountFormValidationSchema = z.object({
	type: z.enum(DefaultAccountTypeValues, {
		message: "Default Account Type is required.",
	}),
	defaultAccountName: z
		.string()
		.trim()
		.min(1, "Default Account Name is required."),
	description: z.string(),
	status: z.enum(DefaultAccountStatusOptions, {
		message: "Status is required.",
	}),
});

export function validateDefaultAccountForm(
	values: DefaultAccountFormValues,
): DefaultAccountFormErrors {
	const result = DefaultAccountFormValidationSchema.safeParse(values);

	return result.success ? {} : mapDefaultAccountIssues(result.error.issues);
}

function mapDefaultAccountIssues(issues: z.ZodIssue[]) {
	return issues.reduce<DefaultAccountFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof DefaultAccountFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
