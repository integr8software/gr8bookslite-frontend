import { cashAdvanceControllerSuggestTransactionNumberV1 } from "@/app/src/generated/api/cash-advance/cash-advance";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
import type {
  CashAdvanceAccountDropdownOption,
  CashAdvancePartyDropdownOption,
  CashAdvanceRecord,
  CashAdvanceResponsibilityCenterDropdownOption,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

type ApiCashAdvanceStatus = "DRAFT" | "FOR_APPROVAL" | "APPROVED" | "POSTED" | "DISAPPROVED" | "CANCELLED";

export type FetchCashAdvanceListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  partyCode?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type FetchCashAdvanceListResponse = {
  data: CashAdvanceRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function fetchCashAdvanceList(params?: FetchCashAdvanceListParams): Promise<FetchCashAdvanceListResponse> {
  const response = await ApiClient.get<FetchCashAdvanceListResponse>("/cash-disbursement/cash-advance", {
    params: {
      ...params,
      status: params?.status && params.status !== "all" ? mapCashAdvanceStatusToApi(params.status) : params?.status,
    },
  });

  return {
    ...response.data,
    data: response.data.data.map(mapCashAdvanceRecordFromApi),
  };
}

export async function fetchCashAdvancePartyOptions(): Promise<CashAdvancePartyDropdownOption[]> {
  const options = await fetchMaintenancePartyOptions();

  return options.map((party) => ({
    name: party.partyName,
    label: party.partyCode,
    value: party.partyId,
    partyId: party.partyId,
    partyCode: party.partyCode,
    partyName: party.partyName,
    cashAdvanceLimit: String(party.cashAdvanceLimit ?? ""),
    totalCashAdvance: String(party.totalCashAdvance ?? "0.00"),
    availableCashAdvance: String(party.availableCashAdvance ?? ""),
  }));
}

export async function fetchCashAdvanceAccountOptions(): Promise<CashAdvanceAccountDropdownOption[]> {
  const accounts = await fetchMaintenancePostingAccountOptions();

  // Filter accounts under Accounts Receivables (1010103000) or code starting with 1010103
  const arAccounts = accounts.filter(
    (account) =>
      account.accountCode.startsWith("1010103") ||
      account.accountCode === "1010103000" ||
      account.accountTitle.toLowerCase().includes("receivable") ||
      account.accountTitle.toLowerCase().includes("advance"),
  );

  const finalAccounts = arAccounts.length > 0 ? arAccounts : accounts;

  return finalAccounts.map((account) => ({
    name: account.accountTitle,
    label: account.accountCode,
    value: account.accountId,
    accountId: account.accountId,
    accountCode: account.accountCode,
    accountTitle: account.accountTitle,
  }));
}

export async function fetchCashAdvanceResponsibilityCenters(): Promise<{
  costCenters: CashAdvanceResponsibilityCenterDropdownOption[];
  projects: CashAdvanceResponsibilityCenterDropdownOption[];
}> {
  const centers = await fetchMaintenanceResponsibilityCenterOptions();

  const isProject = (center: { category?: string; typeName?: string; name?: string }) =>
    center.category?.toLowerCase() === "project" ||
    center.typeName?.toLowerCase().includes("project") ||
    center.name?.toLowerCase().includes("project");

  const costCenters: CashAdvanceResponsibilityCenterDropdownOption[] = centers
    .filter((center) => !isProject(center))
    .map((center) => ({
      name: center.name,
      label: center.code,
      value: center.centerId,
      id: center.centerId,
      code: center.code,
      typeName: center.typeName,
    }));

  const projects: CashAdvanceResponsibilityCenterDropdownOption[] = centers
    .filter((center) => isProject(center))
    .map((center) => ({
      name: center.name,
      label: center.code,
      value: center.centerId,
      id: center.centerId,
      code: center.code,
      typeName: center.typeName,
    }));

  return { costCenters, projects };
}

export async function fetchNextCashAdvanceTransactionNo(): Promise<string> {
  return fetchTransactionNumber(cashAdvanceControllerSuggestTransactionNumberV1);
}

export async function fetchCashAdvanceById(id: string): Promise<CashAdvanceRecord> {
  const response = await ApiClient.get<{ data: CashAdvanceRecord }>(`/cash-disbursement/cash-advance/${id}`);
  return mapCashAdvanceRecordFromApi(response.data.data);
}

export async function createCashAdvanceApi(payload: {
  partyId?: string;
  partyCode: string;
  partyName: string;
  creditAccountId?: string;
  accountCode: string;
  accountTitle?: string;
  costCenterId?: string;
  costCenter?: string;
  costCenterCode?: string;
  projectId?: string;
  projectName?: string;
  projectRef?: string;
  projectCode?: string;
  currency: string;
  fxRate: string;
  amount: string;
  documentDate: string;
  transNo?: string;
  remarks?: string;
}): Promise<CashAdvanceRecord> {
  const response = await ApiClient.post<{ data: CashAdvanceRecord }>("/cash-disbursement/cash-advance", payload);
  return mapCashAdvanceRecordFromApi(response.data.data);
}

export async function updateCashAdvanceApi(
  id: string,
  payload: Partial<{
    partyId?: string;
    partyCode: string;
    partyName: string;
    creditAccountId?: string;
    accountCode: string;
    accountTitle: string;
    costCenterId?: string;
    costCenter: string;
    costCenterCode: string;
    projectId?: string;
    projectName: string;
    projectRef: string;
    projectCode: string;
    currency: string;
    fxRate: string;
    amount: string;
    documentDate: string;
    remarks: string;
  }>,
): Promise<CashAdvanceRecord> {
  const response = await ApiClient.put<{ data: CashAdvanceRecord }>(`/cash-disbursement/cash-advance/${id}`, payload);
  return mapCashAdvanceRecordFromApi(response.data.data);
}

export async function deleteCashAdvanceApi(id: string): Promise<void> {
  await ApiClient.delete(`/cash-disbursement/cash-advance/${id}`);
}

export async function submitCashAdvanceApprovalApi(id: string): Promise<CashAdvanceRecord> {
  const response = await ApiClient.post<{ data: CashAdvanceRecord }>(`/cash-disbursement/cash-advance/${id}/submit-approval`);
  return mapCashAdvanceRecordFromApi(response.data.data);
}

export async function updateCashAdvanceStatusApi(id: string, status: CashAdvanceStatus): Promise<CashAdvanceRecord> {
  const response = await ApiClient.patch<{ data: CashAdvanceRecord }>(`/cash-disbursement/cash-advance/${id}/status`, {
    status: mapCashAdvanceStatusToApi(status),
  });
  return mapCashAdvanceRecordFromApi(response.data.data);
}

function mapCashAdvanceRecordFromApi(record: CashAdvanceRecord): CashAdvanceRecord {
  return {
    ...record,
    currency: record.currency ?? record.formValues?.currency ?? "PHP",
    fxRate: record.fxRate ?? record.formValues?.fxRate ?? "1.00",
    projectName: record.projectName ?? record.projectRef ?? "",
    formValues: record.formValues
      ? {
          ...record.formValues,
          referenceFields: {
            ...record.formValues.referenceFields,
            projectName: record.formValues.referenceFields.projectName ?? record.formValues.referenceFields.projectRef ?? "",
            projectRef: record.formValues.referenceFields.projectName ?? record.formValues.referenceFields.projectRef ?? "",
          },
          status: mapCashAdvanceStatusFromApi(record.formValues.status),
        }
      : record.formValues,
    status: mapCashAdvanceStatusFromApi(record.status),
  };
}

function mapCashAdvanceStatusFromApi(status: string): CashAdvanceStatus {
  const statusMap: Record<string, CashAdvanceStatus> = {
    APPROVED: "Posted",
    CANCELLED: "Cancelled",
    DISAPPROVED: "Disapproved",
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
  };

  return statusMap[status] ?? (status as CashAdvanceStatus);
}

function mapCashAdvanceStatusToApi(status: string): ApiCashAdvanceStatus {
  const statusMap: Record<string, ApiCashAdvanceStatus> = {
    Cancelled: "CANCELLED",
    Disapproved: "DISAPPROVED",
    Draft: "DRAFT",
    "For Approval": "FOR_APPROVAL",
    Open: "DRAFT",
    Posted: "POSTED",
  };

  return statusMap[status] ?? (status as ApiCashAdvanceStatus);
}
