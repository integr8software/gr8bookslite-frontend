import { z } from "zod";
import {
	GetSyncedReportEndDate,
	IsValidOnboardingDateValue,
	OnboardingMaxImageSizeBytes,
	OnboardingNonIndividualTypeOptions,
} from "@/app/src/data/onboarding/OnboardingData";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import type {
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

const NamePattern = /^[A-Za-z]+(?:[ .'-]+[A-Za-z]+)*$/;

function getDigitsOnly(value: string) {
	return value.replace(/\D/g, "");
}

function isValidWebsiteUrl(value: string) {
	const candidate = /^[A-Za-z][A-Za-z\d+\-.]*:\/\//.test(value)
		? value
		: `https://${value}`;

	try {
		const url = new URL(candidate);
		return (
			(url.protocol === "http:" || url.protocol === "https:") &&
			url.hostname.includes(".")
		);
	} catch {
		return false;
	}
}

function getCardBrand(value: string) {
	const digits = getDigitsOnly(value);

	if (/^3[47]/.test(digits)) return "amex";
	if (/^4/.test(digits)) return "visa";
	if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
	if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
	if (/^(35(2[89]|[3-8]))/.test(digits)) return "jcb";
	if (/^(30[0-5]|36|38|39)/.test(digits)) return "diners";

	return "card";
}

function passesLuhnCheck(value: string) {
	let checksum = 0;
	let shouldDouble = false;

	for (let index = value.length - 1; index >= 0; index -= 1) {
		let digit = Number(value[index]);

		if (shouldDouble) {
			digit *= 2;

			if (digit > 9) {
				digit -= 9;
			}
		}

		checksum += digit;
		shouldDouble = !shouldDouble;
	}

	return checksum % 10 === 0;
}

function createRequiredNameSchema(label: string) {
	return z
		.string()
		.trim()
		.min(1, `${label} is required.`)
		.refine((value) => value.length >= 2, {
			message: `${label} must be at least 2 characters.`,
		})
		.refine((value) => NamePattern.test(value), {
			message: `${label} must contain letters only.`,
		});
}

const EmailSchema = z
	.string()
	.trim()
	.min(1, "Email is required.")
	.email("Enter a valid email address.");

const ContactNumberSchema = z
	.string()
	.trim()
	.min(1, "Contact number is required.")
	.refine(
		(value) =>
			value === DefaultPhilippineContactNumber ||
			/^\+63 \d{3} \d{3} \d{4}$/.test(value),
		"Enter a valid contact number in the format.",
	);

const TinSchema = z
	.string()
	.trim()
	.min(1, "TIN is required.")
	.refine((value) => {
		const digits = getDigitsOnly(value);
		return digits.length === 9 || digits.length === 12;
	}, "Enter a valid TIN in the format XXX-XXX-XXX or XXX-XXX-XXX-XXX.");

const WebsiteSchema = z
	.string()
	.trim()
	.refine((value) => value === "" || isValidWebsiteUrl(value), {
		message: "Enter a valid website URL.",
	});

const ReportDateSchema = z
	.string()
	.trim()
	.min(1, "Select a valid date.")
	.refine(IsValidOnboardingDateValue, "Select a valid date.");

const BaseWorkspaceCompanySchema = z.object({
	address: z
		.string()
		.trim()
		.min(5, "Address must be at least 5 characters."),
	billingAddress: z.string().trim(),
	billingCardNumber: z.string().trim(),
	billingCardholderName: z.string().trim(),
	billingCvc: z.string().trim(),
	billingEmail: z.string().trim(),
	billingExpiryMonth: z.string().trim(),
	billingExpiryYear: z.string().trim(),
	billingPaymentMethodId: z.string().trim(),
	billingPlanCode: z.string().trim(),
	billingCycle: z.enum(["MONTHLY", "YEARLY"]),
	companyName: z.string().trim(),
	contactNumber: ContactNumberSchema,
	email: EmailSchema,
	firstName: z.string().trim(),
	lastName: z.string().trim(),
	logoFile: z.instanceof(File).nullable(),
	logoName: z.string().trim(),
	logoUrl: z.string().trim(),
	middleName: z.string().trim(),
	nonIndividualType: z.string().trim(),
	nonIndividualTypeOther: z.string().trim(),
	plan: z.string(),
	reportEndDate: ReportDateSchema,
	reportStartDate: ReportDateSchema,
	status: z.enum(["Active", "Inactive", "Pending"]),
	taxpayerType: z.enum(["individual", "non-individual"]),
	tin: TinSchema,
	website: WebsiteSchema,
});

const WorkspaceCompanySchema = BaseWorkspaceCompanySchema.superRefine(
	(values, ctx) => {
		if (values.taxpayerType === "individual") {
			const lastNameResult = createRequiredNameSchema("Last name").safeParse(
				values.lastName,
			);
			const firstNameResult = createRequiredNameSchema("First name").safeParse(
				values.firstName,
			);

			if (!lastNameResult.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: lastNameResult.error.issues[0]?.message ?? "Last name is required.",
					path: ["lastName"],
				});
			}

			if (!firstNameResult.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						firstNameResult.error.issues[0]?.message ?? "First name is required.",
					path: ["firstName"],
				});
			}
		} else {
			if (values.companyName.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Company name must be at least 2 characters.",
					path: ["companyName"],
				});
			}

			if (!values.nonIndividualType) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select an organization type.",
					path: ["nonIndividualType"],
				});
			} else if (
				!OnboardingNonIndividualTypeOptions.includes(
					values.nonIndividualType as (typeof OnboardingNonIndividualTypeOptions)[number],
				)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select a valid organization type.",
					path: ["nonIndividualType"],
				});
			}

			if (
				values.nonIndividualType === "Others" &&
				values.nonIndividualTypeOther.length < 2
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please specify the organization type.",
					path: ["nonIndividualTypeOther"],
				});
			}
		}

		if (!values.logoName && !values.logoUrl && !values.logoFile) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Upload a logo image.",
				path: ["logoName"],
			});
		}

		if (values.logoFile) {
			if (!values.logoFile.type.startsWith("image/")) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Only image files are allowed.",
					path: ["logoName"],
				});
			}

			if (values.logoFile.size > OnboardingMaxImageSizeBytes) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Logo must be 5MB or smaller.",
					path: ["logoName"],
				});
			}
		}

		const syncedEndDate = GetSyncedReportEndDate(values.reportStartDate);

		if (syncedEndDate && values.reportEndDate !== syncedEndDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End date must sync to a 1-year report period.",
				path: ["reportEndDate"],
			});
		}
	},
);

