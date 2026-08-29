import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  CashVoucherLineEntry,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

type ApiCashVoucherStatus = "DRAFT" | "FOR_APPROVAL" | "APPROVED" | "POSTED" | "DISAPPROVED" | "CANCELLED" | "CLOSED";

export type FetchCashVoucherListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  partyCode?: string;
  startDate?: string;
  endDate?: string;
  amountFrom?: number;
  amountTo?: number;
  branchUnitId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type FetchCashVoucherListResponse = {
  data: CashVoucherRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics?: {
    totalVouchers: number;
    draftVouchers: number;
    forApprovalVouchers: number;
    postedVouchers: number;
    disapprovedVouchers: number;
    cancelledVouchers: number;
  };
};

export async function fetchCashVoucherList(params?: FetchCashVoucherListParams): Promise<FetchCashVoucherListResponse> {
  const response = await ApiClient.get<FetchCashVoucherListResponse>("/cash-disbursement/cash-voucher", {
    params: {
      ...params,
      status: params?.status && params.status !== "all" ? mapCashVoucherStatusToApi(params.status) : params?.status,
    },
  });

  return {
    ...response.data,
    data: response.data.data.map(mapCashVoucherRecordFromApi),
  };
}

export async function fetchCashVoucherById(id: string): Promise<CashVoucherRecord> {
  const response = await ApiClient.get<{ data: CashVoucherRecord }>(`/cash-disbursement/cash-voucher/${id}`);
  return mapCashVoucherRecordFromApi(response.data.data);
}

export async function fetchNextCashVoucherTransactionNo(): Promise<string> {
  const response = await ApiClient.get<{ nextTransNo: string }>("/cash-disbursement/cash-voucher/next-transaction-no");
  return response.data.nextTransNo;
}

export async function fetchCashVoucherPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response = await ApiClient.get<{
    parties: Array<{
      id: string;
      partyCode: string;
      partyName: string;
      name: string;
      label: string;
      value: string;
    }>;
  }>("/cash-disbursement/cash-voucher/lookups/parties");

  const parties = response.data?.parties ?? [];
  return parties.map((p) => ({
    name: p.partyName || p.name,
    label: p.partyCode || p.label,
    value: p.partyCode || p.value,
    description: p.partyName,
  }));
}

export async function fetchCashVoucherAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response = await ApiClient.get<{
    accounts: Array<{
      id: string;
      accountCode: string;
      accountTitle: string;
      name: string;
      label: string;
      value: string;
    }>;
  }>("/cash-disbursement/cash-voucher/lookups/accounts");

  const accounts = response.data?.accounts ?? [];
  return accounts.map((a) => ({
    name: a.accountTitle || a.name,
    label: a.accountCode || a.label,
    value: a.accountCode || a.value,
    description: a.accountTitle,
  }));
}

export async function fetchCashVoucherResponsibilityCenters(): Promise<{
  costCenters: AppAdvancedDropdownOption[];
  projects: AppAdvancedDropdownOption[];
}> {
  const response = await ApiClient.get<{
    responsibilityCenters: Array<{
      id: string;
      code: string;
      name: string;
      category?: string;
      label: string;
      value: string;
    }>;
  }>("/cash-disbursement/cash-voucher/lookups/responsibility-centers");

  const centers = response.data?.responsibilityCenters ?? [];
  const isProject = (rc: { category?: string; name?: string }) =>
    rc.category?.toLowerCase() === "project" || rc.name?.toLowerCase().includes("project");

  const costCenters = centers
    .filter((rc) => !isProject(rc))
    .map((rc) => ({
      name: rc.name,
      label: rc.code,
      value: rc.name,
      description: rc.code,
    }));

  const projects = centers
    .filter((rc) => isProject(rc))
    .map((rc) => ({
      name: rc.name,
      label: rc.code,
      value: rc.name,
    }));

  return { costCenters, projects };
}

export async function createCashVoucherApi(payload: {
  branchUnitId?: number;
  partyId?: string;
  partyCode: string;
  partyName: string;
  creditAccountId?: string;
  voucherNo?: string;
  voucherDate: string;
  paymentDueDate?: string;
  referenceNo?: string;
  referenceModule?: string;
  voucherReferenceNo?: string;
  invoiceReferenceNo?: string;
  paymentMethod?: string;
  disbursementType?: string;
  costCenter?: string;
  projectCode?: string;
  projectName?: string;
  preparedBy?: string;
  currency?: string;
  fxRate?: string | number;
  amount?: string | number;
  remarks?: string;
  status?: CashVoucherStatus;
  details: CashVoucherLineEntry[];
}): Promise<CashVoucherRecord> {
  const transformedPayload = {
    ...payload,
    details: payload.details.map((detail, index) => ({
      id: detail.id,
      lineNumber: index + 1,
      accountCode: detail.accountCode,
      accountTitle: detail.accountName,
      particulars: detail.particulars || detail.remarks || "",
      remarks: detail.remarks || detail.particulars || "",
      debit: detail.debit,
      credit: detail.credit,
      grossAmount: detail.taxDetails?.grossAmount ?? detail.debit,
      netAmount: detail.taxDetails?.netAmount ?? detail.debit,
      vatType: detail.taxDetails?.vatType ?? detail.vatType ?? "",
      vatCode: detail.taxDetails?.vatCode ?? "",
      vatPercent: detail.taxDetails?.vatPercent ?? 0,
      vatAmount: detail.taxDetails?.vatAmount ?? 0,
      ewtCode: detail.taxDetails?.ewtCode ?? detail.ewtCode ?? "",
      ewtPercent: detail.taxDetails?.ewtPercent ?? 0,
      ewtAmount: detail.taxDetails?.ewtAmount ?? 0,
      disburseAmount: detail.taxDetails?.amount ?? detail.debit,
      partyCode: detail.partyCode || payload.partyCode,
      partyName: detail.partyName || payload.partyName,
      responsibilityCenter: detail.responsibilityCenter || payload.projectCode || payload.costCenter || "",
      refId: detail.refId || payload.voucherReferenceNo || payload.voucherNo || "",
      checkDate: cleanOptional(detail.checkDate),
      checkNo: detail.checkNo,
      checkStatus: detail.checkStatus,
    })),
    status: payload.status ? mapCashVoucherStatusToApi(payload.status) : undefined,
  };

  const response = await ApiClient.post<{ data: CashVoucherRecord }>("/cash-disbursement/cash-voucher", transformedPayload);
  return mapCashVoucherRecordFromApi(response.data.data);
}

