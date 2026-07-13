import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type {
  AddressAutocompleteDetails,
  AddressAutocompleteItem,
} from "@/app/src/types/shared/address/AddressTypes";

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

export type ApiPartyClassification = "INDIVIDUAL" | "NON_INDIVIDUAL";

export type ApiPartyStatus = "ACTIVE" | "INACTIVE";

export type ApiPartyType = "VENDOR" | "CUSTOMER" | "EMPLOYEE";

export type ApiPartyVatRegistrationType =
  | "VAT_REGISTERED"
  | "ZERO_RATED"
  | "NON_VAT"
  | "EXEMPT"
  | "CAPITAL_GOODS"
  | "OTHER_THAN_CAPITAL_GOODS"
  | "SERVICES";

export type PartyAddress = {
  id: string;
  addressName: string;
  addressLine1: string;
  addressLine2: string;
  barangay: string;
  barangayCode: string;
  cityMunicipality: string;
  cityMunicipalityCode: string;
  isBilling: boolean;
  isBuilding?: boolean;
  isDefault: boolean;
  isDelivery: boolean;
  isForeign?: boolean;
  isHome?: boolean;
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
  addresses: PartyAddress[];
  defaultReceivableAccount: string;
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  vendorAdvanceAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  termId: string;
  termName: string;
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
  addresses: PartyAddress[];
  activeAddressId: string;
  defaultReceivableAccount: string;
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  vendorAdvanceAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  termId: string;
  termName: string;
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
  addresses: string;
  addressLine1: string;
  addressLine2: string;
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;
  atcCode: string;
  defaultReceivableAccount: string;
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  vendorAdvanceAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  termId: string;
  tin: string;
  email: string;
  contactNo: string;
}>;

export type PartyInformationActionMode = "add" | "edit" | "view";

export type PartyInformationActionHeaderProps = {
  canSave?: boolean;
  cancelHref: string;
  editHref?: string;
  isReadonly: boolean;
  mode: PartyInformationActionMode;
  nextStatus?: PartyInformationStatus;
  onStatusChange?: () => void;
};

export type PartyInformationHeaderProps = {
  onImport: () => void;
};

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

export type PartyInformationTableProps = {
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  records: PartyInformationRecord[];
  onRefresh: () => void;
};

export type PartyInformationTableRowProps = {
  row: Row<PartyInformationTableRecord>;
};

export type PartyInformationRecordActionsProps = {
  record: PartyInformationTableRecord;
};

export type PartyInformationTableFiltersProps = {
  exportAllRows: PartyInformationTableRecord[];
  exportFilteredRows: PartyInformationTableRecord[];
  hasActiveFilters: boolean;
  classificationFilter: PartyClassification | "All";
  classificationOptions: readonly PartyClassification[];
  partyTypeFilter: PartyType | "All";
  partyTypeOptions: readonly PartyType[];
  query: string;
  statusFilter: PartyInformationStatus | "All";
  statusOptions: readonly PartyInformationStatus[];
  table: Table<PartyInformationTableRecord>;
  isRefreshing: boolean;
  onClassificationFilterChange: (value: PartyClassification | "All") => void;
  onPartyTypeFilterChange: (value: PartyType | "All") => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: PartyInformationStatus | "All") => void;
};

export type PartyAddressDropdownOption = {
  children?: PartyAddressDropdownOption[];
  description?: string;
  disabled?: boolean;
  href?: string;
  label?: string;
  name: string;
  value: string;
};

export type PartyInformationFieldUpdateHandler = <
  TKey extends keyof PartyInformationFormValues,
>(
  field: TKey,
  value: PartyInformationFormValues[TKey],
) => void;

