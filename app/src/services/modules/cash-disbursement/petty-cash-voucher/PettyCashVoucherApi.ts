"use client";

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
import type {
  CreatePettyCashVoucherDto,
  PettyCashVoucherListResponseDto,
  PettyCashVoucherResponseDto,
  UpdatePettyCashVoucherDto,
  UpdatePettyCashVoucherStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

type AuditUserSnapshot = {
  firstName?: string | null;
  lastName?: string | null;
};

type PettyCashVoucherResponseExtras = {
  createdByUser?: AuditUserSnapshot | null;
  updatedByUser?: AuditUserSnapshot | null;
};

type PettyCashVoucherQueryParams = NonNullable<Parameters<typeof pettyCashVoucherControllerFindAllV1>[0]>;

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
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  APPROVED: "For Approval",
  POSTED: "Posted",
  DISAPPROVED: "Disapproved",
  CANCELLED: "Cancelled",
};

export const StatusToApi: Record<PettyCashVoucherStatus, UpdatePettyCashVoucherStatusDtoStatus> = {
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
  Disapproved: "DISAPPROVED",
  Cancelled: "CANCELLED",
};

export function mapPettyCashVoucherRecordFromDto(dto: PettyCashVoucherResponseDto): PettyCashVoucherRecord {
  const dtoExtras = dto as PettyCashVoucherResponseDto & PettyCashVoucherResponseExtras;
  const createdUser = dtoExtras.createdByUser;
  const updatedUser = dtoExtras.updatedByUser;
  const grossAmount = Number(dto.grossAmount ?? dto.amount ?? 0);
  const disburseAmount = Number(dto.netAmount ?? dto.amount ?? grossAmount);

  return {
    id: dto.id,
    voucherNo: dto.voucherNo,
    documentDate: dto.documentDate,
    partyCode: dto.partyCodeSnapshot ?? "",
    partyName: dto.partyNameSnapshot ?? "",
    accountCode: dto.accountCodeSnapshot ?? "",
    accountTitle: dto.accountTitleSnapshot ?? "",
    currency: dto.currencyCode,
    exchangeRate: dto.exchangeRate !== undefined && dto.exchangeRate !== null ? String(dto.exchangeRate) : "1.00",
    amount: grossAmount,
    disburseAmount,
    ewtAmount: dto.ewtAmount,
    ewtCode: dto.ewtCode ?? "",
    ewtRate: dto.ewtRate ?? `${dto.ewtPercent ?? 0}%`,
    remarks: dto.remarks ?? "",
    status: StatusFromApi[dto.status] ?? "Draft",
    netAmount: dto.netAmount,
    vatable: dto.vatable as PettyCashVoucherRecord["vatable"],
    vatAmount: dto.vatAmount,
    vatRate: dto.vatRate ?? `${dto.vatPercent ?? 0}%`,
    vatType: dto.vatType ?? "",
    createdBy: createdUser ? `${createdUser.firstName ?? ""} ${createdUser.lastName ?? ""}`.trim() : "",
    dateCreated: dto.createdAt,
    updatedBy: updatedUser ? `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim() : "",
    dateModified: dto.updatedAt,
  };
}

export function mapPettyCashVoucherFormValuesToCreateDto(values: PettyCashVoucherFormValues): CreatePettyCashVoucherDto {
  return {
    voucherNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    responsibilityCenterCode: values.responsibilityCenterCode,
    responsibilityCenter: values.responsibilityCenter,
    currencyCode: values.currency || "PHP",
    exchangeRate: parseMoneyNumberInput(values.exchangeRate) || 1.0,
    amount: parseMoneyNumberInput(values.amount),
    vatType: values.vatType,
    vatable: values.vatable as CreatePettyCashVoucherDto["vatable"],
    vatPercent: parseMoneyNumberInput(values.vatRate),
    vatAmount: parseMoneyNumberInput(values.vatAmount),
    ewtCode: values.ewtCode,
    ewtPercent: parseMoneyNumberInput(values.ewtRate),
    ewtAmount: parseMoneyNumberInput(values.ewtAmount),
    netAmount: parseMoneyNumberInput(values.netAmount),
    remarks: values.remarks,
    status: values.status && values.status !== "Open" ? StatusToApi[values.status as PettyCashVoucherStatus] : "DRAFT",
  };
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

  if (params?.status && params.status !== "all") {
    queryParams.status = (StatusToApi[params.status as PettyCashVoucherStatus] ?? params.status) as PettyCashVoucherQueryParams["status"];
  }

  const response = (await pettyCashVoucherControllerFindAllV1(queryParams)) as PettyCashVoucherListResponseDto;
  return {
    data: (response?.items ?? []).map(mapPettyCashVoucherRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
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
  const apiStatus = StatusToApi[status];
  const response = (await pettyCashVoucherControllerUpdateStatusV1(id, { status: apiStatus })) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function deletePettyCashVoucherApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashVoucherControllerRemoveV1(id);
  return { success: true, message: "Deleted successfully" };
}
