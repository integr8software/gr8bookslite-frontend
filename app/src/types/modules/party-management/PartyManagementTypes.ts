export type PartyClassification = "Individual" | "Non-Individual";

export type PartyType = "Vendor" | "Customer" | "Employee";

export type VatRegistrationType =
	| "VAT Registered"
	| "Zero Rated"
	| "Non-VAT"
	| "Exempt"
	| "Capital Goods"
	| "Other Than Capital Goods"
	| "Services";

export type PartyAddress = {
	region: string;
	province: string;
	cityMunicipality: string;
	barangay: string;
	lotUnit: string;
	blockBuildingStreet: string;
	subdivision: string;
	zipcode: string;
};

export type PartyInformationRecord = {
	id: string;
	partyCodeNo: string;
	classification: PartyClassification;
	partyTypes: PartyType[];
	partyName: string;
	firstName: string;
	middleName: string;
	lastName: string;
	suffixName: string;
	address: PartyAddress;
	tin: string;
	vatRegistrationType: VatRegistrationType | "";
	atcCode: string;
	email: string;
	contactNo: string;
	createdAt: string;
	updatedAt: string;
};

export type PartyInformationFormValues = {
	partyCodeNo: string;
	classification: PartyClassification | "";
	partyTypes: PartyType[];
	partyName: string;
	firstName: string;
	middleName: string;
	lastName: string;
	suffixName: string;
	address: PartyAddress;
	tin: string;
	vatRegistrationType: VatRegistrationType | "";
	atcCode: string;
	email: string;
	contactNo: string;
};

export type PartyInformationFormErrors = Partial<{
	partyCodeNo: string;
	classification: string;
	partyTypes: string;
	partyName: string;
	firstName: string;
	lastName: string;
	atcCode: string;
	email: string;
}>;

export type PartyInformationActionMode = "add" | "edit" | "view";

export type PartyAtcCodeOption = {
	code: string;
	label: string;
	category: string;
};

export type PartyInformationTableColumnKey =
	| "partyCodeNo"
	| "name"
	| "classification"
	| "partyTypesLabel"
	| "atcCode"
	| "contact";

export type PartyInformationTableRecord = PartyInformationRecord & {
	name: string;
	partyTypesLabel: string;
	contact: string;
};
