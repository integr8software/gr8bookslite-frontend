import {
	BIRAtcSourceUrl,
	PartyTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import type {
	PartyAtcCodeOption,
	PartyInformationFormErrors,
	PartyInformationFormValues,
	PartyInformationRecord,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

export const PartyAtcCodeOptions: PartyAtcCodeOption[] = [
	{
		code: "WI010",
		label: "Professional fees - individual, gross income did not exceed P3M",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI011",
		label: "Professional fees - individual, gross income over P3M or VAT registered",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC010",
		label: "Professional fees - corporation, gross income did not exceed P720,000",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC011",
		label: "Professional fees - corporation, gross income exceeds P720,000",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI100",
		label: "Rentals - individual",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC100",
		label: "Rentals - corporation",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI120",
		label: "Income payments to certain contractors - individual",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC120",
		label: "Income payments to certain contractors - corporation",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI151",
		label: "Professional fees paid to medical practitioners - individual",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC151",
		label: "Professional fees paid to medical practitioners - corporation",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI158",
		label: "Top withholding agents payments to local/resident suppliers of goods - individual",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC158",
		label: "Top withholding agents payments to local/resident suppliers of goods - corporation",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI160",
		label: "Top withholding agents payments to local/resident suppliers of services - individual",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC160",
		label: "Top withholding agents payments to local/resident suppliers of services - corporation",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WI610",
		label: "Payments to suppliers of agricultural products - individual",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WC610",
		label: "Payments to suppliers of agricultural products - corporation",
		category: "Expanded Withholding Tax",
	},
	{
		code: "WV012",
		label: "VAT withholding on purchases of goods",
		category: "VAT Withholding",
	},
	{
		code: "WV022",
		label: "VAT withholding on purchases of services",
		category: "VAT Withholding",
	},
	{
		code: "WB080",
		label: "Persons exempt from VAT under Sec. 109BB - government withholding agent",
		category: "Business Tax Withholding",
	},
	{
		code: "WB082",
		label: "Persons exempt from VAT under Sec. 109BB - private withholding agent",
		category: "Business Tax Withholding",
	},
];

export const PartyAtcCodeSource = {
	label: "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
	url: BIRAtcSourceUrl,
};

export const PartyInformationInitialFormValues: PartyInformationFormValues = {
	partyCodeNo: createPartyCodeNo(),
	classification: "",
	partyTypes: [],
	partyName: "",
	firstName: "",
	middleName: "",
	lastName: "",
	suffixName: "",
	address: {
		region: "",
		province: "",
		cityMunicipality: "",
		barangay: "",
		lotUnit: "",
		blockBuildingStreet: "",
		subdivision: "",
		zipcode: "",
	},
	tin: "",
	vatRegistrationType: "",
	atcCode: "",
	email: "",
	contactNo: "",
};

export const PartyInformationSampleState: PartyInformationFormValues = {
	partyCodeNo: "PTY-2026-0001",
	classification: "Individual",
	partyTypes: ["Vendor", "Customer"],
	partyName: "",
	firstName: "Maria",
	middleName: "Santos",
	lastName: "Reyes",
	suffixName: "",
	address: {
		region: "NCR",
		province: "Metro Manila",
		cityMunicipality: "Makati City",
		barangay: "Bel-Air",
		lotUnit: "Unit 1204",
		blockBuildingStreet: "Ayala Avenue",
		subdivision: "Legazpi Village",
		zipcode: "1229",
	},
	tin: "123-456-789-000",
	vatRegistrationType: "VAT Registered",
	atcCode: "WI120",
	email: "maria.reyes@example.com",
	contactNo: "+63 917 123 4567",
};

export const MockPartyInformationRecords: PartyInformationRecord[] = [
	{
		id: "party_001",
		...PartyInformationSampleState,
		classification: "Individual",
		createdAt: "2026-01-08T08:00:00.000Z",
		updatedAt: "2026-01-08T08:00:00.000Z",
	},
	{
		id: "party_002",
		partyCodeNo: "PTY-2026-0002",
		classification: "Non-Individual",
		partyTypes: ["Vendor"],
		partyName: "Northstar Office Supplies Inc.",
		firstName: "",
		middleName: "",
		lastName: "",
		suffixName: "",
		address: {
			region: "CALABARZON",
			province: "Laguna",
			cityMunicipality: "Santa Rosa",
			barangay: "Balibago",
			lotUnit: "Warehouse 3",
			blockBuildingStreet: "Technology Avenue",
			subdivision: "Greenfield Auto Park",
			zipcode: "4026",
		},
		tin: "009-876-543-000",
		vatRegistrationType: "Non-VAT",
		atcCode: "WC120",
		email: "ap@northstar.example",
		contactNo: "+63 49 555 0188",
		createdAt: "2026-01-10T08:00:00.000Z",
		updatedAt: "2026-01-10T08:00:00.000Z",
	},
];

export function createPartyInformationFormValues(
	record: PartyInformationRecord,
): PartyInformationFormValues {
	return {
		partyCodeNo: record.partyCodeNo,
		classification: record.classification,
		partyTypes: [...record.partyTypes],
		partyName: record.partyName,
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
		partyCodeNo: values.partyCodeNo,
		classification: values.classification,
		partyTypes: values.partyTypes,
		name,
		address: { ...values.address },
		tin: values.tin.trim(),
		vatRegistrationType: values.vatRegistrationType,
		atcCode: values.atcCode,
		email: values.email.trim() || null,
		contactNo: values.contactNo.trim() || null,
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

export function validatePartyInformationForm(
	values: PartyInformationFormValues,
): PartyInformationFormErrors {
	const errors: PartyInformationFormErrors = {};

	if (!values.classification) {
		errors.classification = "Select a party classification first.";
	}

	if (values.classification && values.partyTypes.length === 0) {
		errors.partyTypes = "Select at least one party type.";
	}

	if (
		values.classification === "Non-Individual" &&
		!values.partyName.trim()
	) {
		errors.partyName = "Party name is required.";
	}

	if (values.classification === "Individual") {
		if (!values.firstName.trim()) {
			errors.firstName = "First name is required.";
		}

		if (!values.lastName.trim()) {
			errors.lastName = "Last name is required.";
		}
	}

	if (values.classification && !isKnownAtcCode(values.atcCode)) {
		errors.atcCode = "Select a valid BIR ATC code from the list.";
	}

	if (values.email.trim() && !isValidEmail(values.email)) {
		errors.email = "Enter a valid email address.";
	}

	return errors;
}

export function isPartyInformationFormSubmittable(
	values: PartyInformationFormValues,
) {
	return Object.keys(validatePartyInformationForm(values)).length === 0;
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

function normalizePartyRecordValues(
	values: PartyInformationFormValues,
): Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt"> {
	if (!values.classification) {
		throw new Error("Party classification is required.");
	}

	return {
		...values,
		classification: values.classification,
		partyName:
			values.classification === "Non-Individual"
				? values.partyName.trim()
				: "",
		firstName:
			values.classification === "Individual" ? values.firstName.trim() : "",
		middleName:
			values.classification === "Individual" ? values.middleName.trim() : "",
		lastName:
			values.classification === "Individual" ? values.lastName.trim() : "",
		suffixName:
			values.classification === "Individual" ? values.suffixName.trim() : "",
		address: {
			region: values.address.region.trim(),
			province: values.address.province.trim(),
			cityMunicipality: values.address.cityMunicipality.trim(),
			barangay: values.address.barangay.trim(),
			lotUnit: values.address.lotUnit.trim(),
			blockBuildingStreet: values.address.blockBuildingStreet.trim(),
			subdivision: values.address.subdivision.trim(),
			zipcode: values.address.zipcode.trim(),
		},
		tin: values.tin.trim(),
		email: values.email.trim(),
		contactNo: values.contactNo.trim(),
	};
}

function createPartyCodeNo() {
	return `PTY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
}

function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