export async function updateCashVoucherApi(
  id: string,
  payload: Partial<{
    branchUnitId?: number;
    partyId?: string;
    partyCode: string;
    partyName: string;
    creditAccountId?: string;
    voucherDate: string;
    paymentDueDate?: string;
    referenceNo?: string;
    referenceModule?: string;
    voucherReferenceNo?: string;
    invoiceReferenceNo?: string;
    paymentMethod?: string;
    disbursementType?: string;
    costCenter?: string;
    projectCode?: string;
    projectName?: string;
    preparedBy?: string;
    currency?: string;
    fxRate?: string | number;
    amount?: string | number;
    remarks?: string;
    status?: CashVoucherStatus;
    details?: CashVoucherLineEntry[];
  }>,
): Promise<CashVoucherRecord> {
  const transformedPayload = {
    ...payload,
    ...(payload.details
      ? {
          details: payload.details.map((detail, index) => ({
            id: detail.id,
            lineNumber: index + 1,
            accountCode: detail.accountCode,
            accountTitle: detail.accountName,
            particulars: detail.particulars || detail.remarks || "",
            remarks: detail.remarks || detail.particulars || "",
            debit: detail.debit,
            credit: detail.credit,
            grossAmount: detail.taxDetails?.grossAmount ?? detail.debit,
            netAmount: detail.taxDetails?.netAmount ?? detail.debit,
            vatType: detail.taxDetails?.vatType ?? detail.vatType ?? "",
            vatCode: detail.taxDetails?.vatCode ?? "",
            vatPercent: detail.taxDetails?.vatPercent ?? 0,
            vatAmount: detail.taxDetails?.vatAmount ?? 0,
            ewtCode: detail.taxDetails?.ewtCode ?? detail.ewtCode ?? "",
            ewtPercent: detail.taxDetails?.ewtPercent ?? 0,
            ewtAmount: detail.taxDetails?.ewtAmount ?? 0,
            disburseAmount: detail.taxDetails?.amount ?? detail.debit,
            partyCode: detail.partyCode || payload.partyCode,
            partyName: detail.partyName || payload.partyName,
            responsibilityCenter: detail.responsibilityCenter || payload.projectCode || payload.costCenter || "",
            refId: detail.refId || payload.voucherReferenceNo || "",
            checkDate: cleanOptional(detail.checkDate),
            checkNo: detail.checkNo,
            checkStatus: detail.checkStatus,
          })),
        }
      : {}),
    status: payload.status ? mapCashVoucherStatusToApi(payload.status) : undefined,
  };

  const response = await ApiClient.put<{ data: CashVoucherRecord }>(`/cash-disbursement/cash-voucher/${id}`, transformedPayload);
  return mapCashVoucherRecordFromApi(response.data.data);
}

export async function updateCashVoucherStatusApi(id: string, status: CashVoucherStatus): Promise<CashVoucherRecord> {
  const response = await ApiClient.patch<{ data: CashVoucherRecord }>(`/cash-disbursement/cash-voucher/${id}/status`, {
    status: mapCashVoucherStatusToApi(status),
  });
  return mapCashVoucherRecordFromApi(response.data.data);
}

export async function deleteCashVoucherApi(id: string): Promise<void> {
  await ApiClient.delete(`/cash-disbursement/cash-voucher/${id}`);
}

function mapCashVoucherRecordFromApi(record: CashVoucherRecord): CashVoucherRecord {
  return {
    ...record,
    costCenter: record.projectCode ?? record.costCenter,
    projectCode: record.projectCode ?? record.costCenter,
    history:
      record.history?.map((entry) => ({
        ...entry,
        status: mapCashVoucherStatusFromApi(entry.status),
      })) ?? [],
    status: mapCashVoucherStatusFromApi(record.status),
  };
}

function mapCashVoucherStatusFromApi(status: string): CashVoucherStatus {
  const statusMap: Record<string, CashVoucherStatus> = {
    APPROVED: "Posted",
    CANCELLED: "Cancelled",
    CLOSED: "Closed",
    DISAPPROVED: "Disapproved",
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
  };

  return statusMap[status] ?? (status as CashVoucherStatus);
}

function mapCashVoucherStatusToApi(status: string): ApiCashVoucherStatus {
  const statusMap: Record<string, ApiCashVoucherStatus> = {
    Cancelled: "CANCELLED",
    Closed: "CLOSED",
    Disapproved: "DISAPPROVED",
    Draft: "DRAFT",
    "For Approval": "FOR_APPROVAL",
    Open: "DRAFT",
    Posted: "POSTED",
  };

  return statusMap[status] ?? (status as ApiCashVoucherStatus);
}

function cleanOptional(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}
