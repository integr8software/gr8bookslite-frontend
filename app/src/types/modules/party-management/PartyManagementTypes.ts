import type { ChangeEventHandler, ReactNode } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { AddressAutocompleteDetails, AddressAutocompleteItem } from "@/app/src/types/shared/address/AddressTypes";
import type { ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import type { PartyTaxDefaultOptions } from "@/app/src/types/shared/tax/TaxTypes";

export type PartyClassification = "Individual" | "Non-Individual";

export type PartyInformationStatus = "Active" | "Inactive";

export type PartyManagementAllFilter = "All";

export type PartyType = "Vendor" | "Customer" | "Employee" | "Member";

export type PartyEntityType = string;

export type ApiPartyClassification = "INDIVIDUAL" | "NON_INDIVIDUAL";

export type ApiPartyEntityType = string;

export type ApiPartyStatus = "ACTIVE" | "INACTIVE";

export type ApiPartyType = "VENDOR" | "CUSTOMER" | "EMPLOYEE" | "MEMBER";

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
  partyEntityType: PartyEntityType | "";
  partyTypes: PartyType[];
  status: PartyInformationStatus;
  partyName: string;
  tradeName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffixName: string;
  honorific?: string;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  memberRegistrationDate?: string;
  address: PartyAddress;
  addresses: PartyAddress[];
  defaultReceivableAccount: string;
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  vendorAdvanceAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  cashAdvanceLimit?: string;
  termId: string;
  termName: string;
  tin: string;
  atcCode: string;
  defaultPurchaseInputVatTaxSourceKey: string;
  defaultPurchaseEwtTaxSourceKey: string;
  defaultPurchaseFwtTaxSourceKey: string;
  defaultPurchaseWvatTaxSourceKey: string;
  defaultSalesOutputVatTaxSourceKey: string;
  defaultSalesCwtTaxSourceKey: string;
  defaultSalesWvatTaxSourceKey: string;
  contactPerson: string;
  email: string;
  contactNo: string;
  landline?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};

export type PartyInformationFormValues = {
  partyCodeNo: string;
  classification: PartyClassification | "";
  partyEntityType: PartyEntityType | "";
  partyTypes: PartyType[];
  status: PartyInformationStatus;
  partyName: string;
  tradeName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffixName: string;
  honorific: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  memberRegistrationDate: string;
  address: PartyAddress;
  addresses: PartyAddress[];
  activeAddressId: string;
  defaultReceivableAccount: string;
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  vendorAdvanceAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  cashAdvanceLimit: string;
  termId: string;
  termName: string;
  tin: string;
  atcCode: string;
  defaultPurchaseInputVatTaxSourceKey: string;
  defaultPurchaseEwtTaxSourceKey: string;
  defaultPurchaseFwtTaxSourceKey: string;
  defaultPurchaseWvatTaxSourceKey: string;
  defaultSalesOutputVatTaxSourceKey: string;
  defaultSalesCwtTaxSourceKey: string;
  defaultSalesWvatTaxSourceKey: string;
  contactPerson: string;
  email: string;
  contactNo: string;
  landline: string;
};

export type PartyInformationFormErrors = Partial<{
  partyCodeNo: string;
  classification: string;
  partyEntityType: string;
  partyTypes: string;
  status: string;
  partyName: string;
  firstName: string;
  honorific: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  memberRegistrationDate: string;
  lastName: string;
  addresses: string;
  addressLine1: string;
  addressLine2: string;
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;
  atcCode: string;
  defaultPurchaseInputVatTaxSourceKey: string;
  defaultPurchaseEwtTaxSourceKey: string;
  defaultPurchaseFwtTaxSourceKey: string;
  defaultPurchaseWvatTaxSourceKey: string;
  defaultSalesOutputVatTaxSourceKey: string;
  defaultSalesCwtTaxSourceKey: string;
  defaultSalesWvatTaxSourceKey: string;
  defaultReceivableAccount: string;
  customerAdvanceAccount: string;
  defaultPayableAccount: string;
  vendorAdvanceAccount: string;
  employeeAdvanceAccount: string;
  employeePayableAccount: string;
  cashAdvanceLimit: string;
  termId: string;
  tin: string;
  contactPerson: string;
  email: string;
  contactNo: string;
  landline: string;
}>;

export type PartyInformationActionMode = "add" | "edit" | "view";

export type PartyInformationTabId = "accounting-information" | "basic-information" | "contact-information" | "tax-information";

export type PartyInformationTab = ModuleTabItem<PartyInformationTabId> & {
  content: ReactNode;
};