export type PartyInformationDetailsFieldsProps = {
  accountOptions: PartyAccountingAccountOptions;
  atcOptions: PartyAtcCodeOption[];
  errors: PartyInformationFormErrors;
  isClassificationSelected: boolean;
  isPartyCodeReadonly?: boolean;
  isReadonly: boolean;
  partyTypeOptions: readonly PartyType[];
  termOptions: PartyAddressDropdownOption[];
  values: PartyInformationFormValues;
  onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onPartyTypesChange: (value: string | string[]) => void;
  onSelectAtcCode: (value: string | string[]) => void;
  onSelectAutocompleteAddress: (
    address: AddressAutocompleteItem,
    details?: AddressAutocompleteDetails,
    addressId?: string,
  ) => void;
  onSyncAutocompleteAddressDetails?: (
    details: AddressAutocompleteDetails,
    addressId?: string,
  ) => void;
  onSelectBarangay: (value: string | string[], addressId?: string) => void;
  onSelectCityMunicipality: (value: string | string[], addressId?: string) => void;
  onSelectProvince: (value: string | string[], addressId?: string) => void;
  onUpdateField: PartyInformationFieldUpdateHandler;
  onSelectTerm: (value: string | string[]) => void;
};

export type PartyAddressContainerProps = {
  addresses: PartyAddress[];
  disabled: boolean;
  errors: PartyInformationFormErrors;
  partyTypes: PartyType[];
  onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
  onSelectAutocompleteAddress: (
    address: AddressAutocompleteItem,
    details?: AddressAutocompleteDetails,
    addressId?: string,
  ) => void;
  onSelectBarangay: (
    value: string | string[],
    addressId?: string,
    option?: PartyAddressDropdownOption,
  ) => void;
  onSelectCityMunicipality: (
    value: string | string[],
    addressId?: string,
    option?: PartyAddressDropdownOption,
  ) => void;
  onSelectProvince: (
    value: string | string[],
    addressId?: string,
    option?: PartyProvinceOption,
  ) => void;
  onSyncAutocompleteAddressDetails?: (
    details: AddressAutocompleteDetails,
    addressId?: string,
  ) => void;
};

export type PartyManagementDrawerProps = {
  description?: string;
  isOpen: boolean;
  isPending: boolean;
  onAddRecord: (record: PartyInformationRecord) => void;
  onClose: () => void;
  onCreateParty: (record: PartyInformationRecord) => void;
  records: PartyInformationRecord[];
  title?: string;
};

export type PartyProvinceOption = PartyAddressDropdownOption & {
  regionCode?: string;
  regionName?: string;
};

