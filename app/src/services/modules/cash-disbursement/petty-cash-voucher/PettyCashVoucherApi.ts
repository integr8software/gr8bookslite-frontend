"use client";

import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { cleanCopyFromQueryParams } from "@/app/src/utils/query.util";
import {
  pettyCashVoucherControllerCreateV1,
  pettyCashVoucherControllerFindAllV1,
  pettyCashVoucherControllerFindOneV1,
  pettyCashVoucherControllerRemoveV1,
  pettyCashVoucherControllerSuggestTransactionNumberV1,
  pettyCashVoucherControllerUpdateStatusV1,
  pettyCashVoucherControllerUpdateV1,
} from "@/app/src/generated/api/petty-cash-voucher/petty-cash-voucher";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import { PettyCashVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  CreatePettyCashVoucherDto,
  PettyCashVoucherDetailDto,
  PettyCashVoucherListResponseDto,
  PettyCashVoucherResponseDto,
  UpdatePettyCashVoucherDto,
  UpdatePettyCashVoucherStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherItem,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculatePettyCashVoucherTotals } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";

type AuditUserSnapshot = {
  firstName?: string | null;
  lastName?: string | null;
};

type PettyCashVoucherResponseExtras = {
  createdByUser?: AuditUserSnapshot | null;
  disburseAmount?: number | string | null;
  updatedByUser?: AuditUserSnapshot | null;
};

type PettyCashVoucherDetailExtras = {
  type?: string | null;
};

type PettyCashVoucherQueryParams = NonNullable<Parameters<typeof pettyCashVoucherControllerFindAllV1>[0]>;
export type PettyCashVoucherCopyFromCandidate = {
  accountCode?: string | null;
  accountTitle?: string | null;
  amount: number;
  availableAmount: number;
  availableGrossAmount: number;
  consumedAmount: number;
  consumedGrossAmount: number;
  currency: string;
  details: Array<{
    date?: string | null;
    disburseAmount: number;
    availableAmount: number;
    availableGrossAmount: number;
    consumedAmount: number;
    consumedGrossAmount: number;
    ewtAmount: number;
    ewtCode?: string | null;
    ewtPercent: number;
    grossAmount: number;
    id: string;
    lineNumber: number;
    netAmount: number;
    particulars?: string | null;
    remarks?: string | null;
    responsibilityCenter?: string | null;
    responsibilityCenterCode?: string | null;
    responsibilityCenterId?: string | null;
    supplierCode?: string | null;
    supplierName?: string | null;
    vatAmount: number;
    vatPercent: number;
    vatType?: string | null;
  }>;
  disburseAmount: number;
  documentDate: string;
  exchangeRate: number;
  id: string;
  partyCode: string;
  partyId?: string | null;
  partyName: string;
  projectCode?: string | null;
  projectName?: string | null;
  remarks?: string | null;
  responsibilityCenter?: string | null;
  responsibilityCenterCode?: string | null;
  responsibilityCenterId?: string | null;
  source: "Petty Cash Voucher";
  sourceNo: string;
  transactionNo: string;
};

