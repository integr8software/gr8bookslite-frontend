import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type MaintenancePartyOption = AppAdvancedDropdownOption & {
  partyId: string;
  partyCode: string;
  partyName: string;
  defaultPurchaseInputVatTaxSourceKey?: string;
  defaultPurchaseEwtTaxSourceKey?: string;
  [key: string]: unknown;
};

export type MaintenancePostingAccountOption = AppAdvancedDropdownOption & {
  accountId: string;
  accountCode: string;
  accountTitle: string;
  [key: string]: unknown;
};

export type MaintenanceResponsibilityCenterOption = AppAdvancedDropdownOption & {
  centerId: string;
  code: string;
  typeName?: string;
  [key: string]: unknown;
};

type MaintenancePartyResponse = {
  id: string;
  partyCodeNo: string;
  name: string;
  defaultPurchaseInputVatTaxSourceKey?: string;
  defaultPurchaseEwtTaxSourceKey?: string;
  [key: string]: unknown;
};

type MaintenanceAccountResponse = {
  id: string;
  accountCode: string;
  accountTitle: string;
  [key: string]: unknown;
};

type MaintenanceResponsibilityCenterResponse = {
  id: string;
  code: string;
  name: string;
  typeName?: string;
  [key: string]: unknown;
};

export async function fetchMaintenancePartyOptions(): Promise<MaintenancePartyOption[]> {
  const response = await ApiClient.get<{ parties: MaintenancePartyResponse[] }>("/maintenance/party-maintenance/options", {
    params: { detail: "complete" },
  });

  return (response.data.parties ?? []).map((party) => ({
    ...party,
    name: party.name,
    label: party.partyCodeNo,
    value: party.partyCodeNo,
    description: party.name,
    partyId: party.id,
    partyCode: party.partyCodeNo,
    partyName: party.name,
  }));
}

export async function fetchMaintenancePostingAccountOptions(): Promise<MaintenancePostingAccountOption[]> {
  const response = await ApiClient.get<{ accounts: MaintenanceAccountResponse[] }>("/maintenance/chart-of-accounts/options/posting-accounts");

  return (response.data.accounts ?? []).map((account) => ({
    ...account,
    name: account.accountTitle,
    label: account.accountCode,
    value: account.accountCode,
    description: account.accountTitle,
    accountId: account.id,
  }));
}

export async function fetchMaintenanceResponsibilityCenterOptions(): Promise<MaintenanceResponsibilityCenterOption[]> {
  const response = await ApiClient.get<{ responsibilityCenters: MaintenanceResponsibilityCenterResponse[] }>(
    "/maintenance/financial-management/responsibility-centers/options",
  );

  return (response.data.responsibilityCenters ?? []).map((center) => ({
    ...center,
    label: center.code,
    value: center.code,
    description: center.name,
    centerId: center.id,
  }));
}
