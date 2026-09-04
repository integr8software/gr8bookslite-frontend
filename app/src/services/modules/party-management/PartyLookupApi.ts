import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { PartyLookupOption, PartyLookupQuery } from "@/app/src/types/modules/party-management/PartyLookupTypes";

type PartyLookupBackendItem = {
  id: string;
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

export async function fetchPartyLookupOptions(query: PartyLookupQuery = { detail: "complete" }): Promise<PartyLookupOption[]> {
  const response = await ApiClient.get<{ parties: PartyLookupBackendItem[] }>("/maintenance/party-maintenance/options", {
    params: {
      detail: query.detail ?? "complete",
      ...(query.partyType ? { partyType: query.partyType } : {}),
      ...(query.partyTypes ? { partyTypes: query.partyTypes } : {}),
      ...(query.search ? { search: query.search } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  });

  return (response.data.parties ?? []).map(mapPartyToLookupOption);
}

export async function fetchVendorLookupOptions(query: Omit<PartyLookupQuery, "partyType"> = {}): Promise<PartyLookupOption[]> {
  return fetchPartyLookupOptions({ ...query, partyType: "VENDOR", detail: "complete" });
}

export async function fetchCustomerLookupOptions(query: Omit<PartyLookupQuery, "partyType"> = {}): Promise<PartyLookupOption[]> {
  return fetchPartyLookupOptions({ ...query, partyType: "CUSTOMER", detail: "complete" });
}

export async function fetchEmployeeLookupOptions(query: Omit<PartyLookupQuery, "partyType"> = {}): Promise<PartyLookupOption[]> {
  return fetchPartyLookupOptions({ ...query, partyType: "EMPLOYEE", detail: "complete" });
}

function mapPartyToLookupOption(party: PartyLookupBackendItem): PartyLookupOption {
  const displayName = party.name || party.partyName || party.partyCodeNo;

  return {
    ...party,
    name: displayName,
    label: party.partyCodeNo,
    value: party.partyCodeNo,
    description: displayName,
    partyId: party.id,
    partyCode: party.partyCodeNo,
    partyName: displayName,
  };
}
