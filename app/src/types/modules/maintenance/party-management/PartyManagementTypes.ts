export type PartyClassification = "Individual" | "Non-Individual";

export type PartyInformationStatus = "Active" | "Inactive";

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
  addressLine1: string;
  addressLine2: string;
  barangay: string;
  barangayCode: string;
  cityMunicipality: string;
  cityMunicipalityCode: string;
  province: string;
  provinceCode: string;
  region: string;
  regionCode: string;
};

export type PartyInformationRecord = {
  id: string;
  partyCodeNo: string;
  classification: PartyClassification;
  partyTypes: PartyType[];
  status: PartyInformationStatus;
  partyName: string;
  tradeName: string;
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
  status: PartyInformationStatus;
  partyName: string;
  tradeName: string;
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
  status: string;
  partyName: string;
  firstName: string;
  lastName: string;
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;
  atcCode: string;
  tin: string;
  email: string;
  contactNo: string;
}>;

export type PartyInformationActionMode = "add" | "edit" | "view";

export type PartyAtcCodeOption = {
  category: string;
  classifications: PartyClassification[];
  code: string;
  description: string;
  label: string;
};

export type PartyInformationTableColumnKey =
  | "addressLabel"
  | "name"
  | "classification"
  | "partyTypesLabel"
  | "status";

export type PartyInformationTableRecord = PartyInformationRecord & {
  addressLabel: string;
  name: string;
  partyTypesLabel: string;
};

export type PartyManagementListSort = {
  desc: boolean;
  id: PartyInformationTableColumnKey | "actions";
};

export type PartyManagementListQuery = {
  classification: PartyClassification | "All";
  pageIndex: number;
  pageSize: number;
  partyType: PartyType | "All";
  query: string;
  sort?: PartyManagementListSort;
  status: PartyInformationStatus | "All";
};

export type PartyManagementListResponse = {
  records: PartyInformationRecord[];
  totalRows: number;
};

export type PartyManagementAnalytics = {
  activepartyName: number;
  inactivepartyName: number;
  individualpartyName: number;
  multiTypepartyName: number;
  organizationpartyName: number;
  totalpartyName: number;
};
