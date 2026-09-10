import {
  cashAdvanceControllerCreateV1,
  cashAdvanceControllerFindAllV1,
  cashAdvanceControllerFindCopyFromCandidatesV1,
  cashAdvanceControllerFindOneV1,
  cashAdvanceControllerRemoveV1,
  cashAdvanceControllerSubmitApprovalV1,
  cashAdvanceControllerSuggestTransactionNumberV1,
  cashAdvanceControllerUpdateStatusV1,
  cashAdvanceControllerUpdateV1,
} from "@/app/src/generated/api/cash-advance/cash-advance";
import type {
  CashAdvanceControllerFindAllV1Params,
  CashAdvanceControllerFindCopyFromCandidatesV1Params,
  CashAdvanceCopyFromCandidateDto,
  CashAdvanceListResponseDto,
  CashAdvanceSingleResponseDto,
  CreateCashAdvanceDto,
  UpdateCashAdvanceDto,
  UpdateCashAdvanceStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import { fetchPostingAccountLookupOptions } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupApi";
import { fetchResponsibilityCenterLookupOptions } from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterLookupApi";
import { fetchPartyLookupOptions } from "@/app/src/services/modules/party-management/PartyLookupApi";
import { cleanCopyFromQueryParams } from "@/app/src/utils/query.util";
import type {
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

type ApiCashAdvanceStatus = UpdateCashAdvanceStatusDtoStatus | string;
type FetchCashAdvanceListParams = CashAdvanceControllerFindAllV1Params;
type FetchCashAdvanceListResponse = Omit<CashAdvanceListResponseDto, "data"> & { data: CashAdvanceRecord[] };

export type CashAdvanceCopyFromCandidate = CashAdvanceCopyFromCandidateDto;

type CashAdvanceApiOptions = {
  branchUnitId?: number;
};

export async function fetchCashAdvanceList(params?: FetchCashAdvanceListParams): Promise<FetchCashAdvanceListResponse> {
  const response = (await cashAdvanceControllerFindAllV1({
    ...params,
    status: params?.status && params.status !== "all" && params.status !== "All" ? (mapCashAdvanceStatusToApi(params.status) as UpdateCashAdvanceStatusDtoStatus) : undefined,
  })) as unknown as FetchCashAdvanceListResponse;

  return {
    ...response,
    data: (response.data || []).map(mapCashAdvanceRecordFromApi),
  };
}

export async function fetchCashAdvancePartyOptions() {
  const options = await fetchPartyLookupOptions({ detail: "complete" });

  return options.map((party) => {
    const rawAccountingAccounts = party.accountingAccounts as
      | {
          employeeAdvanceAccount?: {
            id?: string;
            accountCode?: string;
            accountTitle?: string;
          } | null;
        }
      | undefined;

    const employeeAdvance = rawAccountingAccounts?.employeeAdvanceAccount;
    const employeeAdvanceAccountId =
      employeeAdvance?.id ?? (party.employeeAdvanceAccount ? String(party.employeeAdvanceAccount) : undefined);
    const employeeAdvanceAccountCode = employeeAdvance?.accountCode ?? undefined;
    const employeeAdvanceAccountTitle = employeeAdvance?.accountTitle ?? undefined;

    return {
      name: party.partyName,
      label: party.partyCode,
      value: party.partyId,
      partyId: party.partyId,
      partyCode: party.partyCode,
      partyName: party.partyName,
      cashAdvanceLimit: String(party.cashAdvanceLimit ?? ""),
      totalCashAdvance: String(party.totalCashAdvance ?? "0.00"),
      availableCashAdvance: String(party.availableCashAdvance ?? ""),
      employeeAdvanceAccountId,
      employeeAdvanceAccountCode,
      employeeAdvanceAccountTitle,
    };
  });
}

export async function fetchCashAdvanceAccountOptions() {
  const accounts = await fetchPostingAccountLookupOptions();

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

export async function fetchCashAdvanceResponsibilityCenters() {
  const centers = await fetchResponsibilityCenterLookupOptions();

  const isProject = (center: { category?: string; typeName?: string; name?: string }) =>
    center.category?.toLowerCase() === "project" ||
    center.typeName?.toLowerCase().includes("project") ||
    center.name?.toLowerCase().includes("project");

  const costCenters = centers
    .filter((center) => !isProject(center))
    .map((center) => ({
      name: center.name,
      label: center.code,
      value: center.centerId,
      id: center.centerId,
      code: center.code,
      typeName: center.typeName,
    }));

  const projects = centers
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

export async function fetchNextCashAdvanceTransactionNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(cashAdvanceControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function fetchCashAdvanceCopyFromCandidates(query: {
  branchUnitId?: number | null;
  partyCode?: string;
  partyName?: string;
  target: "cash-voucher" | "disbursement-voucher";
}): Promise<CashAdvanceCopyFromCandidate[]> {
  const params = cleanCopyFromQueryParams({
    branchUnitId: query.branchUnitId ?? undefined,
    limit: 100,
    page: 1,
    partyCode: query.partyCode,
    partyName: query.partyName,
    target: query.target,
  }) as CashAdvanceControllerFindCopyFromCandidatesV1Params;
  const response = await cashAdvanceControllerFindCopyFromCandidatesV1(params);

  return response.records;
}

export async function fetchCashAdvanceById(id: string): Promise<CashAdvanceRecord> {
  const response = (await cashAdvanceControllerFindOneV1(id)) as unknown as CashAdvanceSingleResponseDto;
  return mapCashAdvanceResponseFromApi(response);
}

export async function createCashAdvanceApi(
  values: CashAdvanceFormValues,
  options?: CashAdvanceApiOptions,
): Promise<CashAdvanceRecord> {
  const payload = mapCashAdvanceValuesToApi(values, options) as unknown as CreateCashAdvanceDto;
  const response = (await cashAdvanceControllerCreateV1(payload)) as unknown as CashAdvanceSingleResponseDto;
  return mapCashAdvanceResponseFromApi(response);
}

export async function updateCashAdvanceApi(
  id: string,
  values: CashAdvanceFormValues,
  options?: CashAdvanceApiOptions,
): Promise<CashAdvanceRecord> {
  const payload = mapCashAdvanceValuesToApi(values, options) as unknown as UpdateCashAdvanceDto;
  const response = (await cashAdvanceControllerUpdateV1(id, payload)) as unknown as CashAdvanceSingleResponseDto;
  return mapCashAdvanceResponseFromApi(response);
}

export async function deleteCashAdvanceApi(id: string): Promise<void> {
  await cashAdvanceControllerRemoveV1(id);
}

export async function submitCashAdvanceApprovalApi(id: string): Promise<CashAdvanceRecord> {
  const response = (await cashAdvanceControllerSubmitApprovalV1(id)) as unknown as CashAdvanceSingleResponseDto;
  return mapCashAdvanceResponseFromApi(response);
}

export async function updateCashAdvanceStatusApi(id: string, status: CashAdvanceStatus): Promise<CashAdvanceRecord> {
  const response = (await cashAdvanceControllerUpdateStatusV1(id, {
    status: mapCashAdvanceStatusToApi(status) as UpdateCashAdvanceStatusDtoStatus,
  })) as unknown as CashAdvanceSingleResponseDto;
  return mapCashAdvanceResponseFromApi(response);
}

function mapCashAdvanceValuesToApi(values: CashAdvanceFormValues, options?: CashAdvanceApiOptions) {
  return {
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    accountingEntries: values.accountingEntries,
    branchUnitId: options?.branchUnitId,
    costCenter: values.costCenter,
    currency: values.currency,
    documentDate: values.documentDate,
    exchangeRate: values.exchangeRate,
    items: (values.items || []).filter((item) => item.partyCode.trim() || item.partyName.trim() || item.amount.trim()),
    partyCode: values.partyCode,
    partyName: values.partyName,
    projectCode: values.projectCode,
    projectName: values.projectName,
    projectRef: values.projectName,
    remarks: values.remarks,
    status: mapCashAdvanceStatusToApi(values.status),
    transNo: values.transNo,
  };
}

function mapCashAdvanceResponseFromApi(response: unknown): CashAdvanceRecord {
  const data = (response && typeof response === "object" && "data" in response)
    ? (response as { data: Record<string, unknown> }).data
    : (response as Record<string, unknown>);
  return mapCashAdvanceRecordFromApi(data);
}

function mapCashAdvanceRecordFromApi(rawRecord: Record<string, unknown>): CashAdvanceRecord {
  const record = rawRecord as Partial<CashAdvanceRecord> & Record<string, unknown>;
  const projectName = (record.projectName as string | undefined) ?? (record.projectRef as string | undefined) ?? "";
  const projectRef = (record.projectName as string | undefined) ?? (record.projectRef as string | undefined) ?? "";
  const formValues = record.formValues as CashAdvanceFormValues | undefined;

  return {
    id: String(record.id ?? ""),
    transNo: String(record.transNo ?? ""),
    documentDate: String(record.documentDate ?? ""),
    partyCode: String(record.partyCode ?? ""),
    partyName: String(record.partyName ?? ""),
    projectCode: record.projectCode ? String(record.projectCode) : undefined,
    projectName,
    projectRef,
    accountCode: String(record.accountCode ?? ""),
    accountTitle: String(record.accountTitle ?? ""),
    costCenter: String(record.costCenter ?? ""),
    currency: String(record.currency ?? formValues?.currency ?? "PHP"),
    exchangeRate: (record.exchangeRate as string | number | undefined) ?? formValues?.exchangeRate ?? (record.fxRate as string | number | undefined) ?? "1.00",
    amount: typeof record.amount === "number" ? record.amount : Number(record.amount ?? 0),
    remarks: String(record.remarks ?? ""),
    formValues: formValues
      ? {
          ...formValues,
          projectName: formValues.projectName ?? formValues.projectRef ?? "",
          projectRef: formValues.projectName ?? formValues.projectRef ?? "",
          status: mapCashAdvanceStatusFromApi(formValues.status),
        }
      : undefined,
    status: mapCashAdvanceStatusFromApi(String(record.status ?? "")),
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
    createdBy: record.createdBy ? String(record.createdBy) : undefined,
    updatedAt: record.updatedAt ? String(record.updatedAt) : undefined,
    updatedBy: record.updatedBy ? String(record.updatedBy) : undefined,
  };
}

function mapCashAdvanceStatusFromApi(status: string): CashAdvanceStatus {
  const statusMap: Record<string, CashAdvanceStatus> = {
    APPROVED: "Posted",
    CANCELLED: "Cancelled",
    CLOSED: "Closed",
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
    Closed: "CLOSED",
    Disapproved: "DISAPPROVED",
    Draft: "DRAFT",
    "For Approval": "FOR_APPROVAL",
    Open: "DRAFT",
    Posted: "POSTED",
  };

  return statusMap[status] ?? (status as ApiCashAdvanceStatus);
}
