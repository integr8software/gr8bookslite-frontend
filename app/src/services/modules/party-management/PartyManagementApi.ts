import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  partyMaintenanceControllerCreateV1,
  partyMaintenanceControllerFindAccountingOptionsV1,
  partyMaintenanceControllerFindAllV1,
  partyMaintenanceControllerFindOptionsV1,
  partyMaintenanceControllerImportPartiesV1,
  partyMaintenanceControllerUpdateV1,
} from "@/app/src/generated/api/party-maintenance/party-maintenance";
import type {
  CreatePartyAddressDto,
  CreatePartyDto,
  CreatePartyDtoClassification,
  CreatePartyDtoPartyTypesItem,
  CreatePartyDtoStatus,
  PartyAddressResponseDto,
  PartyResponseDto,
  PartyResponseDtoClassification,
  PartyResponseDtoPartyTypesItem,
  PartyResponseDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PartyAddress,
  PartyClassification,
  PartyInformationRecord,
  PartyInformationStatus,
  PartyManagementListQuery,
  PartyManagementListPage,
  PartyManagementPermissions,
  PartyManagementStatistics,
  PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { CashAdvanceEmployeeOption } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { ItemSupplierRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

const EmptyPartyStatistics: PartyManagementStatistics = {
  activeParties: 0,
  inactiveParties: 0,
  individualParties: 0,
  multiTypeParties: 0,
  nonIndividualParties: 0,
  totalParties: 0,
};

const EmptyPartyPermissions: PartyManagementPermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canCancel: false,
  canUncancel: false,
  canExport: false,
  canImport: false,
};

const AllPartiesFilter = "All";
const BillingAddressRole = "billing";
const CustomerPartyType: PartyType = "Customer";
const DeliveryAddressRole = "delivery";
const EmployeeApiPartyType = "EMPLOYEE";
const EmployeePartyType: PartyType = "Employee";
const HomeAddressRole = "home";
const IndividualClassification: PartyClassification = "Individual";
const VendorPartyType: PartyType = "Vendor";

export async function fetchPartyManagementRecords(): Promise<{
  permissions: PartyManagementPermissions;
  records: PartyInformationRecord[];
  statistics: PartyManagementStatistics;
  totalRows: number;
}> {
  const response = await partyMaintenanceControllerFindAllV1({
    page: 1,
    pageSize: 500,
    sortBy: "name",
    sortDirection: "asc",
  });

  return {
    permissions: {
      ...EmptyPartyPermissions,
      ...response.permissions,
    },
    records: response.parties.map(mapApiParty),
    statistics: response.statistics ?? EmptyPartyStatistics,
    totalRows: response.totalRows,
  };
}

export async function createPartyManagementRecord(
  record: PartyInformationRecord,
  options: { branchUnitId?: number | null } = {},
): Promise<PartyInformationRecord> {
  const response = await partyMaintenanceControllerCreateV1(toApiPartyPayload(record, options));

  return mapApiParty(response.party);
}

export async function updatePartyManagementRecord(record: PartyInformationRecord): Promise<PartyInformationRecord> {
  const response = await partyMaintenanceControllerUpdateV1(record.id, toApiPartyPayload(record));

  return mapApiParty(response.party);
}

export async function importPartyManagementRecords(
  records: PartyInformationRecord[],
  options: { branchUnitId?: number | null } = {},
): Promise<PartyInformationRecord[]> {
  const response = await partyMaintenanceControllerImportPartiesV1({
    branchUnitId: options.branchUnitId ?? undefined,
    parties: records.map((record) => toApiPartyPayload(record, options)),
  });

  return response.parties.map(mapApiParty);
}

export async function fetchPartyManagementAccountingOptions() {
  return partyMaintenanceControllerFindAccountingOptionsV1();
}

export async function fetchPartyOptions(partyType: PartyType): Promise<ItemSupplierRecord[]> {
  const response = await partyMaintenanceControllerFindOptionsV1(mapPartyTypeToApi(partyType));

  return response.parties.map((party) => ({
    id: party.id,
    code: party.partyCodeNo,
    name: party.name,
    contactPerson: party.contactPerson || party.name,
    contactDetails: party.email || party.contactNo,
    status: mapStatusFromApi(party.status),
  }));
}

export async function fetchCashAdvanceEmployeeOptions(): Promise<CashAdvanceEmployeeOption[]> {
  const response = await partyMaintenanceControllerFindOptionsV1(EmployeeApiPartyType);

  return response.parties.map((party) => ({
    cashAdvanceBalance: party.cashAdvanceBalance ?? party.cashAdvanceLimit ?? "",
    cashAdvanceLimit: party.cashAdvanceLimit ?? "",
    partyCode: party.partyCodeNo,
    partyName: party.name,
  }));
}

export async function GetPartyManagementRecordsPage({
  query,
  records,
}: {
  query: PartyManagementListQuery;
  records: PartyInformationRecord[];
}): Promise<PartyManagementListPage> {
  const normalizedQuery = query.query.trim().toLowerCase();
  const filteredRecords = records.filter((record) => {
    const name = getPartyDisplayName(record).toLowerCase();
    const address = formatPartyAddress(record.address).toLowerCase();
    const billingAddress = formatPartyAddress(getPartyAddressByRole(record, BillingAddressRole)).toLowerCase();
    const homeAddress = formatPartyAddress(getPartyAddressByRole(record, HomeAddressRole)).toLowerCase();
    const deliveryAddress = formatPartyAddress(getPartyAddressByRole(record, DeliveryAddressRole)).toLowerCase();

    return (
      (query.classification === AllPartiesFilter || record.classification === query.classification) &&
      (query.partyType === AllPartiesFilter || record.partyTypes.includes(query.partyType)) &&
      (query.status === AllPartiesFilter || record.status === query.status) &&
      (!normalizedQuery ||
        name.includes(normalizedQuery) ||
        record.partyCodeNo.toLowerCase().includes(normalizedQuery) ||
        record.partyEntityType.toLowerCase().includes(normalizedQuery) ||
        record.contactPerson.toLowerCase().includes(normalizedQuery) ||
        record.email.toLowerCase().includes(normalizedQuery) ||
        record.contactNo.toLowerCase().includes(normalizedQuery) ||
        (record.landline ?? "").toLowerCase().includes(normalizedQuery) ||
        record.tin.toLowerCase().includes(normalizedQuery) ||
        billingAddress.includes(normalizedQuery) ||
        homeAddress.includes(normalizedQuery) ||
        deliveryAddress.includes(normalizedQuery) ||
        address.includes(normalizedQuery))
    );
  });
  const sortedRecords = sortPartyManagementRecords(filteredRecords, query);
  const startIndex = query.pageIndex * query.pageSize;

  return {
    records: sortedRecords.slice(startIndex, startIndex + query.pageSize),
    totalRows: sortedRecords.length,
  };
}

function mapApiParty(party: PartyResponseDto): PartyInformationRecord {
  const addresses = (party.addresses.length > 0 ? party.addresses : party.address ? [party.address] : []).map(mapApiPartyAddress);
  const address = addresses.find((current) => current.isDefault) ?? addresses[0] ?? createEmptyApiMappedAddress();

  return {
    id: party.id,
    partyCodeNo: party.partyCodeNo,
    classification: mapClassificationFromApi(party.classification),
    partyEntityType: mapPartyEntityTypeFromApi(party.partyEntityType),
    partyTypes: party.partyTypes.map(mapPartyTypeFromApi),
    status: mapStatusFromApi(party.status ?? "ACTIVE"),
    partyName: party.partyName ?? "",
    tradeName: party.tradeName ?? "",
    firstName: party.firstName ?? "",
    middleName: party.middleName ?? "",
    lastName: party.lastName ?? "",
    suffixName: party.suffixName ?? "",
    honorific: normalizePartyHonorific(party.honorific ?? ""),
    gender: party.gender ?? "",
    civilStatus: party.civilStatus ?? "",
    nationality: party.nationality ?? "",
    memberRegistrationDate: party.memberRegistrationDate ?? "",
    address,
    addresses,
    defaultReceivableAccount: party.defaultReceivableAccount ?? "",
    customerAdvanceAccount: party.customerAdvanceAccount ?? "",
    defaultPayableAccount: party.defaultPayableAccount ?? "",
    vendorAdvanceAccount: party.vendorAdvanceAccount ?? "",
    employeeAdvanceAccount: party.employeeAdvanceAccount ?? "",
    employeePayableAccount: party.employeePayableAccount ?? "",
    cashAdvanceLimit: party.cashAdvanceLimit ?? "",
    termId: party.termId ?? "",
    termName: party.termName ?? "",
    tin: party.tin ?? "",
    atcCode: party.atcCode ?? "",
    defaultPurchaseInputVatTaxSourceKey: party.defaultPurchaseInputVatTaxSourceKey ?? "",
    defaultPurchaseEwtTaxSourceKey: party.defaultPurchaseEwtTaxSourceKey ?? "",
    defaultPurchaseFwtTaxSourceKey: party.defaultPurchaseFwtTaxSourceKey ?? "",
    defaultPurchaseWvatTaxSourceKey: party.defaultPurchaseWvatTaxSourceKey ?? "",
    defaultSalesOutputVatTaxSourceKey: party.defaultSalesOutputVatTaxSourceKey ?? "",
    defaultSalesCwtTaxSourceKey: party.defaultSalesCwtTaxSourceKey ?? "",
    defaultSalesWvatTaxSourceKey: party.defaultSalesWvatTaxSourceKey ?? "",
    contactPerson: party.contactPerson ?? "",
    email: party.email ?? "",
    contactNo: party.contactNo ?? "",
    landline: party.landline ?? "",
    createdBy: party.createdBy ?? "",
    createdAt: party.createdAt,
    updatedBy: party.updatedBy ?? "",
    updatedAt: party.updatedAt ?? "",
  };
}

function mapApiPartyAddress(address: PartyAddressResponseDto): PartyAddress {
  return {
    id: address.id ?? crypto.randomUUID(),
    addressName: address.addressName,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    barangay: address.barangay ?? "",
    barangayCode: address.barangayCode ?? "",
    cityMunicipality: address.cityMunicipality ?? "",
    cityMunicipalityCode: address.cityMunicipalityCode ?? "",
    isBilling: address.isBilling,
    isBuilding: Boolean(address.isBuilding),
    isDefault: address.isDefault,
    isDelivery: address.isDelivery,
    isForeign: Boolean(address.isForeign),
    isHome: Boolean(address.isHome),
    province: address.province ?? "",
    provinceCode: address.provinceCode ?? "",
    region: address.region ?? "",
    regionCode: address.regionCode ?? "",
  };
}

function toApiPartyPayload(record: PartyInformationRecord, options: { branchUnitId?: number | null } = {}): CreatePartyDto {
  return {
    branchUnitId: options.branchUnitId ?? undefined,
    partyCodeNo: record.partyCodeNo.trim(),
    classification: mapClassificationToApi(record.classification),
    partyEntityType: mapPartyEntityTypeToApi(record.partyEntityType),
    partyTypes: record.partyTypes.map(mapPartyTypeToApi),
    status: mapStatusToApi(record.status),
    partyName: record.classification === "Non-Individual" ? normalizeOptionalText(record.partyName) : null,
    tradeName: record.classification === "Non-Individual" ? normalizeOptionalText(record.tradeName) : null,
    firstName: record.classification === IndividualClassification ? normalizeOptionalText(record.firstName) : null,
    middleName: record.classification === IndividualClassification ? normalizeOptionalText(record.middleName) : null,
    lastName: record.classification === IndividualClassification ? normalizeOptionalText(record.lastName) : null,
    suffixName: record.classification === IndividualClassification ? normalizeOptionalText(record.suffixName) : null,
    honorific:
      record.classification === IndividualClassification ? normalizeOptionalText(normalizePartyHonorific(record.honorific ?? "")) : null,
    gender: hasPersonalInformationPartyType(record.partyTypes) ? normalizeOptionalText(record.gender) : null,
    civilStatus: hasPersonalInformationPartyType(record.partyTypes) ? normalizeOptionalText(record.civilStatus) : null,
    nationality: hasPersonalInformationPartyType(record.partyTypes) ? normalizeOptionalText(record.nationality) : null,
    memberRegistrationDate: record.partyTypes.includes("Member") ? normalizeOptionalText(record.memberRegistrationDate) : null,
    addresses: (record.addresses.length > 0 ? record.addresses : [record.address]).map(toApiPartyAddressPayload),
    defaultReceivableAccount: record.partyTypes.includes(CustomerPartyType) ? normalizeOptionalText(record.defaultReceivableAccount) : null,
    customerAdvanceAccount: record.partyTypes.includes(CustomerPartyType) ? normalizeOptionalText(record.customerAdvanceAccount) : null,
    defaultPayableAccount: record.partyTypes.includes(VendorPartyType) ? normalizeOptionalText(record.defaultPayableAccount) : null,
    vendorAdvanceAccount: record.partyTypes.includes(VendorPartyType) ? normalizeOptionalText(record.vendorAdvanceAccount) : null,
    employeeAdvanceAccount: record.partyTypes.includes(EmployeePartyType) ? normalizeOptionalText(record.employeeAdvanceAccount) : null,
    employeePayableAccount: record.partyTypes.includes(EmployeePartyType) ? normalizeOptionalText(record.employeePayableAccount) : null,
    cashAdvanceLimit:
      record.partyTypes.includes(EmployeePartyType) && record.cashAdvanceLimit ? parseMoneyNumberInput(record.cashAdvanceLimit) : null,
    termId: normalizeOptionalText(record.termId),
    tin: normalizeOptionalText(record.tin),
    atcCode: normalizeOptionalText(record.atcCode),
    defaultPurchaseInputVatTaxSourceKey: record.partyTypes.includes(VendorPartyType)
      ? normalizeOptionalText(record.defaultPurchaseInputVatTaxSourceKey)
      : null,
    defaultPurchaseEwtTaxSourceKey: record.partyTypes.includes(VendorPartyType)
      ? normalizeOptionalText(record.defaultPurchaseEwtTaxSourceKey)
      : null,
    defaultPurchaseFwtTaxSourceKey: record.partyTypes.includes(VendorPartyType)
      ? normalizeOptionalText(record.defaultPurchaseFwtTaxSourceKey)
      : null,
    defaultPurchaseWvatTaxSourceKey: record.partyTypes.includes(VendorPartyType)
      ? normalizeOptionalText(record.defaultPurchaseWvatTaxSourceKey)
      : null,
    defaultSalesOutputVatTaxSourceKey: record.partyTypes.includes(CustomerPartyType)
      ? normalizeOptionalText(record.defaultSalesOutputVatTaxSourceKey)
      : null,
    defaultSalesCwtTaxSourceKey: record.partyTypes.includes(CustomerPartyType)
      ? normalizeOptionalText(record.defaultSalesCwtTaxSourceKey)
      : null,
    defaultSalesWvatTaxSourceKey: record.partyTypes.includes(CustomerPartyType)
      ? normalizeOptionalText(record.defaultSalesWvatTaxSourceKey)
      : null,
    contactPerson: normalizeOptionalText(record.contactPerson),
    email: normalizeOptionalText(record.email),
    contactNo: normalizeOptionalText(record.contactNo),
    landline: normalizeOptionalText(record.landline),
  };
}

function toApiPartyAddressPayload(address: PartyAddress): CreatePartyAddressDto {
  return {
    addressName: address.addressName.trim() || "Address",
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim(),
    barangay: normalizeOptionalText(address.barangay),
    barangayCode: normalizeOptionalText(address.barangayCode),
    cityMunicipality: normalizeOptionalText(address.cityMunicipality),
    cityMunicipalityCode: normalizeOptionalText(address.cityMunicipalityCode),
    isBilling: address.isBilling,
    isBuilding: Boolean(address.isBuilding),
    isDefault: address.isDefault,
    isDelivery: address.isDelivery,
    isForeign: Boolean(address.isForeign),
    isHome: Boolean(address.isHome),
    province: normalizeOptionalText(address.province),
    provinceCode: normalizeOptionalText(address.provinceCode),
    region: normalizeOptionalText(address.region),
    regionCode: normalizeOptionalText(address.regionCode),
  };
}

function sortPartyManagementRecords(records: PartyInformationRecord[], query: PartyManagementListQuery) {
  const sort = query.sort;

  if (!sort || sort.id === "actions") {
    return records;
  }

  return [...records].sort((leftRecord, rightRecord) => {
    const leftValue = getSortablePartyManagementValue(leftRecord, sort.id);
    const rightValue = getSortablePartyManagementValue(rightRecord, sort.id);
    const comparison = leftValue.localeCompare(rightValue, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return sort.desc ? -comparison : comparison;
  });
}

function getSortablePartyManagementValue(record: PartyInformationRecord, sortId: NonNullable<PartyManagementListQuery["sort"]>["id"]) {
  switch (sortId) {
    case "billingAddressLabel":
      return formatPartyAddress(getPartyAddressByRole(record, BillingAddressRole));
    case "classification":
      return record.classification;
    case "contactPerson":
      return record.contactPerson;
    case "contactNo":
      return record.contactNo;
    case "createdAt":
      return record.createdAt;
    case "createdBy":
      return record.createdBy ?? "";
    case "email":
      return record.email;
    case "homeAddressLabel":
      return formatPartyAddress(getPartyAddressByRole(record, HomeAddressRole));
    case "name":
      return getPartyDisplayName(record);
    case "partyTypesLabel":
      return record.partyTypes.join(", ");
    case "partyEntityType":
      return record.partyEntityType;
    case "partyCodeNo":
      return record.partyCodeNo;
    case "deliveryAddressLabel":
      return formatPartyAddress(getPartyAddressByRole(record, DeliveryAddressRole));
    case "status":
      return record.status;
    case "tin":
      return record.tin;
    case "updatedAt":
      return record.updatedAt;
    case "updatedBy":
      return record.updatedBy ?? "";
    default:
      return "";
  }
}

function formatPartyAddress(address?: PartyInformationRecord["address"] | null) {
  if (!address) {
    return "";
  }

  return (
    [address.addressLine1, address.addressLine2, address.barangay, address.cityMunicipality, address.province, address.region]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ") || ""
  );
}

function getPartyAddressByRole(record: PartyInformationRecord, role: "billing" | "delivery" | "home") {
  const addresses = record.addresses.length > 0 ? record.addresses : [record.address];

  return addresses.find((address) => {
    if (role === BillingAddressRole) return address.isBilling;
    if (role === HomeAddressRole) return address.isHome;
    return address.isDelivery;
  });
}

function mapClassificationFromApi(value: PartyResponseDtoClassification): PartyClassification {
  return value === "INDIVIDUAL" ? IndividualClassification : "Non-Individual";
}

function mapClassificationToApi(value: PartyClassification): CreatePartyDtoClassification {
  return value === IndividualClassification ? "INDIVIDUAL" : "NON_INDIVIDUAL";
}

function mapPartyEntityTypeFromApi(value?: string | null): string {
  return value?.trim() ?? "";
}

function mapPartyEntityTypeToApi(value: string): string | null {
  return normalizeOptionalText(value);
}

function mapPartyTypeFromApi(value: PartyResponseDtoPartyTypesItem): PartyType {
  if (value === "CUSTOMER") return "Customer";
  if (value === EmployeeApiPartyType) return EmployeePartyType;
  if (value === "MEMBER") return "Member";
  return VendorPartyType;
}

function mapPartyTypeToApi(value: PartyType): CreatePartyDtoPartyTypesItem {
  if (value === CustomerPartyType) return "CUSTOMER";
  if (value === EmployeePartyType) return EmployeeApiPartyType;
  if (value === "Member") return "MEMBER";
  return "VENDOR";
}

function mapStatusFromApi(value: PartyResponseDtoStatus): PartyInformationStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: PartyInformationStatus): CreatePartyDtoStatus {
  return value === "Active" ? "ACTIVE" : "INACTIVE";
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function normalizePartyHonorific(value: string) {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function hasPersonalInformationPartyType(partyTypes: PartyType[]) {
  return partyTypes.includes(EmployeePartyType) || partyTypes.includes("Member");
}

function createEmptyApiMappedAddress(): PartyAddress {
  return {
    id: "address-default",
    addressName: "Default Address",
    addressLine1: "",
    addressLine2: "",
    barangay: "",
    barangayCode: "",
    cityMunicipality: "",
    cityMunicipalityCode: "",
    isBilling: false,
    isBuilding: false,
    isDefault: true,
    isDelivery: false,
    isForeign: false,
    isHome: false,
    province: "",
    provinceCode: "",
    region: "",
    regionCode: "",
  };
}