export type PartyInformationActionHeaderProps = {
  canSave?: boolean;
  editHref?: string;
  isReadonly: boolean;
  mode: PartyInformationActionMode;
  nextStatus?: PartyInformationStatus;
  onCancel?: () => void;
  onSave?: () => void;
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
  | "billingAddressLabel"
  | "classification"
  | "civilStatus"
  | "contactPerson"
  | "contactNo"
  | "createdAt"
  | "createdBy"
  | "email"
  | "gender"
  | "homeAddressLabel"
  | "landline"
  | "memberRegistrationDate"
  | "name"
  | "nationality"
  | "partyEntityType"
  | "partyTypesLabel"
  | "partyCodeNo"
  | "deliveryAddressLabel"
  | "status"
  | "tin"
  | "updatedAt"
  | "updatedBy";

export type PartyInformationTableRecord = PartyInformationRecord & {
  billingAddressLabel: string;
  deliveryAddressLabel: string;
  homeAddressLabel: string;
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
  classificationFilter: PartyClassification | PartyManagementAllFilter;
  classificationOptions: readonly PartyClassification[];
  partyTypeFilter: PartyType | PartyManagementAllFilter;
  partyTypeOptions: readonly PartyType[];
  query: string;
  statusFilter: PartyInformationStatus | PartyManagementAllFilter;
  statusOptions: readonly PartyInformationStatus[];
  table: Table<PartyInformationTableRecord>;
  isRefreshing: boolean;
  onClassificationFilterChange: (value: PartyClassification | PartyManagementAllFilter) => void;
  onPartyTypeFilterChange: (value: PartyType | PartyManagementAllFilter) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: PartyInformationStatus | PartyManagementAllFilter) => void;
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

export type PartyInformationFieldUpdateHandler = <TKey extends keyof PartyInformationFormValues>(
  field: TKey,
  value: PartyInformationFormValues[TKey],
) => void;

export type PartyInformationDetailsFieldsProps = {
  accountOptions: PartyAccountingAccountOptions;
  errors: PartyInformationFormErrors;
  isClassificationSelected: boolean;
  isPartyCodeReadonly?: boolean;
  isReadonly: boolean;
  partyTypeOptions: readonly PartyType[];
  taxDefaultOptionsError?: boolean;
  taxDefaultOptionsLoading?: boolean;
  taxDefaultOptions: PartyTaxDefaultOptions;
  termOptions: PartyAddressDropdownOption[];
  values: PartyInformationFormValues;
  syncedAddressSources?: Record<string, string>;
  canAddAccountTitle?: boolean;
  canAddTerm?: boolean;
  onAddAccountTitle?: (field: PartyAccountingAccountField) => void;
  onAddTerm?: () => void;
  onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
  onCopyAddress: (sourceAddressId: string, targetAddressId: string) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onPartyTypesChange: (value: string | string[]) => void;
  onSelectAutocompleteAddress: (address: AddressAutocompleteItem, details?: AddressAutocompleteDetails, addressId?: string) => void;
  onSyncAutocompleteAddressDetails?: (details: AddressAutocompleteDetails, addressId?: string) => void;
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
  syncedAddressSources?: Record<string, string>;
  onAddressInputChange: ChangeEventHandler<HTMLInputElement>;
  onCopyAddress: (sourceAddressId: string, targetAddressId: string) => void;
  onSelectAutocompleteAddress: (address: AddressAutocompleteItem, details?: AddressAutocompleteDetails, addressId?: string) => void;
  onSelectBarangay: (value: string | string[], addressId?: string, option?: PartyAddressDropdownOption) => void;
  onSelectCityMunicipality: (value: string | string[], addressId?: string, option?: PartyAddressDropdownOption) => void;
  onSelectProvince: (value: string | string[], addressId?: string, option?: PartyProvinceOption) => void;
  onSyncAutocompleteAddressDetails?: (details: AddressAutocompleteDetails, addressId?: string) => void;
};

export type PartyManagementDrawerProps = {
  description?: string;
  isOpen: boolean;
  isPending: boolean;
  onAddRecord: (record: PartyInformationRecord) => Promise<PartyInformationRecord>;
  onClose: () => void;
  onCreateParty: (record: PartyInformationRecord) => void;
  records: PartyInformationRecord[];
  suggestedPartyType?: PartyType;
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
  classification: PartyClassification | PartyManagementAllFilter;
  pageIndex: number;
  pageSize: number;
  partyType: PartyType | PartyManagementAllFilter;
  query: string;
  sort?: PartyManagementListSort;
  status: PartyInformationStatus | PartyManagementAllFilter;
};

export type PartyManagementListPage = {
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

export type PartyManagementStatisticCardsProps = {
  analytics: PartyManagementAnalytics;
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

export type PartyAccountingAccountIds = Record<PartyAccountingAccountField, string>;

export type PartyAccountingAccountOptions = Record<PartyAccountingAccountField, PartyAccountingAccountOption[]>;

export type PartyImportColumnId =
  | "partyCodeNo"
  | "classification"
  | "partyEntityType"
  | "partyTypes"
  | "partyName"
  | "tradeName"
  | "honorific"
  | "firstName"
  | "middleName"
  | "lastName"
  | "suffixName"
  | "gender"
  | "civilStatus"
  | "nationality"
  | "memberRegistrationDate"
  | "tin"
  | "atcCode"
  | "contactPerson"
  | "email"
  | "contactNo"
  | "landline"
  | "addressLine1"
  | "addressLine2"
  | "barangay"
  | "cityMunicipality"
  | "province"
  | "homeAddressLine1"
  | "homeAddressLine2"
  | "homeBarangay"
  | "homeCityMunicipality"
  | "homeProvince"
  | "billingAddressLine1"
  | "billingAddressLine2"
  | "billingBarangay"
  | "billingCityMunicipality"
  | "billingProvince"
  | "deliveryAddressLine1"
  | "deliveryAddressLine2"
  | "deliveryBarangay"
  | "deliveryCityMunicipality"
  | "deliveryProvince"
  | "termName"
  | "defaultReceivableAccount"
  | "customerAdvanceAccount"
  | "defaultPayableAccount"
  | "vendorAdvanceAccount"
  | "employeeAdvanceAccount"
  | "employeePayableAccount"
  | "cashAdvanceLimit";

export type PartyImportColumnHeader = {
  className: string;
  id: PartyImportColumnId;
  label: string;
};

export type PartyImportColumnWidths = Record<PartyImportColumnId, number>;

export type PartyImportCellErrors = Partial<Record<PartyImportColumnId, string[]>>;

export type PartyImportCellWarnings = Partial<Record<PartyImportColumnId, string[]>>;

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
  onImportParties: (parties: PartyInformationRecord[]) => Promise<PartyInformationRecord[]>;
};
