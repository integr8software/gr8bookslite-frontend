import { z } from "zod";
import {
	PartyClassificationOptions,
	PartyTypeOptions,
	VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { getPartyAtcCodeOptionsByClassification } from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import type {
	PartyInformationFormErrors,
	PartyInformationFormValues,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

const PhilippineContactNumberPattern = /^\+63 \d{3} \d{3} \d{4}$/;
const PhilippineTinPattern = /^\d{3}-\d{3}-\d{3}-\d{3}$/;

const PartyInformationAddressSchema = z.object({
	addressLine1: z.string().trim(),
	addressLine2: z.string().trim(),
	barangay: z.string().trim(),
	barangayCode: z.string().trim().min(1, "Select a barangay."),
	cityMunicipality: z.string().trim(),
	cityMunicipalityCode: z
		.string()
		.trim()
		.min(1, "Select a city or municipality."),
	province: z.string().trim(),
	provinceCode: z.string().trim().min(1, "Select a province."),
	region: z.string().trim(),
	regionCode: z.string().trim().min(1, "Select a region."),
});

export const PartyInformationFormSchema = z
	.object({
		partyCodeNo: z.string().trim().min(1, "Party code is required."),
		classification: z.enum(PartyClassificationOptions, {
			error: "Select a party classification first.",
		}),
		partyTypes: z
			.array(z.enum(PartyTypeOptions))
			.min(1, "Select at least one party type."),
		partyName: z.string().trim(),
		tradingName: z.string().trim(),
		firstName: z.string().trim(),
		middleName: z.string().trim(),
		lastName: z.string().trim(),
		suffixName: z.string().trim(),
		address: PartyInformationAddressSchema,
		tin: z
			.string()
			.trim()
			.refine((value) => !value || PhilippineTinPattern.test(value), {
				message: "Enter a valid TIN in the format 000-000-000-000.",
			}),
		vatRegistrationType: z.union([
			z.literal(""),
			z.enum(VatRegistrationTypeOptions),
		]),
		atcCode: z.string().trim(),
		email: z
			.string()
			.trim()
			.refine((value) => !value || isValidEmail(value), {
				message: "Enter a valid email address.",
			}),
		contactNo: z
			.string()
			.trim()
			.refine((value) => !value || isValidContactNo(value), {
				message: "Enter a valid contact number in the format.",
			}),
	})
	.superRefine((values, ctx) => {
		if (
			values.classification === "Non-Individual" &&
			!values.partyName.trim()
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Party name is required.",
				path: ["partyName"],
			});
		}

		if (values.classification === "Individual") {
			if (!values.firstName.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "First name is required.",
					path: ["firstName"],
				});
			}

			if (!values.lastName.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Last name is required.",
					path: ["lastName"],
				});
			}
		}

		if (
			values.atcCode &&
			!isKnownAtcCodeForClassification(values.atcCode, values.classification)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select a valid BIR ATC code from the list.",
				path: ["atcCode"],
			});
		}
	});

export function validatePartyInformationForm(
	values: PartyInformationFormValues,
): PartyInformationFormErrors {
	const parsed = PartyInformationFormSchema.safeParse(values);

	if (parsed.success) {
		return {};
	}

	const errors: PartyInformationFormErrors = {};

	for (const issue of parsed.error.issues) {
		const field = issue.path[issue.path.length - 1];

		if (field === "atcCode" && !errors.atcCode) {
			errors.atcCode = issue.message;
		} else if (field === "classification" && !errors.classification) {
			errors.classification = issue.message;
		} else if (field === "contactNo" && !errors.contactNo) {
			errors.contactNo = issue.message;
		} else if (field === "email" && !errors.email) {
			errors.email = issue.message;
		} else if (field === "firstName" && !errors.firstName) {
			errors.firstName = issue.message;
		} else if (field === "lastName" && !errors.lastName) {
			errors.lastName = issue.message;
		} else if (field === "partyCodeNo" && !errors.partyCodeNo) {
			errors.partyCodeNo = issue.message;
		} else if (field === "partyName" && !errors.partyName) {
			errors.partyName = issue.message;
		} else if (field === "partyTypes" && !errors.partyTypes) {
			errors.partyTypes = issue.message;
		} else if (field === "regionCode" && !errors.regionCode) {
			errors.regionCode = issue.message;
		} else if (field === "provinceCode" && !errors.provinceCode) {
			errors.provinceCode = issue.message;
		} else if (
			field === "cityMunicipalityCode" &&
			!errors.cityMunicipalityCode
		) {
			errors.cityMunicipalityCode = issue.message;
		} else if (field === "barangayCode" && !errors.barangayCode) {
			errors.barangayCode = issue.message;
		} else if (field === "tin" && !errors.tin) {
			errors.tin = issue.message;
		}
	}

	return errors;
}

function isKnownAtcCodeForClassification(
	value: string,
	classification: PartyInformationFormValues["classification"],
) {
	return getPartyAtcCodeOptionsByClassification(classification).some(
		(option) => option.code === value,
	);
}

function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidContactNo(value: string) {
	const contactNo = value.trim();

	return (
		contactNo === DefaultPhilippineContactNumber ||
		PhilippineContactNumberPattern.test(contactNo)
	);
}
