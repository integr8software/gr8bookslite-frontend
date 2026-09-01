"use client";

import {
  pettyCashVoucherControllerCreateV1 as pettyCashVoucherControllerCreate,
  pettyCashVoucherControllerFindAllV1 as pettyCashVoucherControllerFindAll,
  pettyCashVoucherControllerFindOneV1 as pettyCashVoucherControllerFindOne,
  pettyCashVoucherControllerRemoveV1 as pettyCashVoucherControllerRemove,
  pettyCashVoucherControllerSuggestTransactionNumberV1,
  pettyCashVoucherControllerUpdateStatusV1 as pettyCashVoucherControllerUpdateStatus,
  pettyCashVoucherControllerUpdateV1 as pettyCashVoucherControllerUpdate,
} from "@/app/src/generated/api/petty-cash-voucher/petty-cash-voucher";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
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
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

type AuditUserSnapshot = {
  firstName?: string | null;
  lastName?: string | null;
};

type PettyCashVoucherResponseExtras = {
  createdByUser?: AuditUserSnapshot | null;
  updatedByUser?: AuditUserSnapshot | null;
};

type PettyCashVoucherQueryParams = NonNullable<Parameters<typeof pettyCashVoucherControllerFindAll>[0]>;

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

export async function fetchPettyCashVoucherList(params?: FetchPettyCashVoucherListParams): Promise<FetchPettyCashVoucherListResponse> {
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

  const response = (await pettyCashVoucherControllerFindAll(queryParams)) as PettyCashVoucherListResponseDto;
  return {
    data: (response?.items ?? []).map(mapPettyCashVoucherRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchPettyCashVoucherById(id: string): Promise<PettyCashVoucherRecord> {
  const response = (await pettyCashVoucherControllerFindOne(id)) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function fetchNextPettyCashVoucherNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(pettyCashVoucherControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createPettyCashVoucherApi(values: PettyCashVoucherFormValues): Promise<PettyCashVoucherRecord> {
  const payload = mapPettyCashVoucherFormValuesToCreateDto(values);
  const response = (await pettyCashVoucherControllerCreate(payload)) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function updatePettyCashVoucherApi(id: string, values: PettyCashVoucherFormValues): Promise<PettyCashVoucherRecord> {
  const payload = mapPettyCashVoucherFormValuesToUpdateDto(values);
  const response = (await pettyCashVoucherControllerUpdate(id, payload)) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function updatePettyCashVoucherStatusApi(id: string, status: PettyCashVoucherStatus): Promise<PettyCashVoucherRecord> {
  const apiStatus = StatusToApi[status];
  const response = (await pettyCashVoucherControllerUpdateStatus(id, { status: apiStatus })) as PettyCashVoucherResponseDto;
  return mapPettyCashVoucherRecordFromDto(response);
}

export async function deletePettyCashVoucherApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashVoucherControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchPettyCashVoucherPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePartyOptions();
}

export async function fetchPettyCashVoucherAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePostingAccountOptions();
}

export async function fetchPettyCashVoucherResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenanceResponsibilityCenterOptions();
}
