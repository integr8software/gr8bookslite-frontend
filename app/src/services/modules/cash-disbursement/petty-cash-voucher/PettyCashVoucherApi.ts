"use client";

import {
  pettyCashVoucherControllerCreate,
  pettyCashVoucherControllerFindAll,
  pettyCashVoucherControllerFindOne,
  pettyCashVoucherControllerFindParties,
  pettyCashVoucherControllerFindPostingAccounts,
  pettyCashVoucherControllerFindResponsibilityCenters,
  pettyCashVoucherControllerRemove,
  pettyCashVoucherControllerSuggestVoucherNo,
  pettyCashVoucherControllerUpdate,
  pettyCashVoucherControllerUpdateStatus,
} from "@/app/src/generated/api/cash-disbursement-petty-cash-voucher/cash-disbursement-petty-cash-voucher";
import type {
  CreatePettyCashVoucherDto,
  PettyCashVoucherResponseDto,
  UpdatePettyCashVoucherDto,
  UpdatePettyCashVoucherStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

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

export type FetchPettyCashVoucherListResponse = {
  data: PettyCashVoucherRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  const createdUser = (dto as any).createdByUser;
  const updatedUser = (dto as any).updatedByUser;

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
    amount: typeof dto.amount === "number" ? dto.amount : Number(dto.amount ?? 0),
    remarks: dto.remarks ?? "",
    status: StatusFromApi[dto.status] ?? "Draft",
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
    vatable: (values.vatable as any),
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

export async function fetchPettyCashVoucherList(params?: FetchPettyCashVoucherListParams): Promise<FetchPettyCashVoucherListResponse> {
  const queryParams: any = {
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
    queryParams.status = StatusToApi[params.status as PettyCashVoucherStatus] ?? params.status;
  }

  const response: any = await pettyCashVoucherControllerFindAll(queryParams);
  return {
    data: (response?.items ?? []).map(mapPettyCashVoucherRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchPettyCashVoucherById(id: string): Promise<PettyCashVoucherRecord> {
  const response: any = await pettyCashVoucherControllerFindOne(id);
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function fetchNextPettyCashVoucherNo(branchUnitId?: number): Promise<string> {
  const response: any = await pettyCashVoucherControllerSuggestVoucherNo({ branchUnitId });
  return response?.nextVoucherNo ?? response?.voucherNo ?? "";
}

export async function createPettyCashVoucherApi(values: PettyCashVoucherFormValues): Promise<PettyCashVoucherRecord> {
  const payload = mapPettyCashVoucherFormValuesToCreateDto(values);
  const response: any = await pettyCashVoucherControllerCreate(payload);
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function updatePettyCashVoucherApi(id: string, values: PettyCashVoucherFormValues): Promise<PettyCashVoucherRecord> {
  const payload = mapPettyCashVoucherFormValuesToUpdateDto(values);
  const response: any = await pettyCashVoucherControllerUpdate(id, payload);
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function updatePettyCashVoucherStatusApi(id: string, status: PettyCashVoucherStatus): Promise<PettyCashVoucherRecord> {
  const apiStatus = StatusToApi[status];
  const response: any = await pettyCashVoucherControllerUpdateStatus(id, { status: apiStatus });
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function deletePettyCashVoucherApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashVoucherControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchPettyCashVoucherPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await pettyCashVoucherControllerFindParties();
  const parties = response?.parties ?? response?.options ?? response?.items ?? [];
  return parties.map((p: any) => ({
    name: p.partyName || p.name,
    label: p.partyCode || p.label,
    value: p.partyCode || p.value,
    description: p.partyName,
    partyId: p.partyId || p.id,
    partyCode: p.partyCode,
    partyName: p.partyName,
  }));
}

export async function fetchPettyCashVoucherAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await pettyCashVoucherControllerFindPostingAccounts();
  const accounts = response?.accounts ?? response?.options ?? response?.items ?? [];
  return accounts.map((a: any) => ({
    name: a.accountTitle || a.name,
    label: a.accountCode || a.label,
    value: a.accountCode || a.value,
    description: a.accountTitle,
    accountId: a.accountId || a.id,
    accountCode: a.accountCode,
    accountTitle: a.accountTitle,
  }));
}

export async function fetchPettyCashVoucherResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await pettyCashVoucherControllerFindResponsibilityCenters();
  const centers = response?.centers ?? response?.responsibilityCenters ?? response?.options ?? response?.items ?? [];
  return centers.map((rc: any) => ({
    name: rc.name,
    label: rc.code || rc.label,
    value: rc.code || rc.value,
    description: rc.name,
    centerId: rc.centerId || rc.id,
    code: rc.code,
  }));
}
