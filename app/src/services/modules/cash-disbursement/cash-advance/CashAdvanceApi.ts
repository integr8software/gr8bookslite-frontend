import {
  cashAdvanceControllerCreateV1,
  cashAdvanceControllerFindAllV1,
  cashAdvanceControllerFindOneV1,
  cashAdvanceControllerRemoveV1,
  cashAdvanceControllerSubmitApprovalV1,
  cashAdvanceControllerSuggestTransactionNumberV1,
  cashAdvanceControllerUpdateStatusV1,
  cashAdvanceControllerUpdateV1,
} from "@/app/src/generated/api/cash-advance/cash-advance";
import type {
  CashAdvanceControllerFindAllV1Params,
  CashAdvanceDto,
  CashAdvanceListResponseDto,
  CashAdvanceSingleResponseDto,
  CreateCashAdvanceDto,
  UpdateCashAdvanceDto,
  UpdateCashAdvanceStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
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

type ApiCashAdvanceStatus = UpdateCashAdvanceStatusDtoStatus | string;
type FetchCashAdvanceListParams = CashAdvanceControllerFindAllV1Params;
type FetchCashAdvanceListResponse = Omit<CashAdvanceListResponseDto, "data"> & { data: CashAdvanceRecord[] };

export async function fetchCashAdvanceList(params?: FetchCashAdvanceListParams): Promise<FetchCashAdvanceListResponse> {
  const response = await cashAdvanceControllerFindAllV1({
    ...params,
    status:
      params?.status && params.status !== "all" && params.status !== "All"
        ? mapCashAdvanceStatusToApi(params.status)
        : undefined,
  });

  return {
    ...response,
    data: response.data.map(mapCashAdvanceRecordFromApi),
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
  const response = await cashAdvanceControllerFindOneV1(id);
  return mapCashAdvanceResponseFromApi(response);
}

export async function createCashAdvanceApi(payload: CreateCashAdvanceDto): Promise<CashAdvanceRecord> {
  const response = await cashAdvanceControllerCreateV1(payload);
  return mapCashAdvanceResponseFromApi(response);
}

export async function updateCashAdvanceApi(
  id: string,
  payload: UpdateCashAdvanceDto,
): Promise<CashAdvanceRecord> {
  const response = await cashAdvanceControllerUpdateV1(id, payload);
  return mapCashAdvanceResponseFromApi(response);
}

export async function deleteCashAdvanceApi(id: string): Promise<void> {
  await cashAdvanceControllerRemoveV1(id);
}

export async function submitCashAdvanceApprovalApi(id: string): Promise<CashAdvanceRecord> {
  const response = await cashAdvanceControllerSubmitApprovalV1(id);
  return mapCashAdvanceResponseFromApi(response);
}

export async function updateCashAdvanceStatusApi(id: string, status: CashAdvanceStatus): Promise<CashAdvanceRecord> {
  const response = await cashAdvanceControllerUpdateStatusV1(id, {
    status: mapCashAdvanceStatusToApi(status) as UpdateCashAdvanceStatusDtoStatus,
  });
  return mapCashAdvanceResponseFromApi(response);
}

function mapCashAdvanceResponseFromApi(response: CashAdvanceSingleResponseDto): CashAdvanceRecord {
  return mapCashAdvanceRecordFromApi(response.data);
}

function mapCashAdvanceRecordFromApi(record: CashAdvanceDto & { formValues?: CashAdvanceRecord["formValues"] }): CashAdvanceRecord {
  const projectName = record.projectName ?? record.projectRef ?? "";
  const projectRef = record.projectName ?? record.projectRef ?? "";

  return {
    ...record,
    accountCode: record.accountCode ?? "",
    accountTitle: record.accountTitle ?? "",
    amount: record.amount ?? 0,
    costCenter: record.costCenter ?? "",
    currency: record.currency ?? record.formValues?.currency ?? "PHP",
    fxRate: record.fxRate ?? record.formValues?.fxRate ?? "1.00",
    partyCode: record.partyCode ?? "",
    partyName: record.partyName ?? "",
    projectName,
    projectRef,
    remarks: record.remarks ?? "",
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
