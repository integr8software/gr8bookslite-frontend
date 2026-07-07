import { z } from "zod";
import type {
	MultiCurrencySetupDrawerValues,
	MultiCurrencySetupFormErrors,
	MultiCurrencySetupFormValues,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

const MultiCurrencySetupSchema = z
	.object({
		baseCurrencyCode: z.string().trim().min(1, "Select a base currency."),
		targetCurrencyCode: z
			.string()
			.trim()
			.min(1, "Select the wanted currency."),
		rateDate: z.string().trim().min(1, "Enter the rate date."),
		status: z.enum(["Active", "Inactive"], {
			error: "Select whether the currency is enabled.",
		}),
		notes: z.string(),
	})
	.superRefine((values, context) => {
		if (values.baseCurrencyCode === values.targetCurrencyCode) {
			context.addIssue({
				code: "custom",
				message: "Wanted currency must differ from the base currency.",
				path: ["targetCurrencyCode"],
			});
		}
	});

const MultiCurrencySetupDrawerSchema = z
	.object({
		baseCurrencyCode: z.string().trim().min(1, "Select a base currency."),
		targetCurrencyCode: z
			.string()
			.trim()
			.min(1, "Select the currency to configure."),
		configuredExchangeRate: z
			.string()
			.trim()
			.min(1, "Enter the configured exchange rate.")
			.refine((value) => Number(value) > 0, {
				message: "Exchange rate must be greater than zero.",
			}),
		rateDate: z.string().trim().min(1, "Enter the rate date."),
		source: z.enum(["API", "Manual"], {
			error: "Select a rate type.",
		}),
		status: z.enum(["Active", "Inactive"], {
			error: "Select whether the currency is enabled.",
		}),
		notes: z.string(),
	})
	.superRefine((values, context) => {
		if (values.baseCurrencyCode === values.targetCurrencyCode) {
			context.addIssue({
				code: "custom",
				message: "Configured currency must differ from the base currency.",
				path: ["targetCurrencyCode"],
			});
		}
	});

export function validateMultiCurrencySetupForm(
	values: MultiCurrencySetupFormValues,
): MultiCurrencySetupFormErrors {
	const result = MultiCurrencySetupSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<MultiCurrencySetupFormErrors>(
		(errors, issue) => {
			const field = issue.path[0] as
				| keyof MultiCurrencySetupFormValues
				| undefined;

			if (field && !errors[field]) {
				errors[field] = issue.message;
			}

			return errors;
		},
		{},
	);
}

export function validateMultiCurrencySetupDrawer(
	values: MultiCurrencySetupDrawerValues,
): Partial<Record<keyof MultiCurrencySetupDrawerValues, string>> {
	const result = MultiCurrencySetupDrawerSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return result.error.issues.reduce<
		Partial<Record<keyof MultiCurrencySetupDrawerValues, string>>
	>((errors, issue) => {
		const field = issue.path[0] as
			| keyof MultiCurrencySetupDrawerValues
			| undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
