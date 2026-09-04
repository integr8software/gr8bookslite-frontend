"use client";

import {
  pettyCashFundControllerCreateV1,
  pettyCashFundControllerFindAllV1,
  pettyCashFundControllerFindOneV1,
  pettyCashFundControllerRemoveV1,
  pettyCashFundControllerSuggestTransactionNumberV1,
  pettyCashFundControllerUpdateStatusV1,
  pettyCashFundControllerUpdateV1,
} from "@/app/src/generated/api/petty-cash-fund/petty-cash-fund";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import { PettyCashFundStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  CreatePettyCashFundDto,
  PettyCashFundDetailDto,
  PettyCashFundListResponseDto,
  PettyCashFundResponseDto,
  UpdatePettyCashFundDto,
  UpdatePettyCashFundStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculatePettyCashFundTotals } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";

type AuditUserSnapshot = {
  firstName?: string | null;
  lastName?: string | null;
};

type PettyCashFundResponseExtras = {
  createdByUser?: AuditUserSnapshot | null;
  disburseAmount?: number | string | null;
  updatedByUser?: AuditUserSnapshot | null;
};

type PettyCashFundDetailExtras = {
  type?: string | null;
};

type PettyCashFundQueryParams = NonNullable<Parameters<typeof pettyCashFundControllerFindAllV1>[0]>;

export type FetchPettyCashFundListParams = {
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

type MappedPettyCashFundListResponse = Omit<PettyCashFundListResponseDto, "items"> & {
  data: PettyCashFundRecord[];
};

export const StatusFromApi: Record<string, PettyCashFundStatus> = {
  DRAFT: PettyCashFundStatuses.Draft,
  FOR_APPROVAL: "For Approval",
  APPROVED: "For Approval",
  POSTED: "Posted",
  DISAPPROVED: "Disapproved",
  CANCELLED: "Cancelled",
};

export const StatusToApi: Record<PettyCashFundStatus, UpdatePettyCashFundStatusDtoStatus> = {
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
  Disapproved: "DISAPPROVED",
  Cancelled: "CANCELLED",
};

export function mapPettyCashFundRecordFromDto(dto: PettyCashFundResponseDto): PettyCashFundRecord {
  const dtoExtras = dto as PettyCashFundResponseDto & PettyCashFundResponseExtras;
  const items: PettyCashFundItem[] = (dto.details ?? []).map((d: PettyCashFundDetailDto & PettyCashFundDetailExtras, index: number) => ({
    id: d.id ? String(d.id) : `item-${index + 1}`,
    date: (d.itemDate || d.date) ? String(d.itemDate || d.date).split("T")[0] : "",
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
    type: d.type ?? "",
    vatType: d.vatType ?? "",
    grossAmount: String(d.grossAmount ?? 0),
    responsibilityCenterCode: d.responsibilityCenterCodeSnapshot ?? "",
    responsibilityCenterName: d.responsibilityCenterSnapshot ?? "",
  }));

  const formValues: PettyCashFundFormValues = {
    transactionNo: dto.transactionNo,
    documentDate: dto.documentDate,
    status: StatusFromApi[dto.status] ?? PettyCashFundStatuses.Draft,
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
  const totals = calculatePettyCashFundTotals(items);

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
    status: StatusFromApi[dto.status] ?? PettyCashFundStatuses.Draft,
    createdBy: createdUser ? `${createdUser.firstName ?? ""} ${createdUser.lastName ?? ""}`.trim() : "",
    createdAt: dto.createdAt,
    updatedBy: updatedUser ? `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim() : "",
    updatedAt: dto.updatedAt,
    formValues,
  };
}

export function mapPettyCashFundFormValuesToCreateDto(values: PettyCashFundFormValues): CreatePettyCashFundDto {
  const items =
    values.status === PettyCashFundStatuses.Draft ? (values.items ?? []).filter(isPettyCashFundItemPopulated) : (values.items ?? []);
  const details = items.map((item, index) => ({
    lineNumber: index + 1,
    itemDate: item.date || undefined,
    supplierCode: item.supplierCode,
    supplierName: item.supplierName,
    particulars: item.particulars,
    responsibilityCenterCode: item.responsibilityCenterCode,
    responsibilityCenter: item.responsibilityCenterName,
    grossAmount: parseMoneyNumberInput(item.grossAmount),
    vatType: item.vatType,
    vatPercent: parseMoneyNumberInput(item.vatPercent),
    vatAmount: parseMoneyNumberInput(item.vatAmount),
    netAmount: parseMoneyNumberInput(item.netAmount),
    ewtCode: item.ewtCode,
    ewtPercent: parseMoneyNumberInput(item.ewtPercent),
    ewtAmount: parseMoneyNumberInput(item.ewtAmount),
    disburseAmount: parseMoneyNumberInput(item.disburseAmount),
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
    status: values.status && values.status !== "Open" ? StatusToApi[values.status as PettyCashFundStatus] : "DRAFT",
    details,
  };
}

function isPettyCashFundItemPopulated(item: PettyCashFundItem) {
  return Boolean(
    item.supplierCode.trim() ||
      item.supplierName.trim() ||
      item.particulars.trim() ||
      item.amount.trim() ||
      item.grossAmount.trim() ||
      item.disburseAmount.trim(),
  );
}

export function mapPettyCashFundFormValuesToUpdateDto(values: PettyCashFundFormValues): UpdatePettyCashFundDto {
  return mapPettyCashFundFormValuesToCreateDto(values) as UpdatePettyCashFundDto;
}

export async function fetchPettyCashFundList(params?: FetchPettyCashFundListParams): Promise<MappedPettyCashFundListResponse> {
  const queryParams: PettyCashFundQueryParams = {
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
    queryParams.status = (StatusToApi[params.status as PettyCashFundStatus] ?? params.status) as PettyCashFundQueryParams["status"];
  }

  const response = (await pettyCashFundControllerFindAllV1(queryParams)) as PettyCashFundListResponseDto;
  return {
    data: (response?.items ?? []).map(mapPettyCashFundRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchPettyCashFundById(id: string): Promise<PettyCashFundRecord> {
  const response = (await pettyCashFundControllerFindOneV1(id)) as PettyCashFundResponseDto;
  return mapPettyCashFundRecordFromDto(response);
}

export async function fetchNextPettyCashFundNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(pettyCashFundControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createPettyCashFundApi(values: PettyCashFundFormValues): Promise<PettyCashFundRecord> {
  const payload = mapPettyCashFundFormValuesToCreateDto(values);
  const response = (await pettyCashFundControllerCreateV1(payload)) as PettyCashFundResponseDto;
  return mapPettyCashFundRecordFromDto(response);
}

export async function updatePettyCashFundApi(id: string, values: PettyCashFundFormValues): Promise<PettyCashFundRecord> {
  const payload = mapPettyCashFundFormValuesToUpdateDto(values);
  const response = (await pettyCashFundControllerUpdateV1(id, payload)) as PettyCashFundResponseDto;
  return mapPettyCashFundRecordFromDto(response);
}

export async function updatePettyCashFundStatusApi(id: string, status: PettyCashFundStatus): Promise<PettyCashFundRecord> {
  const apiStatus = StatusToApi[status];
  const response = (await pettyCashFundControllerUpdateStatusV1(id, { status: apiStatus })) as PettyCashFundResponseDto;
  return mapPettyCashFundRecordFromDto(response);
}

export async function deletePettyCashFundApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashFundControllerRemoveV1(id);
  return { success: true, message: "Deleted successfully" };
}
