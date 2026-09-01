"use client";

import {
  pettyCashFundControllerCreateV1 as pettyCashFundControllerCreate,
  pettyCashFundControllerFindAllV1 as pettyCashFundControllerFindAll,
  pettyCashFundControllerFindOneV1 as pettyCashFundControllerFindOne,
  pettyCashFundControllerRemoveV1 as pettyCashFundControllerRemove,
  pettyCashFundControllerSuggestTransactionNumberV1,
  pettyCashFundControllerUpdateStatusV1 as pettyCashFundControllerUpdateStatus,
  pettyCashFundControllerUpdateV1 as pettyCashFundControllerUpdate,
} from "@/app/src/generated/api/petty-cash-fund/petty-cash-fund";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
import type {
  CreatePettyCashFundDto,
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
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculatePettyCashFundTotals } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";

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

export type FetchPettyCashFundListResponse = {
  data: PettyCashFundRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const StatusFromApi: Record<string, PettyCashFundStatus> = {
  DRAFT: "Draft",
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
  const items: PettyCashFundItem[] = (dto.details ?? []).map((d: any, index: number) => ({
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
    status: (StatusFromApi[dto.status] ?? "Draft") as any,
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

  const createdUser = (dto as any).createdByUser;
  const updatedUser = (dto as any).updatedByUser;
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
    disburseAmount: totals.disburseAmount || Number((dto as any).disburseAmount ?? dto.amount ?? 0),
    remarks: dto.remarks ?? "",
    status: StatusFromApi[dto.status] ?? "Draft",
    createdBy: createdUser ? `${createdUser.firstName ?? ""} ${createdUser.lastName ?? ""}`.trim() : "",
    createdAt: dto.createdAt,
    updatedBy: updatedUser ? `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim() : "",
    updatedAt: dto.updatedAt,
    formValues,
  };
}

export function mapPettyCashFundFormValuesToCreateDto(values: PettyCashFundFormValues): CreatePettyCashFundDto {
  const items = values.status === "Draft" ? (values.items ?? []).filter(isPettyCashFundItemPopulated) : (values.items ?? []);
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

export async function fetchPettyCashFundList(params?: FetchPettyCashFundListParams): Promise<FetchPettyCashFundListResponse> {
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
    queryParams.status = StatusToApi[params.status as PettyCashFundStatus] ?? params.status;
  }

  const response: any = await pettyCashFundControllerFindAll(queryParams);
  return {
    data: (response?.items ?? []).map(mapPettyCashFundRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchPettyCashFundById(id: string): Promise<PettyCashFundRecord> {
  const response: any = await pettyCashFundControllerFindOne(id);
  return mapPettyCashFundRecordFromDto(response);
}

export async function fetchNextPettyCashFundNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(pettyCashFundControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createPettyCashFundApi(values: PettyCashFundFormValues): Promise<PettyCashFundRecord> {
  const payload = mapPettyCashFundFormValuesToCreateDto(values);
  const response: any = await pettyCashFundControllerCreate(payload);
  return mapPettyCashFundRecordFromDto(response);
}

export async function updatePettyCashFundApi(id: string, values: PettyCashFundFormValues): Promise<PettyCashFundRecord> {
  const payload = mapPettyCashFundFormValuesToUpdateDto(values);
  const response: any = await pettyCashFundControllerUpdate(id, payload);
  return mapPettyCashFundRecordFromDto(response);
}

export async function updatePettyCashFundStatusApi(id: string, status: PettyCashFundStatus): Promise<PettyCashFundRecord> {
  const apiStatus = StatusToApi[status];
  const response: any = await pettyCashFundControllerUpdateStatus(id, { status: apiStatus });
  return mapPettyCashFundRecordFromDto(response);
}

export async function deletePettyCashFundApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashFundControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchPettyCashFundPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePartyOptions();
}

export async function fetchPettyCashFundAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePostingAccountOptions();
}

export async function fetchPettyCashFundResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenanceResponsibilityCenterOptions();
}