export type PartyAddressOptionSet = {
  barangayOptions: PartyAddressDropdownOption[];
  cityMunicipalityOptions: PartyAddressDropdownOption[];
  isBarangaysLoading: boolean;
  isCitiesMunicipalitiesLoading: boolean;
  isProvincesLoading: boolean;
  provinceOptions: PartyProvinceOption[];
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

export type PartyManagementPermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canCancel: boolean;
  canUncancel: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type PartyManagementStatistics = {
  activeParties: number;
  inactiveParties: number;
  individualParties: number;
  multiTypeParties: number;
  nonIndividualParties: number;
  totalParties: number;
};

export type PartyManagementAnalytics = {
  activepartyName: number;
  inactivepartyName: number;
  individualpartyName: number;
  multiTypepartyName: number;
  organizationpartyName: number;
  totalpartyName: number;
};

export type ApiPartyAddress = {
  id?: string;
  addressName: string;
  addressLine1: string;
  addressLine2: string;
  barangay?: string | null;
  barangayCode?: string | null;
  cityMunicipality?: string | null;
  cityMunicipalityCode?: string | null;
  isBilling: boolean;
  isBuilding?: boolean;
  isDefault: boolean;
  isDelivery: boolean;
  isForeign?: boolean;
  isHome?: boolean;
  province?: string | null;
  provinceCode?: string | null;
  region?: string | null;
  regionCode?: string | null;
};

export type ApiPartyPayload = {
  branchUnitId?: number;
  partyCodeNo: string;
  classification: ApiPartyClassification;
  partyTypes: ApiPartyType[];
  status?: ApiPartyStatus;
  partyName?: string | null;
  tradeName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffixName?: string | null;
  addresses: ApiPartyAddress[];
  defaultReceivableAccount?: string | null;
  customerAdvanceAccount?: string | null;
  defaultPayableAccount?: string | null;
  vendorAdvanceAccount?: string | null;
  employeeAdvanceAccount?: string | null;
  employeePayableAccount?: string | null;
  termId?: string | null;
  tin?: string | null;
  vatRegistrationType?: ApiPartyVatRegistrationType | null;
  atcCode?: string | null;
  email?: string | null;
  contactNo?: string | null;
};

export type ApiParty = ApiPartyPayload & {
  id: string;
  address?: ApiPartyAddress;
  accountingAccounts?: {
    customerAdvanceAccount: PartyAccountingAccountSummary | null;
    defaultPayableAccount: PartyAccountingAccountSummary | null;
    defaultReceivableAccount: PartyAccountingAccountSummary | null;
    employeeAdvanceAccount: PartyAccountingAccountSummary | null;
    employeePayableAccount: PartyAccountingAccountSummary | null;
    vendorAdvanceAccount: PartyAccountingAccountSummary | null;
  };
  termName?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};

export type PartyAccountingAccountSummary = {
  id: string;
  accountCode: string;
  accountTitle: string;
};

export type PartyAccountingAccountField =
  | "customerAdvanceAccount"
  | "defaultPayableAccount"
  | "defaultReceivableAccount"
  | "employeeAdvanceAccount"
  | "employeePayableAccount"
  | "vendorAdvanceAccount";

export type PartyAccountingAccountOption = {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  statementGroup: string;
  statementSection: string;
  normalBalance: "Debit" | "Credit";
  accountCategory: string;
  description: string;
  status: "Active" | "Inactive";
};

export type PartyAccountingAccountIds = Record<
  PartyAccountingAccountField,
  string
>;

export type PartyAccountingAccountOptions = Record<
  PartyAccountingAccountField,
  PartyAccountingAccountOption[]
>;

export type ApiPartyAccountingOptionsResponse = {
  defaultAccounts: PartyAccountingAccountIds;
  accountOptions: PartyAccountingAccountOptions;
};

export type ApiPartyListResponse = {
  parties: ApiParty[];
  totalRows: number;
  statistics: PartyManagementStatistics;
  permissions: PartyManagementPermissions;
};

export type ApiPartySaveResponse = {
  party: ApiParty;
};

export type ApiPartyImportResponse = {
  parties: ApiParty[];
};

export type PartyImportColumnId =
  | "partyCodeNo"
  | "classification"
  | "partyTypes"
  | "partyName"
  | "tradeName"
  | "firstName"
  | "middleName"
  | "lastName"
  | "suffixName"
  | "tin"
  | "vatRegistrationType"
  | "atcCode"
  | "email"
  | "contactNo"
  | "addressLine1"
  | "addressLine2"
  | "barangay"
  | "cityMunicipality"
  | "province"
  | "region";

export type PartyImportColumnHeader = {
  className: string;
  id: PartyImportColumnId;
  label: string;
};

export type PartyImportColumnWidths = Record<PartyImportColumnId, number>;

export type PartyImportCellErrors = Partial<
  Record<PartyImportColumnId, string[]>
>;

export type PartyImportCellWarnings = Partial<
  Record<PartyImportColumnId, string[]>
>;

export type PartyImportPreviewRow = {
  cellErrors: PartyImportCellErrors;
  cellWarnings: PartyImportCellWarnings;
  id: string;
  party: Omit<PartyInformationRecord, "id" | "createdAt" | "updatedAt">;
  rowErrors: string[];
  rowNumber: number;
};

export type PartyImportProgress = {
  imported: number;
  total: number;
};

export type PartyImportMode = "all-rows" | "all-valid" | "selected-valid";

export type PartyManagementImportDialogProps = {
  existingParties: PartyInformationRecord[];
  isOpen: boolean;
  onClose: () => void;
  onImportParties: (
    parties: PartyInformationRecord[],
  ) => Promise<PartyInformationRecord[]>;
};
