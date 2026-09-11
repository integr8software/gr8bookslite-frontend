import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { PartyLookupOption, PartyLookupQuery } from "@/app/src/types/modules/party-management/PartyLookupTypes";

type PartyLookupBackendItem = {
  id: string;
  code?: string;
  partyCode?: string;
  partyCodeNo: string;
  name: string;
  partyName?: string;
  tradeName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffixName?: string;
  classification?: string;
  partyTypes?: string[];
  contactPerson?: string;
  contactNo?: string;
  email?: string;
  tin?: string;
  cashAdvanceLimit?: string;
  cashAdvanceBalance?: string;
  defaultPurchaseInputVatTaxSourceKey?: string;
  defaultPurchaseEwtTaxSourceKey?: string;
  defaultPurchaseFwtTaxSourceKey?: string;
  defaultPurchaseWvatTaxSourceKey?: string;
  defaultSalesOutputVatTaxSourceKey?: string;
  defaultSalesCwtTaxSourceKey?: string;
  defaultSalesWvatTaxSourceKey?: string;
  defaultReceivableAccount?: string;
  customerAdvanceAccount?: string;
  defaultPayableAccount?: string;
  vendorAdvanceAccount?: string;
  employeeAdvanceAccount?: string;
  employeePayableAccount?: string;
  defaultResponsibilityCenterId?: string;
  defaultResponsibilityCenterName?: string;
  defaultPaymentTypeId?: string;
  defaultPaymentTypeName?: string;
  defaultBank?: string;
  defaultBankAccountNo?: string;
  accountingAccounts?: {
    employeeAdvanceAccount?: {
      id?: string;
      accountCode?: string;
      accountTitle?: string;
    } | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const CompletePartyLookupDetail = "complete";

export async function fetchPartyLookupOptions(query: PartyLookupQuery = { detail: CompletePartyLookupDetail }): Promise<PartyLookupOption[]> {
  const response = await ApiClient.get<{ parties: PartyLookupBackendItem[] }>("/maintenance/party-maintenance/options", {
    params: {
      detail: query.detail ?? CompletePartyLookupDetail,
      ...(query.partyType ? { partyType: query.partyType } : {}),
      ...(query.partyTypes ? { partyTypes: query.partyTypes } : {}),
      ...(query.search ? { search: query.search } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  });

  return (response.data.parties ?? []).map(mapPartyToLookupOption);
}

export async function fetchVendorLookupOptions(query: Omit<PartyLookupQuery, "partyType"> = {}): Promise<PartyLookupOption[]> {
  return fetchPartyLookupOptions({ ...query, partyType: "VENDOR", detail: CompletePartyLookupDetail });
}

export async function fetchCustomerLookupOptions(query: Omit<PartyLookupQuery, "partyType"> = {}): Promise<PartyLookupOption[]> {
  return fetchPartyLookupOptions({ ...query, partyType: "CUSTOMER", detail: CompletePartyLookupDetail });
}

export async function fetchEmployeeLookupOptions(query: Omit<PartyLookupQuery, "partyType"> = {}): Promise<PartyLookupOption[]> {
  return fetchPartyLookupOptions({ ...query, partyType: "EMPLOYEE", detail: CompletePartyLookupDetail });
}

function formatPartyTypes(partyTypes?: string[] | string, classification?: string): string {
  if (Array.isArray(partyTypes) && partyTypes.length > 0) {
    return partyTypes.join(", ");
  }
  if (typeof partyTypes === "string" && partyTypes.trim()) {
    return partyTypes.trim();
  }
  return classification?.trim() || "";
}

function getPartyLookupCode(party: PartyLookupBackendItem): string {
  return (party.partyCodeNo || party.partyCode || party.code || "").trim();
}

function getPartyLookupDisplayName(party: PartyLookupBackendItem, partyCode: string): string {
  const individualName = [party.firstName, party.middleName, party.lastName, party.suffixName]
    .map((name) => name?.trim())
    .filter(Boolean)
    .join(" ");

  return (party.partyName?.trim() || individualName || party.name?.trim() || partyCode).trim();
}

function mapPartyToLookupOption(party: PartyLookupBackendItem): PartyLookupOption {
  const partyCode = getPartyLookupCode(party);
  const displayName = getPartyLookupDisplayName(party, partyCode);
  const partyTypes = formatPartyTypes(party.partyTypes, party.classification);

  return {
    ...party,
    name: displayName,
    label: partyCode,
    value: partyCode,
    description: partyTypes,
    partyId: party.id,
    partyCode,
    partyName: displayName,
    selectedDetails: partyCode,
  };
}