const WorkspaceCompanyBillingSchema = z
	.object({
		billingAddress: z
			.string()
			.trim()
			.min(5, "Billing address must be at least 5 characters."),
		billingCardNumber: z
			.string()
			.trim()
			.min(1, "Card number is required.")
			.refine(
				(value) => /^\d[\d -]*\d$|^\d$/.test(value),
				"Card number can only contain digits, spaces, and hyphens.",
			)
			.refine((value) => {
				const digits = getDigitsOnly(value);
				return digits.length >= 12 && digits.length <= 19;
			}, "Enter a valid card number.")
			.refine((value) => passesLuhnCheck(getDigitsOnly(value)), {
				message: "Enter a valid card number.",
			}),
		billingCardholderName: createRequiredNameSchema("Cardholder name"),
		billingCvc: z
			.string()
			.trim()
			.min(1, "CVC is required.")
			.refine((value) => /^\d{3,4}$/.test(value), {
				message: "Enter a valid CVC.",
			}),
		billingEmail: z
			.string()
			.trim()
			.min(1, "Billing email is required.")
			.email("Enter a valid billing email."),
		billingExpiryMonth: z
			.string()
			.trim()
			.min(1, "Expiry month is required.")
			.refine((value) => /^(0?[1-9]|1[0-2])$/.test(value), {
				message: "Enter a valid expiry month.",
			}),
		billingExpiryYear: z
			.string()
			.trim()
			.min(1, "Expiry year is required.")
			.refine((value) => /^\d{4}$/.test(value), {
				message: "Enter a valid expiry year.",
			}),
	})
	.superRefine((values, ctx) => {
		const expiryMonth = Number(values.billingExpiryMonth);
		const expiryYear = Number(values.billingExpiryYear);
		const cardBrand = getCardBrand(values.billingCardNumber);
		const cvcPattern = cardBrand === "amex" ? /^\d{4}$/ : /^\d{3}$/;

		if (!cvcPattern.test(values.billingCvc)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					cardBrand === "amex"
						? "American Express cards require a 4-digit CVC."
						: "This card requires a 3-digit CVC.",
				path: ["billingCvc"],
			});
		}

		if (Number.isNaN(expiryMonth) || Number.isNaN(expiryYear)) {
			return;
		}

		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();

		if (
			expiryYear < currentYear ||
			(expiryYear === currentYear && expiryMonth < currentMonth)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Card expiry date cannot be in the past.",
				path: ["billingExpiryYear"],
			});
		}
	});

const WorkspaceCompanyUserSchema = z.object({
	companyAssignments: z
		.array(
			z.object({
				branchIds: z.array(z.string()),
				companyId: z.string().trim().min(1),
			}),
		)
		.min(1, "Add at least one company."),
	contactNumber: z.string().trim(),
	email: EmailSchema,
	name: z.string().trim().min(1, "Name is required."),
});

export function validateWorkspaceCompanyForm(
	values: WorkspaceCompanyFormValues,
	options: { requireBillingPlan?: boolean } = {},
) {
	const errors: WorkspaceCompanyFormErrors = {};
	const baseResult = WorkspaceCompanySchema.safeParse(values);

	if (!baseResult.success) {
		mapCompanyIssues(baseResult.error.issues, errors);
	}

	if (options.requireBillingPlan && !values.billingPlanCode.trim()) {
		errors.billingPlanCode ??= "Select a company plan.";
	}

	if (values.billingPaymentMethodId === "new-paymongo-card") {
		const billingResult = WorkspaceCompanyBillingSchema.safeParse(values);

		if (!billingResult.success) {
			mapCompanyIssues(billingResult.error.issues, errors);
		}
	}

	return errors;
}

export function validateWorkspaceCompanyUserForm(
	values: WorkspaceCompanyUserFormValues,
) {
	const parsed = WorkspaceCompanyUserSchema.safeParse(values);

	if (parsed.success) {
		return {};
	}

	const errors: WorkspaceCompanyUserFormErrors = {};

	for (const issue of parsed.error.issues) {
		const field = issue.path[issue.path.length - 1];

		if (field === "companyAssignments" && !errors.companyAssignments) {
			errors.companyAssignments = issue.message;
		} else if (field === "email" && !errors.email) {
			errors.email = issue.message;
		} else if (field === "name" && !errors.name) {
			errors.name = issue.message;
		}
	}

	return errors;
}

function mapCompanyIssues(
	issues: z.ZodIssue[],
	errors: WorkspaceCompanyFormErrors,
) {
	for (const issue of issues) {
		const field = issue.path[issue.path.length - 1];

		if (typeof field !== "string") {
			continue;
		}

		const errorField = field as keyof WorkspaceCompanyFormValues;
		errors[errorField] ??= issue.message;
	}
}
