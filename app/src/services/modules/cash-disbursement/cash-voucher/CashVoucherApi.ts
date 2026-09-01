import { cashVoucherControllerSuggestTransactionNumberV1 } from "@/app/src/generated/api/cash-voucher/cash-voucher";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
import type {
  CashVoucherLineEntry,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

type ApiCashVoucherStatus = "DRAFT" | "FOR_APPROVAL" | "APPROVED" | "POSTED" | "DISAPPROVED" | "CANCELLED" | "CLOSED";
type ApiCashVoucherLineAmountSource = CashVoucherLineEntry & {
  accountTitle?: string;
  disburseAmount?: number;
  grossAmount?: number;
  ewtPercent?: number;
  vatPercent?: number;
};

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
  return fetchTransactionNumber(cashVoucherControllerSuggestTransactionNumberV1);
}

export async function fetchCashVoucherPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePartyOptions();
}

export async function fetchCashVoucherAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePostingAccountOptions();
}

export async function fetchCashVoucherResponsibilityCenters(): Promise<{
  costCenters: AppAdvancedDropdownOption[];
  projects: AppAdvancedDropdownOption[];
}> {
  const centers = await fetchMaintenanceResponsibilityCenterOptions();
  const isProject = (rc: { typeName?: string; name?: string }) =>
    rc.typeName?.toLowerCase().includes("project") || rc.name?.toLowerCase().includes("project");

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
  const details = getCashVoucherPayloadDetails(payload.details, payload.status);
  const transformedPayload = {
    ...payload,
    details: details.map((detail, index) => ({
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
  const details = payload.details ? getCashVoucherPayloadDetails(payload.details, payload.status) : undefined;
  const transformedPayload = {
    ...payload,
    ...(details
      ? {
          details: details.map((detail, index) => ({
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
  const displayAmount = getCashVoucherDisplayGrossAmount(record);
  const displayDisburseAmount = getCashVoucherDisplayDisburseAmount(record);

  return {
    ...record,
    amount: displayAmount,
    disburseAmount: displayDisburseAmount,
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

function getCashVoucherDisplayDisburseAmount(record: CashVoucherRecord) {
  const rawRecord = record as CashVoucherRecord & { details?: ApiCashVoucherLineAmountSource[] };
  const sourceRows = (rawRecord.lineEntries ?? rawRecord.details ?? []).filter((entry) => !isGeneratedCashVoucherApiLine(entry));
  const disburseAmount = sourceRows.reduce((sum, entry) => sum + getCashVoucherApiLineDisburseAmount(entry), 0);

  return disburseAmount > 0 ? roundCashVoucherApiAmount(disburseAmount) : record.disburseAmount ?? record.amount;
}

function getCashVoucherDisplayGrossAmount(record: CashVoucherRecord) {
  const rawRecord = record as CashVoucherRecord & { details?: ApiCashVoucherLineAmountSource[] };
  const sourceRows = (rawRecord.lineEntries ?? rawRecord.details ?? []).filter((entry) => !isGeneratedCashVoucherApiLine(entry));
  const grossAmount = sourceRows.reduce((sum, entry) => sum + getCashVoucherApiLineGrossAmount(entry), 0);

  return grossAmount > 0 ? roundCashVoucherApiAmount(grossAmount) : record.amount;
}

function getCashVoucherApiLineDisburseAmount(entry: ApiCashVoucherLineAmountSource) {
  const grossAmount = getCashVoucherApiLineGrossAmount(entry);
  const ewtPercent = Number(entry.taxDetails?.ewtPercent || entry.ewtPercent || 0);

  if (grossAmount > 0 && ewtPercent > 0) {
    return grossAmount - grossAmount * (ewtPercent / 100);
  }

  return Number(entry.taxDetails?.amount || entry.disburseAmount || 0) || grossAmount;
}

function getCashVoucherApiLineGrossAmount(entry: ApiCashVoucherLineAmountSource) {
  const storedGrossAmount = Number(entry.taxDetails?.grossAmount || entry.grossAmount || 0);
  const debitAmount = Number(entry.debit || 0);
  const vatPercent = Number(entry.taxDetails?.vatPercent || entry.vatPercent || 0);

  if (storedGrossAmount > 0 && debitAmount > 0 && vatPercent > 0 && Math.abs(storedGrossAmount - debitAmount) <= 0.01) {
    const netRatio = 1 - vatPercent / 100;

    if (netRatio > 0) {
      return debitAmount / netRatio;
    }
  }

  return storedGrossAmount || debitAmount;
}

function isGeneratedCashVoucherApiLine(entry: ApiCashVoucherLineAmountSource) {
  const id = String(entry.id ?? "");
  const accountName = String(entry.accountName || entry.accountTitle || "").trim().toLowerCase();

  return (
    id.startsWith("auto-input-vat-") ||
    id.startsWith("auto-ewt-") ||
    id.startsWith("auto-credit-") ||
    accountName === "input vat" ||
    accountName === "expanded withholding tax" ||
    accountName === "cash on hand" ||
    accountName === "cash in bank" ||
    accountName.startsWith("cash in bank - ") ||
    accountName === "check cashvoucher clearing" ||
    accountName === "online payment clearing"
  );
}

function roundCashVoucherApiAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

function getCashVoucherPayloadDetails(details: CashVoucherLineEntry[], status?: CashVoucherStatus) {
  if (status === "Draft" || status === "Open" || !status) {
    return details.filter(cashVoucherLineEntryHasData);
  }

  return details;
}

function cashVoucherLineEntryHasData(detail: CashVoucherLineEntry) {
  return (
    detail.accountCode.trim() !== "" ||
    detail.accountName.trim() !== "" ||
    (detail.checkDate ?? "").trim() !== "" ||
    (detail.checkNo ?? "").trim() !== "" ||
    (detail.checkStatus ?? "").trim() !== "" ||
    (detail.partyCode ?? "").trim() !== "" ||
    (detail.partyName ?? "").trim() !== "" ||
    (detail.responsibilityCenter ?? "").trim() !== "" ||
    (detail.refId ?? "").trim() !== "" ||
    (detail.vatType ?? "").trim() !== "" ||
    (detail.ewtCode ?? "").trim() !== "" ||
    (detail.particulars ?? detail.remarks ?? "").trim() !== "" ||
    Number(detail.debit || 0) > 0 ||
    Number(detail.credit || 0) > 0 ||
    detail.taxRate !== "0%"
  );
}

function cleanOptional(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}
