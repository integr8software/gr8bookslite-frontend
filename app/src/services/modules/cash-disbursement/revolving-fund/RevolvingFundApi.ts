"use client";

import {
  revolvingFundControllerCreate,
  revolvingFundControllerFindAll,
  revolvingFundControllerFindOne,
  revolvingFundControllerFindParties,
  revolvingFundControllerFindPostingAccounts,
  revolvingFundControllerFindResponsibilityCenters,
  revolvingFundControllerRemove,
  revolvingFundControllerSuggestTransactionNo,
  revolvingFundControllerUpdate,
  revolvingFundControllerUpdateStatus,
} from "@/app/src/generated/api/cash-disbursement-revolving-fund/cash-disbursement-revolving-fund";
import type {
  CreateRevolvingFundDto,
  RevolvingFundResponseDto,
  UpdateRevolvingFundDto,
  UpdateRevolvingFundStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  RevolvingFundFormValues,
  RevolvingFundItem,
  RevolvingFundRecord,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

export type FetchRevolvingFundListParams = {
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

export type FetchRevolvingFundListResponse = {
  data: RevolvingFundRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const StatusFromApi: Record<string, RevolvingFundStatus> = {
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  APPROVED: "For Approval",
  POSTED: "Posted",
  DISAPPROVED: "Disapproved",
  CANCELLED: "Cancelled",
};

export const StatusToApi: Record<RevolvingFundStatus, UpdateRevolvingFundStatusDtoStatus> = {
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
  Disapproved: "DISAPPROVED",
  Cancelled: "CANCELLED",
};

export function mapRevolvingFundRecordFromDto(dto: RevolvingFundResponseDto): RevolvingFundRecord {
  const items: RevolvingFundItem[] = (dto.details ?? []).map((d: any, index: number) => ({
    id: d.id ? String(d.id) : `item-${index + 1}`,
    date: d.itemDate ? d.itemDate.split("T")[0] : "",
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

  const formValues: RevolvingFundFormValues = {
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
    amount: typeof dto.amount === "number" ? dto.amount : Number(dto.amount ?? 0),
    remarks: dto.remarks ?? "",
    status: StatusFromApi[dto.status] ?? "Draft",
    createdBy: createdUser ? `${createdUser.firstName ?? ""} ${createdUser.lastName ?? ""}`.trim() : "",
    createdAt: dto.createdAt,
    updatedBy: updatedUser ? `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim() : "",
    updatedAt: dto.updatedAt,
    formValues,
  };
}

export function mapRevolvingFundFormValuesToCreateDto(values: RevolvingFundFormValues): CreateRevolvingFundDto {
  const details = (values.items ?? []).map((item, index) => ({
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

  const totalAmount = details.reduce((sum, d) => sum + (d.disburseAmount || d.grossAmount || 0), 0);

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
    status: values.status && values.status !== "Open" ? StatusToApi[values.status as RevolvingFundStatus] : "DRAFT",
    details,
  };
}

export function mapRevolvingFundFormValuesToUpdateDto(values: RevolvingFundFormValues): UpdateRevolvingFundDto {
  return mapRevolvingFundFormValuesToCreateDto(values) as UpdateRevolvingFundDto;
}

export async function fetchRevolvingFundList(params?: FetchRevolvingFundListParams): Promise<FetchRevolvingFundListResponse> {
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
    queryParams.status = StatusToApi[params.status as RevolvingFundStatus] ?? params.status;
  }

  const response: any = await revolvingFundControllerFindAll(queryParams);
  return {
    data: (response?.items ?? []).map(mapRevolvingFundRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchRevolvingFundById(id: string): Promise<RevolvingFundRecord> {
  const response: any = await revolvingFundControllerFindOne(id);
  return mapRevolvingFundRecordFromDto(response);
}

export async function fetchNextRevolvingFundNo(branchUnitId?: number): Promise<string> {
  const response: any = await revolvingFundControllerSuggestTransactionNo({ branchUnitId });
  return response?.nextTransNo ?? response?.transactionNo ?? "";
}

export async function createRevolvingFundApi(values: RevolvingFundFormValues): Promise<RevolvingFundRecord> {
  const payload = mapRevolvingFundFormValuesToCreateDto(values);
  const response: any = await revolvingFundControllerCreate(payload);
  return mapRevolvingFundRecordFromDto(response);
}

export async function updateRevolvingFundApi(id: string, values: RevolvingFundFormValues): Promise<RevolvingFundRecord> {
  const payload = mapRevolvingFundFormValuesToUpdateDto(values);
  const response: any = await revolvingFundControllerUpdate(id, payload);
  return mapRevolvingFundRecordFromDto(response);
}

export async function updateRevolvingFundStatusApi(id: string, status: RevolvingFundStatus): Promise<RevolvingFundRecord> {
  const apiStatus = StatusToApi[status];
  const response: any = await revolvingFundControllerUpdateStatus(id, { status: apiStatus });
  return mapRevolvingFundRecordFromDto(response);
}

export async function deleteRevolvingFundApi(id: string): Promise<{ success: boolean; message: string }> {
  await revolvingFundControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchRevolvingFundPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await revolvingFundControllerFindParties();
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

export async function fetchRevolvingFundAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await revolvingFundControllerFindPostingAccounts();
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

export async function fetchRevolvingFundResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await revolvingFundControllerFindResponsibilityCenters();
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
