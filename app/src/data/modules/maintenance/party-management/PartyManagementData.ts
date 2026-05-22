import {
	BIRAtcSourceUrl,
	PartyTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import type {
	PartyAddress,
	PartyAtcCodeOption,
	PartyClassification,
	PartyInformationFormValues,
	PartyInformationRecord,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export const PartyAtcCodeOptions: PartyAtcCodeOption[] = [
	{
		code: "WI010",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description: "Individual payee with gross income that did not exceed P3M.",
		label: "Professional Fees",
	},
	{
		code: "WI011",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description:
			"Individual payee with gross income over P3M or VAT registration.",
		label: "Professional Fees",
	},
	{
		code: "WC010",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description:
			"Corporate payee with gross income that did not exceed P720,000.",
		label: "Professional Fees",
	},
	{
		code: "WC011",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description: "Corporate payee with gross income exceeding P720,000.",
		label: "Professional Fees",
	},
	{
		code: "WI100",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description: "Rental income payments to individual payees.",
		label: "Rentals",
	},
	{
		code: "WC100",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description: "Rental income payments to corporate payees.",
		label: "Rentals",
	},
	{
		code: "WI120",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description: "Income payments to certain individual contractors.",
		label: "Certain Contractors",
	},
	{
		code: "WC120",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description: "Income payments to certain corporate contractors.",
		label: "Certain Contractors",
	},
	{
		code: "WI151",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description: "Professional fees paid to individual medical practitioners.",
		label: "Medical Practitioners",
	},
	{
		code: "WC151",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description: "Professional fees paid to corporate medical practitioners.",
		label: "Medical Practitioners",
	},
	{
		code: "WI158",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description:
			"Top withholding agent payments to individual local or resident suppliers of goods.",
		label: "Supplier Goods",
	},
	{
		code: "WC158",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description:
			"Top withholding agent payments to corporate local or resident suppliers of goods.",
		label: "Supplier Goods",
	},
	{
		code: "WI160",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description:
			"Top withholding agent payments to individual local or resident suppliers of services.",
		label: "Supplier Services",
	},
	{
		code: "WC160",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description:
			"Top withholding agent payments to corporate local or resident suppliers of services.",
		label: "Supplier Services",
	},
	{
		code: "WI610",
		category: "Expanded Withholding Tax",
		classifications: ["Individual"],
		description: "Payments to individual suppliers of agricultural products.",
		label: "Agricultural Products",
	},
	{
		code: "WC610",
		category: "Expanded Withholding Tax",
		classifications: ["Non-Individual"],
		description: "Payments to corporate suppliers of agricultural products.",
		label: "Agricultural Products",
	},
	{
		code: "WV012",
		category: "VAT Withholding",
		classifications: ["Individual", "Non-Individual"],
		description: "VAT withholding on purchases of goods.",
		label: "Purchases of Goods",
	},
	{
		code: "WV022",
		category: "VAT Withholding",
		classifications: ["Individual", "Non-Individual"],
		description: "VAT withholding on purchases of services.",
		label: "Purchases of Services",
	},
	{
		code: "WB080",
		category: "Business Tax Withholding",
		classifications: ["Individual", "Non-Individual"],
		description:
			"Persons exempt from VAT under Sec. 109BB with a government withholding agent.",
		label: "VAT Exempt Persons",
	},
	{
		code: "WB082",
		category: "Business Tax Withholding",
		classifications: ["Individual", "Non-Individual"],
		description:
			"Persons exempt from VAT under Sec. 109BB with a private withholding agent.",
		label: "VAT Exempt Persons",
	},
];

export const PartyAtcCodeSource = {
	label: "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
	url: BIRAtcSourceUrl,
};

export const PartyInformationInitialFormValues: PartyInformationFormValues = {
	partyCodeNo: "",
	classification: "",
	partyTypes: [],
	partyName: "",
	tradingName: "",
	firstName: "",
	middleName: "",
	lastName: "",
	suffixName: "",
	address: createEmptyPartyAddress(),
	tin: "",
	vatRegistrationType: "",
	atcCode: "",
	email: "",
	contactNo: "",
};

export const PartyInformationInitialRecords: PartyInformationRecord[] = [];

export function createPartyInformationFormValues(
	record: PartyInformationRecord,
): PartyInformationFormValues {
	return {
		partyCodeNo: record.partyCodeNo,
		classification: record.classification,
		partyTypes: [...record.partyTypes],
		partyName: record.partyName,
		tradingName: record.tradingName ?? "",
		firstName: record.firstName,
		middleName: record.middleName,
		lastName: record.lastName,
		suffixName: record.suffixName,
		address: { ...record.address },
		tin: record.tin,
		vatRegistrationType: record.vatRegistrationType,
		atcCode: record.atcCode,
		email: record.email,
		contactNo: record.contactNo,
	};
}

export function createPartySubmitPayload(values: PartyInformationFormValues) {
	const name =
		values.classification === "Non-Individual"
			? values.partyName.trim()
			: [values.firstName, values.middleName, values.lastName, values.suffixName]
					.map((part) => part.trim())
					.filter(Boolean)
					.join(" ");

	return {
		partyCodeNo: values.partyCodeNo.trim(),
		classification: values.classification,
		partyTypes: values.partyTypes,
		name,
		tradingName:
			values.classification === "Non-Individual"
				? values.tradingName.trim() || null
				: null,
		address: { ...values.address },
		tin: values.tin.trim(),
		vatRegistrationType: values.vatRegistrationType,
		atcCode: values.atcCode,
		email: values.email.trim() || null,
		contactNo: normalizePartyContactNo(values.contactNo) || null,
	};
}

export function createPartyInformationRecord(
	values: PartyInformationFormValues,
): PartyInformationRecord {
	const now = new Date().toISOString();

	return {
		id: `party_${Date.now().toString(36)}`,
		...normalizePartyRecordValues(values),
		createdAt: now,
		updatedAt: now,
	};
}

export function updatePartyInformationRecord(
	record: PartyInformationRecord,
	values: PartyInformationFormValues,
): PartyInformationRecord {
	return {
		...record,
		...normalizePartyRecordValues(values),
		updatedAt: new Date().toISOString(),
	};
}

export function getPartyDisplayName(record: PartyInformationRecord) {
	if (record.classification === "Non-Individual") {
		return record.partyName;
	}

	return [record.firstName, record.middleName, record.lastName, record.suffixName]
		.filter(Boolean)
		.join(" ");
}

export function isKnownPartyType(value: string): value is PartyType {
	return PartyTypeOptions.includes(value as PartyType);
}

export function isKnownAtcCode(value: string) {
	return PartyAtcCodeOptions.some((option) => option.code === value);
}

export function getPartyAtcCodeOptionsByClassification(
	classification: PartyClassification | "",
) {
	if (!classification) {
		return [];
	}

	return PartyAtcCodeOptions.filter((option) =>
		option.classifications.includes(classification),
	);
}

function normalizePartyRecordValues(
	values: PartyInformationFormValues,
): Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> {
	if (!values.classification) {
		throw new Error("Party classification is required.");
	}

	return {
		...values,
		partyCodeNo: values.partyCodeNo.trim(),
		classification: values.classification,
		partyName:
			values.classification === "Non-Individual"
				? values.partyName.trim()
				: "",
		tradingName:
			values.classification === "Non-Individual"
				? values.tradingName.trim()
				: "",
		firstName:
			values.classification === "Individual" ? values.firstName.trim() : "",
		middleName:
			values.classification === "Individual" ? values.middleName.trim() : "",
		lastName:
			values.classification === "Individual" ? values.lastName.trim() : "",
		suffixName:
			values.classification === "Individual" ? values.suffixName.trim() : "",
		address: normalizePartyAddress(values.address),
		tin: values.tin.trim(),
		email: values.email.trim(),
		contactNo: normalizePartyContactNo(values.contactNo),
	};
}

function normalizePartyContactNo(value: string) {
	const contactNo = value.trim();

	return contactNo === DefaultPhilippineContactNumber ? "" : contactNo;
}

function createEmptyPartyAddress(): PartyAddress {
	return {
		addressLine1: "",
		addressLine2: "",
		barangay: "",
		barangayCode: "",
		cityMunicipality: "",
		cityMunicipalityCode: "",
		province: "",
		provinceCode: "",
		region: "",
		regionCode: "",
	};
}

function normalizePartyAddress(address: PartyAddress): PartyAddress {
	return {
		addressLine1: address.addressLine1.trim(),
		addressLine2: address.addressLine2.trim(),
		barangay: address.barangay.trim(),
		barangayCode: address.barangayCode,
		cityMunicipality: address.cityMunicipality.trim(),
		cityMunicipalityCode: address.cityMunicipalityCode,
		province: address.province.trim(),
		provinceCode: address.provinceCode,
		region: address.region.trim(),
		regionCode: address.regionCode,
	};
}

