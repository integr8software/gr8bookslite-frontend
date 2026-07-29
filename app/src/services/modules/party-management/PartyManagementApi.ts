import { PartyManagementApiPath } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  ApiParty,
  ApiPartyAddress,
  ApiPartyAccountingOptionsResponse,
  ApiPartyClassification,
  ApiPartyImportResponse,
  ApiPartyListResponse,
  ApiPartyOptionsResponse,
  ApiPartyPayload,
  ApiPartySaveResponse,
  ApiPartyStatus,
  ApiPartyType,
  PartyAddress,
  PartyClassification,
  PartyInformationRecord,
  PartyInformationStatus,
  PartyManagementListQuery,
  PartyManagementListResponse,
  PartyManagementPermissions,
  PartyManagementStatistics,
  PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { ItemSupplierRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

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

export async function fetchPartyManagementRecords(): Promise<{
  permissions: PartyManagementPermissions;
  records: PartyInformationRecord[];
  statistics: PartyManagementStatistics;
  totalRows: number;
}> {
  const response = await ApiClient.get<ApiPartyListResponse>(PartyManagementApiPath, {
    params: {
      page: 1,
      pageSize: 500,
      sortBy: "name",
      sortDirection: "asc",
    },
  });

  return {
    permissions: response.data.permissions ?? EmptyPartyPermissions,
    records: response.data.parties.map(mapApiParty),
    statistics: response.data.statistics ?? EmptyPartyStatistics,
    totalRows: response.data.totalRows,
  };
}

export async function createPartyManagementRecord(
  record: PartyInformationRecord,
  options: { branchUnitId?: number | null } = {},
): Promise<PartyInformationRecord> {
  const response = await ApiClient.post<ApiPartySaveResponse>(
    PartyManagementApiPath,
    toApiPartyPayload(record, options),
  );

  return mapApiParty(response.data.party);
}

export async function updatePartyManagementRecord(
  record: PartyInformationRecord,
): Promise<PartyInformationRecord> {
  const response = await ApiClient.patch<ApiPartySaveResponse>(
    `${PartyManagementApiPath}/${record.id}`,
    toApiPartyPayload(record),
  );

  return mapApiParty(response.data.party);
}

export async function importPartyManagementRecords(
  records: PartyInformationRecord[],
  options: { branchUnitId?: number | null } = {},
): Promise<PartyInformationRecord[]> {
  const response = await ApiClient.post<ApiPartyImportResponse>(
    `${PartyManagementApiPath}/import`,
    {
      branchUnitId: options.branchUnitId ?? undefined,
      parties: records.map((record) => toApiPartyPayload(record, options)),
    },
  );

  return response.data.parties.map(mapApiParty);
}

export async function fetchPartyManagementAccountingOptions() {
  const response = await ApiClient.get<ApiPartyAccountingOptionsResponse>(
    `${PartyManagementApiPath}/accounting-options`,
  );

  return response.data;
}

export async function fetchPartyOptions(partyType: PartyType): Promise<ItemSupplierRecord[]> {
  const response = await ApiClient.get<ApiPartyOptionsResponse>(
    `${PartyManagementApiPath}/options/${mapPartyTypeToApi(partyType)}`,
  );

  return response.data.parties.map((party) => ({
    id: party.id,
    code: party.partyCodeNo,
    name: party.name,
    contactPerson: party.name,
    contactDetails: party.email || party.contactNo,
    status: mapStatusFromApi(party.status),
  }));
}

export async function GetPartyManagementRecordsPage({
  query,
  records,
}: {
  query: PartyManagementListQuery;
  records: PartyInformationRecord[];
}): Promise<PartyManagementListResponse> {
  const normalizedQuery = query.query.trim().toLowerCase();
  const filteredRecords = records.filter((record) => {
    const name = getPartyDisplayName(record).toLowerCase();
    const address = formatPartyAddress(record.address).toLowerCase();
    const billingAddress = formatPartyAddress(
      getPartyAddressByRole(record, "billing"),
    ).toLowerCase();
    const homeAddress = formatPartyAddress(getPartyAddressByRole(record, "home")).toLowerCase();
    const deliveryAddress = formatPartyAddress(
      getPartyAddressByRole(record, "delivery"),
    ).toLowerCase();

    return (
      (query.classification === "All" || record.classification === query.classification) &&
      (query.partyType === "All" || record.partyTypes.includes(query.partyType)) &&
      (query.status === "All" || record.status === query.status) &&
      (!normalizedQuery ||
        name.includes(normalizedQuery) ||
        record.partyCodeNo.toLowerCase().includes(normalizedQuery) ||
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

function mapApiParty(party: ApiParty): PartyInformationRecord {
  const addresses = (
    party.addresses.length > 0 ? party.addresses : party.address ? [party.address] : []
  ).map(mapApiPartyAddress);
  const address =
    addresses.find((current) => current.isDefault) ?? addresses[0] ?? createEmptyApiMappedAddress();

  return {
    id: party.id,
    partyCodeNo: party.partyCodeNo,
    classification: mapClassificationFromApi(party.classification),
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
    email: party.email ?? "",
    contactNo: party.contactNo ?? "",
    landline: party.landline ?? "",
    createdBy: party.createdBy ?? "",
    createdAt: party.createdAt,
    updatedBy: party.updatedBy ?? "",
    updatedAt: party.updatedAt,
  };
}

function mapApiPartyAddress(address: ApiPartyAddress): PartyAddress {
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

function toApiPartyPayload(
  record: PartyInformationRecord,
  options: { branchUnitId?: number | null } = {},
): ApiPartyPayload {
  return {
    branchUnitId: options.branchUnitId ?? undefined,
    partyCodeNo: record.partyCodeNo.trim(),
    classification: mapClassificationToApi(record.classification),
    partyTypes: record.partyTypes.map(mapPartyTypeToApi),
    status: mapStatusToApi(record.status),
    partyName:
      record.classification === "Non-Individual" ? normalizeOptionalText(record.partyName) : null,
    tradeName:
      record.classification === "Non-Individual" ? normalizeOptionalText(record.tradeName) : null,
    firstName:
      record.classification === "Individual" ? normalizeOptionalText(record.firstName) : null,
    middleName:
      record.classification === "Individual" ? normalizeOptionalText(record.middleName) : null,
    lastName:
      record.classification === "Individual" ? normalizeOptionalText(record.lastName) : null,
    suffixName:
      record.classification === "Individual" ? normalizeOptionalText(record.suffixName) : null,
    honorific:
      record.classification === "Individual"
        ? normalizeOptionalText(normalizePartyHonorific(record.honorific ?? ""))
        : null,
    gender: hasPersonalInformationPartyType(record.partyTypes)
      ? normalizeOptionalText(record.gender)
      : null,
    civilStatus: hasPersonalInformationPartyType(record.partyTypes)
      ? normalizeOptionalText(record.civilStatus)
      : null,
    nationality: hasPersonalInformationPartyType(record.partyTypes)
      ? normalizeOptionalText(record.nationality)
      : null,
    memberRegistrationDate: record.partyTypes.includes("Member")
      ? normalizeOptionalText(record.memberRegistrationDate)
      : null,
    addresses: (record.addresses.length > 0 ? record.addresses : [record.address]).map(
      toApiPartyAddressPayload,
    ),
    defaultReceivableAccount: record.partyTypes.includes("Customer")
      ? normalizeOptionalText(record.defaultReceivableAccount)
      : null,
    customerAdvanceAccount: record.partyTypes.includes("Customer")
      ? normalizeOptionalText(record.customerAdvanceAccount)
      : null,
    defaultPayableAccount: record.partyTypes.includes("Vendor")
      ? normalizeOptionalText(record.defaultPayableAccount)
      : null,
    vendorAdvanceAccount: record.partyTypes.includes("Vendor")
      ? normalizeOptionalText(record.vendorAdvanceAccount)
      : null,
    employeeAdvanceAccount: record.partyTypes.includes("Employee")
      ? normalizeOptionalText(record.employeeAdvanceAccount)
      : null,
    employeePayableAccount: record.partyTypes.includes("Employee")
      ? normalizeOptionalText(record.employeePayableAccount)
      : null,
    termId: normalizeOptionalText(record.termId),
    tin: normalizeOptionalText(record.tin),
    atcCode: normalizeOptionalText(record.atcCode),
    defaultPurchaseInputVatTaxSourceKey: record.partyTypes.includes("Vendor")
      ? normalizeOptionalText(record.defaultPurchaseInputVatTaxSourceKey)
      : null,
    defaultPurchaseEwtTaxSourceKey: record.partyTypes.includes("Vendor")
      ? normalizeOptionalText(record.defaultPurchaseEwtTaxSourceKey)
      : null,
    defaultPurchaseFwtTaxSourceKey: record.partyTypes.includes("Vendor")
      ? normalizeOptionalText(record.defaultPurchaseFwtTaxSourceKey)
      : null,
    defaultPurchaseWvatTaxSourceKey: record.partyTypes.includes("Vendor")
      ? normalizeOptionalText(record.defaultPurchaseWvatTaxSourceKey)
      : null,
    defaultSalesOutputVatTaxSourceKey: record.partyTypes.includes("Customer")
      ? normalizeOptionalText(record.defaultSalesOutputVatTaxSourceKey)
      : null,
    defaultSalesCwtTaxSourceKey: record.partyTypes.includes("Customer")
      ? normalizeOptionalText(record.defaultSalesCwtTaxSourceKey)
      : null,
    defaultSalesWvatTaxSourceKey: record.partyTypes.includes("Customer")
      ? normalizeOptionalText(record.defaultSalesWvatTaxSourceKey)
      : null,
    email: normalizeOptionalText(record.email),
    contactNo: normalizeOptionalText(record.contactNo),
    landline: normalizeOptionalText(record.landline),
  };
}

function toApiPartyAddressPayload(address: PartyAddress): ApiPartyAddress {
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

function sortPartyManagementRecords(
  records: PartyInformationRecord[],
  query: PartyManagementListQuery,
) {
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

function getSortablePartyManagementValue(
  record: PartyInformationRecord,
  sortId: NonNullable<PartyManagementListQuery["sort"]>["id"],
) {
  switch (sortId) {
    case "billingAddressLabel":
      return formatPartyAddress(getPartyAddressByRole(record, "billing"));
    case "classification":
      return record.classification;
    case "contactNo":
      return record.contactNo;
    case "createdAt":
      return record.createdAt;
    case "createdBy":
      return record.createdBy ?? "";
    case "email":
      return record.email;
    case "homeAddressLabel":
      return formatPartyAddress(getPartyAddressByRole(record, "home"));
    case "name":
      return getPartyDisplayName(record);
    case "partyTypesLabel":
      return record.partyTypes.join(", ");
    case "partyCodeNo":
      return record.partyCodeNo;
    case "deliveryAddressLabel":
      return formatPartyAddress(getPartyAddressByRole(record, "delivery"));
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
    return "-";
  }

  return (
    [
      address.addressLine1,
      address.addressLine2,
      address.barangay,
      address.cityMunicipality,
      address.province,
      address.region,
    ]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ") || "-"
  );
}

function getPartyAddressByRole(
  record: PartyInformationRecord,
  role: "billing" | "delivery" | "home",
) {
  const addresses = record.addresses.length > 0 ? record.addresses : [record.address];

  return addresses.find((address) => {
    if (role === "billing") return address.isBilling;
    if (role === "home") return address.isHome;
    return address.isDelivery;
  });
}

function mapClassificationFromApi(value: ApiPartyClassification): PartyClassification {
  return value === "INDIVIDUAL" ? "Individual" : "Non-Individual";
}

function mapClassificationToApi(value: PartyClassification): ApiPartyClassification {
  return value === "Individual" ? "INDIVIDUAL" : "NON_INDIVIDUAL";
}

function mapPartyTypeFromApi(value: ApiPartyType): PartyType {
  if (value === "CUSTOMER") return "Customer";
  if (value === "EMPLOYEE") return "Employee";
  if (value === "MEMBER") return "Member";
  return "Vendor";
}

function mapPartyTypeToApi(value: PartyType): ApiPartyType {
  if (value === "Customer") return "CUSTOMER";
  if (value === "Employee") return "EMPLOYEE";
  if (value === "Member") return "MEMBER";
  return "VENDOR";
}

function mapStatusFromApi(value: ApiPartyStatus): PartyInformationStatus {
  return value === "ACTIVE" ? "Active" : "Inactive";
}

function mapStatusToApi(value: PartyInformationStatus): ApiPartyStatus {
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
  return partyTypes.includes("Employee") || partyTypes.includes("Member");
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
