"use client";

import {
  revolvingFundControllerCreateV1 as revolvingFundControllerCreate,
  revolvingFundControllerFindAllV1 as revolvingFundControllerFindAll,
  revolvingFundControllerFindOneV1 as revolvingFundControllerFindOne,
  revolvingFundControllerRemoveV1 as revolvingFundControllerRemove,
  revolvingFundControllerSuggestTransactionNumberV1,
  revolvingFundControllerUpdateStatusV1 as revolvingFundControllerUpdateStatus,
  revolvingFundControllerUpdateV1 as revolvingFundControllerUpdate,
} from "@/app/src/generated/api/revolving-fund/revolving-fund";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
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
import { calculateRevolvingFundTotals } from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";

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
  const totals = calculateRevolvingFundTotals(items);

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

export function mapRevolvingFundFormValuesToCreateDto(values: RevolvingFundFormValues): CreateRevolvingFundDto {
  const items = values.status === "Draft" ? (values.items ?? []).filter(isRevolvingFundItemPopulated) : (values.items ?? []);
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
    status: values.status && values.status !== "Open" ? StatusToApi[values.status as RevolvingFundStatus] : "DRAFT",
    details,
  };
}

function isRevolvingFundItemPopulated(item: RevolvingFundItem) {
  return Boolean(
    item.supplierCode.trim() ||
      item.supplierName.trim() ||
      item.particulars.trim() ||
      item.amount.trim() ||
      item.grossAmount.trim() ||
      item.disburseAmount.trim(),
  );
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
  return fetchTransactionNumber(revolvingFundControllerSuggestTransactionNumberV1, { branchUnitId });
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
  return fetchMaintenancePartyOptions();
}

export async function fetchRevolvingFundAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePostingAccountOptions();
}

export async function fetchRevolvingFundResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenanceResponsibilityCenterOptions();
}
