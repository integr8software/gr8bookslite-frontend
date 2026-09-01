"use client";

import {
  revolvingFundReplenishmentControllerCreateV1 as revolvingFundReplenishmentControllerCreate,
  revolvingFundReplenishmentControllerFindAllV1 as revolvingFundReplenishmentControllerFindAll,
  revolvingFundReplenishmentControllerFindOneV1 as revolvingFundReplenishmentControllerFindOne,
  revolvingFundReplenishmentControllerRemoveV1 as revolvingFundReplenishmentControllerRemove,
  revolvingFundReplenishmentControllerSuggestTransactionNumberV1,
  revolvingFundReplenishmentControllerUpdateStatusV1 as revolvingFundReplenishmentControllerUpdateStatus,
  revolvingFundReplenishmentControllerUpdateV1 as revolvingFundReplenishmentControllerUpdate,
} from "@/app/src/generated/api/revolving-fund-replenishment/revolving-fund-replenishment";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
import type {
  CreateRevolvingFundReplenishmentDto,
  RevolvingFundReplenishmentResponseDto,
  UpdateRevolvingFundReplenishmentDto,
  UpdateRevolvingFundReplenishmentStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentFormValues,
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculateRevolvingFundReplenishmentTotals } from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";

export type FetchRevolvingFundReplenishmentListParams = {
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

export type FetchRevolvingFundReplenishmentListResponse = {
  data: RevolvingFundReplenishmentRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const StatusFromApi: Record<string, RevolvingFundReplenishmentStatus> = {
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  APPROVED: "For Approval",
  POSTED: "Posted",
  DISAPPROVED: "Disapproved",
  CANCELLED: "Cancelled",
};

export const StatusToApi: Record<RevolvingFundReplenishmentStatus, UpdateRevolvingFundReplenishmentStatusDtoStatus> = {
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
  Disapproved: "DISAPPROVED",
  Cancelled: "CANCELLED",
};

export function mapRevolvingFundReplenishmentRecordFromDto(dto: RevolvingFundReplenishmentResponseDto): RevolvingFundReplenishmentRecord {
  const entries: RevolvingFundReplenishmentEntry[] = (dto.details ?? []).map((d: any, index: number) => ({
    id: d.id ? String(d.id) : `entry-${index + 1}`,
    revolvingFundDate: d.revolvingFundDate ? d.revolvingFundDate.split("T")[0] : "",
    revolvingFundNo: d.revolvingFundNo ?? "",
    supplierCode: d.supplierCodeSnapshot ?? "",
    supplierName: d.supplierNameSnapshot ?? "",
    particulars: d.particulars ?? "",
    remarks: d.remarks ?? "",
    amount: String(d.amount ?? 0),
    netAmount: String(d.netAmount ?? 0),
    vatType: d.vatType ?? "",
    vatPercent: String(d.vatPercent ?? 0),
    vatAmount: String(d.vatAmount ?? 0),
    ewtCode: d.ewtCode ?? "",
    ewtPercent: String(d.ewtPercent ?? 0),
    ewtAmount: String(d.ewtAmount ?? 0),
    disburseAmount: String(d.disburseAmount ?? d.amount ?? 0),
    responsibilityCenterName: d.responsibilityCenterSnapshot ?? "",
    responsibilityCenterCode: d.responsibilityCenterCodeSnapshot ?? "",
  }));

  const formValues: RevolvingFundReplenishmentFormValues = {
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
    entries,
    attachments: [],
  };

  const createdUser = (dto as any).createdByUser;
  const updatedUser = (dto as any).updatedByUser;
  const totals = calculateRevolvingFundReplenishmentTotals(entries);

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
    amount: totals.totalAmount || (typeof dto.amount === "number" ? dto.amount : Number(dto.amount ?? 0)),
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

export function mapRevolvingFundReplenishmentFormValuesToCreateDto(values: RevolvingFundReplenishmentFormValues): CreateRevolvingFundReplenishmentDto {
  const entries = values.status === "Draft" ? (values.entries ?? []).filter(isRevolvingFundReplenishmentEntryPopulated) : (values.entries ?? []);
  const details = entries.map((item, index) => ({
    lineNumber: index + 1,
    revolvingFundDate: item.revolvingFundDate || undefined,
    revolvingFundNo: item.revolvingFundNo,
    supplierCode: item.supplierCode,
    supplierName: item.supplierName,
    particulars: item.particulars,
    remarks: item.remarks,
    amount: parseMoneyNumberInput(item.amount),
    netAmount: parseMoneyNumberInput(item.netAmount),
    vatType: item.vatType,
    vatPercent: parseMoneyNumberInput(item.vatPercent),
    vatAmount: parseMoneyNumberInput(item.vatAmount),
    ewtCode: item.ewtCode,
    ewtPercent: parseMoneyNumberInput(item.ewtPercent),
    ewtAmount: parseMoneyNumberInput(item.ewtAmount),
    disburseAmount: parseMoneyNumberInput(item.disburseAmount),
    responsibilityCenterCode: item.responsibilityCenterCode,
    responsibilityCenter: item.responsibilityCenterName,
  }));

  const totalAmount = details.reduce((sum, d) => sum + (d.amount || 0), 0);

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
    status: values.status && values.status !== "Open" ? StatusToApi[values.status as RevolvingFundReplenishmentStatus] : "DRAFT",
    details,
  };
}

function isRevolvingFundReplenishmentEntryPopulated(item: RevolvingFundReplenishmentEntry) {
  return Boolean(
    item.revolvingFundNo.trim() ||
      item.supplierCode.trim() ||
      item.supplierName.trim() ||
      item.particulars.trim() ||
      item.amount.trim() ||
      item.disburseAmount.trim(),
  );
}

export function mapRevolvingFundReplenishmentFormValuesToUpdateDto(values: RevolvingFundReplenishmentFormValues): UpdateRevolvingFundReplenishmentDto {
  return mapRevolvingFundReplenishmentFormValuesToCreateDto(values) as UpdateRevolvingFundReplenishmentDto;
}

export async function fetchRevolvingFundReplenishmentList(params?: FetchRevolvingFundReplenishmentListParams): Promise<FetchRevolvingFundReplenishmentListResponse> {
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
    queryParams.status = StatusToApi[params.status as RevolvingFundReplenishmentStatus] ?? params.status;
  }

  const response: any = await revolvingFundReplenishmentControllerFindAll(queryParams);
  return {
    data: (response?.items ?? []).map(mapRevolvingFundReplenishmentRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchRevolvingFundReplenishmentById(id: string): Promise<RevolvingFundReplenishmentRecord> {
  const response: any = await revolvingFundReplenishmentControllerFindOne(id);
  return mapRevolvingFundReplenishmentRecordFromDto(response);
}

export async function fetchNextRevolvingFundReplenishmentNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(revolvingFundReplenishmentControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createRevolvingFundReplenishmentApi(values: RevolvingFundReplenishmentFormValues): Promise<RevolvingFundReplenishmentRecord> {
  const payload = mapRevolvingFundReplenishmentFormValuesToCreateDto(values);
  const response: any = await revolvingFundReplenishmentControllerCreate(payload);
  return mapRevolvingFundReplenishmentRecordFromDto(response);
}

export async function updateRevolvingFundReplenishmentApi(id: string, values: RevolvingFundReplenishmentFormValues): Promise<RevolvingFundReplenishmentRecord> {
  const payload = mapRevolvingFundReplenishmentFormValuesToUpdateDto(values);
  const response: any = await revolvingFundReplenishmentControllerUpdate(id, payload);
  return mapRevolvingFundReplenishmentRecordFromDto(response);
}

export async function updateRevolvingFundReplenishmentStatusApi(id: string, status: RevolvingFundReplenishmentStatus): Promise<RevolvingFundReplenishmentRecord> {
  const apiStatus = StatusToApi[status];
  const response: any = await revolvingFundReplenishmentControllerUpdateStatus(id, { status: apiStatus });
  return mapRevolvingFundReplenishmentRecordFromDto(response);
}

export async function deleteRevolvingFundReplenishmentApi(id: string): Promise<{ success: boolean; message: string }> {
  await revolvingFundReplenishmentControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchRevolvingFundReplenishmentPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePartyOptions();
}

export async function fetchRevolvingFundReplenishmentAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePostingAccountOptions();
}

export async function fetchRevolvingFundReplenishmentResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenanceResponsibilityCenterOptions();
}