export type FetchPettyCashVoucherListParams = {
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

type MappedPettyCashVoucherListResponse = Omit<PettyCashVoucherListResponseDto, "items"> & {
  data: PettyCashVoucherRecord[];
};

export const StatusFromApi: Record<string, PettyCashVoucherStatus> = {
  DRAFT: PettyCashVoucherStatuses.Draft,
  FOR_APPROVAL: "For Approval",
  APPROVED: "Posted",
  POSTED: "Posted",
  DISAPPROVED: "Disapproved",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
};

export const StatusToApi: Record<PettyCashVoucherStatus, string> = {
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
  Disapproved: "DISAPPROVED",
  Cancelled: "CANCELLED",
  Closed: "CLOSED",
};

export function mapPettyCashVoucherRecordFromDto(dto: PettyCashVoucherResponseDto): PettyCashVoucherRecord {
  const dtoExtras = dto as PettyCashVoucherResponseDto & PettyCashVoucherResponseExtras;
  const items: PettyCashVoucherItem[] = (dto.details ?? []).map((d: PettyCashVoucherDetailDto & PettyCashVoucherDetailExtras, index: number) => {
    const disbursementType = d.expenseType ?? d.type ?? "";
    return {
      id: d.id ? String(d.id) : `item-${index + 1}`,
      disbursementType,
      expenseType: disbursementType,
      date: d.itemDate || d.date ? String(d.itemDate || d.date).split("T")[0] : "",
      supplierCode: d.supplierCodeSnapshot ?? "",
      supplierName: d.supplierNameSnapshot ?? "",
      orNo: d.orNo ?? "",
      tinNo: d.tinNo ?? "",
      particulars: d.particulars ?? "",
      remarks: d.remarks ?? "",
      amount: String(d.grossAmount ?? 0),
      netAmount: String(d.netAmount ?? 0),
      vatPercent: String(d.vatPercent ?? 0),
      vatAmount: String(d.vatAmount ?? 0),
      ewtCode: d.ewtCode ?? "",
      ewtPercent: String(d.ewtPercent ?? 0),
      ewtAmount: String(d.ewtAmount ?? 0),
      disburseAmount: String(d.disburseAmount ?? d.grossAmount ?? 0),
      type: disbursementType,
      vatType: d.vatType ?? "",
      grossAmount: String(d.grossAmount ?? 0),
      responsibilityCenterCode: d.responsibilityCenterCodeSnapshot ?? "",
      responsibilityCenterName: d.responsibilityCenterSnapshot ?? "",
    };
  });

  const formValues: PettyCashVoucherFormValues = {
    transactionNo: dto.transactionNo,
    documentDate: dto.documentDate,
    status: StatusFromApi[dto.status] ?? PettyCashVoucherStatuses.Draft,
    partyCode: dto.partyCodeSnapshot ?? "",
    partyName: dto.partyNameSnapshot ?? "",
    responsibilityCenter: dto.responsibilityCenterSnapshot ?? "",
    responsibilityCenterCode: dto.responsibilityCenterCodeSnapshot ?? "",
    projectCode: dto.projectCode ?? "",
    projectName: dto.projectName ?? "",
    accountCode: dto.accountCodeSnapshot ?? "",
    accountTitle: dto.accountTitleSnapshot ?? "",
    currency: dto.currencyCode,
    exchangeRate: dto.exchangeRate !== undefined && dto.exchangeRate !== null ? String(dto.exchangeRate) : "1.00",
    remarks: dto.remarks ?? "",
    items,
    attachments: [],
  };

  const createdUser = dtoExtras.createdByUser;
  const updatedUser = dtoExtras.updatedByUser;
  const totals = calculatePettyCashVoucherTotals(items);

  return {
    id: dto.id,
    transactionNo: dto.transactionNo,
    documentDate: dto.documentDate,
    partyCode: dto.partyCodeSnapshot ?? "",
    partyName: dto.partyNameSnapshot ?? "",
    accountCode: dto.accountCodeSnapshot ?? "",
    accountTitle: dto.accountTitleSnapshot ?? "",
    currency: dto.currencyCode,
    exchangeRate: dto.exchangeRate !== undefined && dto.exchangeRate !== null ? String(dto.exchangeRate) : "1.00",
    amount: totals.grossAmount || (typeof dto.amount === "number" ? dto.amount : Number(dto.amount ?? 0)),
    disburseAmount: totals.disburseAmount || Number(dtoExtras.disburseAmount ?? dto.amount ?? 0),
    remarks: dto.remarks ?? "",
    status: StatusFromApi[dto.status] ?? PettyCashVoucherStatuses.Draft,
    createdBy: createdUser ? `${createdUser.firstName ?? ""} ${createdUser.lastName ?? ""}`.trim() : "",
    createdAt: dto.createdAt,
    updatedBy: updatedUser ? `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim() : "",
    updatedAt: dto.updatedAt,
    formValues,
  };
}

export function mapPettyCashVoucherFormValuesToCreateDto(values: PettyCashVoucherFormValues): CreatePettyCashVoucherDto {
  const items =
    values.status === PettyCashVoucherStatuses.Draft ? (values.items ?? []).filter(isPettyCashVoucherItemPopulated) : (values.items ?? []);
  const details = items.map((item, index) => ({
    lineNumber: index + 1,
    itemDate: item.date || undefined,
    supplierCode: item.supplierCode,
    supplierName: item.supplierName,
    particulars: item.particulars,
    responsibilityCenterCode: item.responsibilityCenterCode,
    responsibilityCenter: item.responsibilityCenterName,
    grossAmount: parseMoneyNumberInput(item.grossAmount || item.amount),
    vatType: item.vatType,
    vatPercent: parseMoneyNumberInput(item.vatPercent),
    vatAmount: parseMoneyNumberInput(item.vatAmount),
    netAmount: parseMoneyNumberInput(item.netAmount),
    ewtCode: item.ewtCode,
    ewtPercent: parseMoneyNumberInput(item.ewtPercent),
    ewtAmount: parseMoneyNumberInput(item.ewtAmount),
    disburseAmount: parseMoneyNumberInput(item.disburseAmount),
    expenseType: item.disbursementType || item.expenseType || item.type || undefined,
  }));

  const totalAmount = details.reduce((sum, d) => sum + (d.grossAmount || 0), 0);

  return {
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    responsibilityCenterCode: values.responsibilityCenterCode,
    responsibilityCenter: values.responsibilityCenter,
    projectCode: values.projectCode,
    projectName: values.projectName,
    currencyCode: values.currency || "PHP",
    exchangeRate: parseMoneyNumberInput(values.exchangeRate) || 1.0,
    amount: totalAmount,
    remarks: values.remarks,
    status: (values.status && values.status !== "Open"
      ? StatusToApi[values.status as PettyCashVoucherStatus]
      : "DRAFT") as CreatePettyCashVoucherDto["status"],
    details,
  };
}

function isPettyCashVoucherItemPopulated(item: PettyCashVoucherItem) {
  return Boolean(
    item.disbursementType?.trim() ||
    item.supplierCode.trim() ||
    item.supplierName.trim() ||
    item.particulars.trim() ||
    item.amount.trim() ||
    item.grossAmount.trim() ||
    item.disburseAmount.trim(),
  );
}

export function mapPettyCashVoucherFormValuesToUpdateDto(values: PettyCashVoucherFormValues): UpdatePettyCashVoucherDto {
  return mapPettyCashVoucherFormValuesToCreateDto(values) as UpdatePettyCashVoucherDto;
}

export async function fetchPettyCashVoucherList(params?: FetchPettyCashVoucherListParams): Promise<MappedPettyCashVoucherListResponse> {
  const queryParams: PettyCashVoucherQueryParams = {
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    partyCode: params?.partyCode,
    startDate: params?.startDate,
    endDate: params?.endDate,
    amountFrom: params?.amountFrom,
    amountTo: params?.amountTo,
    branchUnitId: params?.branchUnitId,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  };

  if (params?.status && params.status !== "all" && params.status !== "All") {
    queryParams.status = (StatusToApi[params.status as PettyCashVoucherStatus] ?? params.status) as PettyCashVoucherQueryParams["status"];
  }

  const response = (await pettyCashVoucherControllerFindAllV1(queryParams)) as PettyCashVoucherListResponseDto;
  return {
    data: (response?.items ?? []).map(mapPettyCashVoucherRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchPettyCashVoucherCopyFromCandidates(params?: {
  branchUnitId?: number | null;
  limit?: number;
  page?: number;
  partyCode?: string | null;
}) {
  const response = await ApiClient.get<{ records: PettyCashVoucherCopyFromCandidate[] }>(
    "/cash-disbursement/petty-cash-voucher/copy-from/candidates",
    {
      params: cleanCopyFromQueryParams({
        branchUnitId: params?.branchUnitId,
        limit: params?.limit ?? 100,
        page: params?.page ?? 1,
        partyCode: params?.partyCode,
      }),
    },
  );

  return response.data.records;
}

export async function fetchPettyCashVoucherById(id: string): Promise<PettyCashVoucherRecord> {
  const response = (await pettyCashVoucherControllerFindOneV1(id)) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function fetchNextPettyCashVoucherNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(pettyCashVoucherControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createPettyCashVoucherApi(values: PettyCashVoucherFormValues): Promise<PettyCashVoucherRecord> {
  const payload = mapPettyCashVoucherFormValuesToCreateDto(values);
  const response = (await pettyCashVoucherControllerCreateV1(payload)) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function updatePettyCashVoucherApi(id: string, values: PettyCashVoucherFormValues): Promise<PettyCashVoucherRecord> {
  const payload = mapPettyCashVoucherFormValuesToUpdateDto(values);
  const response = (await pettyCashVoucherControllerUpdateV1(id, payload)) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function updatePettyCashVoucherStatusApi(id: string, status: PettyCashVoucherStatus): Promise<PettyCashVoucherRecord> {
  const apiStatus = StatusToApi[status] as UpdatePettyCashVoucherStatusDtoStatus;
  const response = (await pettyCashVoucherControllerUpdateStatusV1(id, { status: apiStatus })) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function deletePettyCashVoucherApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashVoucherControllerRemoveV1(id);
  return { success: true, message: "Deleted successfully" };
}
