import { GetCalendarYearReportDates } from "@/app/src/data/onboarding/OnboardingData";
import type {
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

const DefaultWorkspaceCompanyReportYear = GetCalendarYearReportDates();

export const InitialWorkspaceCompanyFormValues: WorkspaceCompanyFormValues = {
	address: "",
	billingAddress: "",
	billingCardNumber: "",
	billingCardholderName: "",
	billingCvc: "",
	billingEmail: "",
	billingExpiryMonth: "",
	billingExpiryYear: "",
	billingPaymentMethodId: "setup-later",
	billingPlanCode: "",
	billingCycle: "MONTHLY",
	companyName: "",
	contactNumber: "",
	email: "",
	firstName: "",
	lastName: "",
	logoFile: null,
	logoName: "",
	logoUrl: "",
	middleName: "",
	nonIndividualType: "Corporation",
	nonIndividualTypeOther: "",
	plan: "Accounting + Inventory",
	reportEndDate: DefaultWorkspaceCompanyReportYear.reportEndDate,
	reportStartDate: DefaultWorkspaceCompanyReportYear.reportStartDate,
	status: "Active",
	taxpayerType: "non-individual",
	tin: "",
	website: "",
};

export const InitialWorkspaceCompanyUserFormValues: WorkspaceCompanyUserFormValues =
	{
		companyAssignments: [],
		contactNumber: "",
		email: "",
		name: "",
	};

export function createWorkspaceCompanyFormValues(
	company: WorkspaceCompanyRecord,
): WorkspaceCompanyFormValues {
	const taxpayerType = company.taxpayerType ?? "non-individual";

	return {
		address: company.address,
		billingAddress: "",
		billingCardNumber: "",
		billingCardholderName: "",
		billingCvc: "",
		billingEmail: company.email,
		billingExpiryMonth: "",
		billingExpiryYear: "",
		billingPaymentMethodId: company.billingPaymentMethodId ?? "setup-later",
		billingPlanCode: "",
		billingCycle: "MONTHLY",
		companyName: taxpayerType === "non-individual" ? company.name : "",
		contactNumber: company.contactNumber,
		email: company.email,
		firstName: company.firstName ?? "",
		lastName: company.lastName ?? "",
		logoFile: null,
		logoName: company.logoUrl ? "Current logo" : "",
		logoUrl: company.logoUrl ?? "",
		middleName: company.middleName ?? "",
		nonIndividualType: company.nonIndividualType ?? company.companyType,
		nonIndividualTypeOther: company.nonIndividualTypeOther ?? "",
		plan: company.plan,
		reportEndDate:
			company.reportEndDate ?? DefaultWorkspaceCompanyReportYear.reportEndDate,
		reportStartDate:
			company.reportStartDate ??
			DefaultWorkspaceCompanyReportYear.reportStartDate,
		status: company.status,
		taxpayerType,
		tin: company.tin ?? "",
		website: company.website ?? "",
	};
}

export function validateWorkspaceCompanyForm(
	values: WorkspaceCompanyFormValues,
	options: { requireBillingPlan?: boolean } = {},
) {
	const errors: WorkspaceCompanyFormErrors = {};

	if (values.taxpayerType === "individual") {
		if (!values.lastName.trim()) errors.lastName = "Last name is required.";
		if (!values.firstName.trim()) errors.firstName = "First name is required.";
	} else {
		if (!values.companyName.trim()) errors.companyName = "Company name is required.";
		if (!values.nonIndividualType.trim()) {
			errors.nonIndividualType = "Organization type is required.";
		}
		if (
			values.nonIndividualType === "Others" &&
			!values.nonIndividualTypeOther.trim()
		) {
			errors.nonIndividualTypeOther = "Please specify the organization type.";
		}
	}
	if (!values.email.trim()) errors.email = "Email is required.";
	if (!values.contactNumber.trim()) {
		errors.contactNumber = "Contact number is required.";
	}
	if (!values.address.trim()) errors.address = "Address is required.";
	if (!values.tin.trim()) errors.tin = "TIN is required.";
	if (!values.logoName.trim() && !values.logoUrl.trim()) {
		errors.logoName = "Upload a logo image.";
	}
	if (options.requireBillingPlan && !values.billingPlanCode.trim()) {
		errors.billingPlanCode = "Select a company plan.";
	}
	if (!values.reportStartDate) {
		errors.reportStartDate = "Report start date is required.";
	}
	if (!values.reportEndDate) {
		errors.reportEndDate = "Report end date is required.";
	}
	if (values.billingPaymentMethodId === "new-paymongo-card") {
		validateBillingCardDetails(values, errors);
	}

	return errors;
}

export function validateWorkspaceCompanyUserForm(
	values: WorkspaceCompanyUserFormValues,
) {
	const errors: WorkspaceCompanyUserFormErrors = {};

	if (!values.name.trim()) errors.name = "Name is required.";
	if (!values.email.trim()) errors.email = "Email is required.";
	if (values.companyAssignments.length === 0) {
		errors.companyAssignments = "Add at least one company.";
	}

	return errors;
}

export function getNextWorkspaceCompanyStatus(
	status: WorkspaceCompanyStatus,
): WorkspaceCompanyStatus {
	return status === "Inactive" ? "Active" : "Inactive";
}

function validateBillingCardDetails(
	values: WorkspaceCompanyFormValues,
	errors: WorkspaceCompanyFormErrors,
) {
	if (!values.billingCardholderName.trim()) {
		errors.billingCardholderName = "Cardholder name is required.";
	}
	if (!values.billingEmail.trim()) {
		errors.billingEmail = "Billing email is required.";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.billingEmail.trim())) {
		errors.billingEmail = "Enter a valid billing email.";
	}

	const cardDigits = getDigitsOnly(values.billingCardNumber);
	if (!cardDigits) {
		errors.billingCardNumber = "Card number is required.";
	} else if (
		cardDigits.length < 12 ||
		cardDigits.length > 19 ||
		!passesLuhnCheck(cardDigits)
	) {
		errors.billingCardNumber = "Enter a valid card number.";
	}

	const expiryMonth = Number(values.billingExpiryMonth);
	const expiryYear = Number(values.billingExpiryYear);
	if (!/^(0?[1-9]|1[0-2])$/.test(values.billingExpiryMonth.trim())) {
		errors.billingExpiryMonth = "Enter a valid expiry month.";
	}
	if (!/^\d{4}$/.test(values.billingExpiryYear.trim())) {
		errors.billingExpiryYear = "Enter a valid expiry year.";
	} else if (!Number.isNaN(expiryMonth) && !Number.isNaN(expiryYear)) {
		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();

		if (
			expiryYear < currentYear ||
			(expiryYear === currentYear && expiryMonth < currentMonth)
		) {
			errors.billingExpiryYear = "Card expiry date cannot be in the past.";
		}
	}

	const cvcPattern =
		getCardBrand(values.billingCardNumber) === "amex" ? /^\d{4}$/ : /^\d{3}$/;
	if (!values.billingCvc.trim()) {
		errors.billingCvc = "CVC is required.";
	} else if (!cvcPattern.test(values.billingCvc.trim())) {
		errors.billingCvc =
			getCardBrand(values.billingCardNumber) === "amex"
				? "American Express cards require a 4-digit CVC."
				: "This card requires a 3-digit CVC.";
	}

	if (values.billingAddress.trim().length < 5) {
		errors.billingAddress = "Billing address must be at least 5 characters.";
	}
}

function getDigitsOnly(value: string) {
	return value.replace(/\D/g, "");
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
