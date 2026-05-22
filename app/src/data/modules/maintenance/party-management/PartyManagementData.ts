import {
	BIRAtcSourceUrl,
	PartyTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	PhilippineAtcTaxRows,
	getPhilippineAtcPartyClassification,
	normalizePhilippineAtcCode,
	type PhilippineTaxCodeRow,
} from "@/app/src/data/shared/PhilippineAtcData";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import type {
	PartyAddress,
	PartyAtcCodeOption,
	PartyClassification,
	PartyInformationFormValues,
	PartyInformationRecord,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export const PartyAtcCodeOptions: PartyAtcCodeOption[] =
	createPartyAtcCodeOptions();

export const PartyAtcCodeSource = {
	label: "BIR Form 2307, January 2018 ENCS - Schedules of Alphanumeric Tax Codes",
	url: BIRAtcSourceUrl,
};

function createPartyAtcCodeOptions() {
	const optionsByCode = new Map<
		string,
		{ option: PartyAtcCodeOption; priority: number }
	>();

	for (const row of PhilippineAtcTaxRows) {
		const option = createPartyAtcCodeOption(row);
		const priority = getPartyAtcRowPriority(row);
		const currentOption = optionsByCode.get(option.code);

		if (!currentOption || priority > currentOption.priority) {
			optionsByCode.set(option.code, { option, priority });
		}
	}

	return [...optionsByCode.values()].map(({ option }) => option);
}

function createPartyAtcCodeOption(
	row: PhilippineTaxCodeRow & { officialAtcCode: string },
): PartyAtcCodeOption {
	return {
		category: getPartyAtcCategory(row),
		classifications: getPartyAtcClassifications(row.officialAtcCode),
		code: row.officialAtcCode,
		description: getPartyAtcDescription(row),
		label: `${row.transactionType} ${row.taxType} ${formatPartyAtcRate(
			row.taxRate,
		)}`,
	};
}

function getPartyAtcCategory(
	row: PhilippineTaxCodeRow & { officialAtcCode: string },
) {
	if (row.officialAtcCode.startsWith("WV ")) {
		return "VAT Withholding";
	}

	if (row.taxType === "CWT") {
		return "Creditable Withholding Tax";
	}

	if (row.officialAtcCode.startsWith("WB ")) {
		return "Business Tax Withholding";
	}

	if (row.taxType === "EWT") {
		return "Expanded Withholding Tax";
	}

	return row.taxType;
}

function getPartyAtcClassifications(code: string): PartyClassification[] {
	const classification = getPhilippineAtcPartyClassification(code);

	if (classification === "individual") {
		return ["Individual"];
	}

	if (classification === "nonIndividual") {
		return ["Non-Individual"];
	}

	return ["Individual", "Non-Individual"];
}

function getPartyAtcDescription(row: PhilippineTaxCodeRow) {
	return (
		row.natureOfIncome?.trim() ||
		row.taxDescription.replace(/^[A-Z]{2}\s?\d{3}\s*\|\s*/, "").trim()
	);
}

function getPartyAtcRowPriority(row: PhilippineTaxCodeRow) {
	const isDirectAtcRow =
		row.officialAtcCode === normalizePhilippineAtcCode(row.taxCode);

	return (isDirectAtcRow ? 1_000_000 : 0) + getPartyAtcDescription(row).length;
}

function formatPartyAtcRate(rate: number) {
	return `${rate.toFixed(2)}%`;
}

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
		atcCode: record.atcCode ? normalizePhilippineAtcCode(record.atcCode) : "",
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
		atcCode: values.atcCode ? normalizePhilippineAtcCode(values.atcCode) : "",
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
	const normalizedCode = normalizePhilippineAtcCode(value);

	return PartyAtcCodeOptions.some((option) => option.code === normalizedCode);
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
		atcCode: values.atcCode ? normalizePhilippineAtcCode(values.atcCode) : "",
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

