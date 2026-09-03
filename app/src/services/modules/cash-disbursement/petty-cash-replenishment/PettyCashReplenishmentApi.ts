"use client";

import {
  pettyCashReplenishmentControllerCreateV1 as pettyCashReplenishmentControllerCreate,
  pettyCashReplenishmentControllerFindAllV1 as pettyCashReplenishmentControllerFindAll,
  pettyCashReplenishmentControllerFindOneV1 as pettyCashReplenishmentControllerFindOne,
  pettyCashReplenishmentControllerRemoveV1 as pettyCashReplenishmentControllerRemove,
  pettyCashReplenishmentControllerSuggestTransactionNumberV1,
  pettyCashReplenishmentControllerUpdateStatusV1 as pettyCashReplenishmentControllerUpdateStatus,
  pettyCashReplenishmentControllerUpdateV1 as pettyCashReplenishmentControllerUpdate,
} from "@/app/src/generated/api/petty-cash-replenishment/petty-cash-replenishment";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import {
  fetchMaintenancePartyOptions,
  fetchMaintenancePostingAccountOptions,
  fetchMaintenanceResponsibilityCenterOptions,
} from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
import { PettyCashReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import type {
  CreatePettyCashReplenishmentDto,
  PettyCashReplenishmentListResponseDto,
  PettyCashReplenishmentResponseDto,
  UpdatePettyCashReplenishmentDto,
  UpdatePettyCashReplenishmentStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormValues,
  PettyCashReplenishmentRecord,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculatePettyCashReplenishmentTotals } from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";

type AuditUserSnapshot = {
  firstName?: string | null;
  lastName?: string | null;
};

type PettyCashReplenishmentResponseExtras = {
  createdByUser?: AuditUserSnapshot | null;
  disburseAmount?: number | string | null;
  updatedByUser?: AuditUserSnapshot | null;
};

type PettyCashReplenishmentQueryParams = NonNullable<Parameters<typeof pettyCashReplenishmentControllerFindAll>[0]>;

export type FetchPettyCashReplenishmentListParams = {
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

type MappedPettyCashReplenishmentListResponse = Omit<PettyCashReplenishmentListResponseDto, "items"> & {
  data: PettyCashReplenishmentRecord[];
};

export const StatusFromApi: Record<string, PettyCashReplenishmentStatus> = {
  DRAFT: PettyCashReplenishmentStatuses.Draft,
  FOR_APPROVAL: "For Approval",
  APPROVED: "For Approval",
  POSTED: "Posted",
  DISAPPROVED: "Disapproved",
  CANCELLED: "Cancelled",
};

export const StatusToApi: Record<PettyCashReplenishmentStatus, UpdatePettyCashReplenishmentStatusDtoStatus> = {
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
  Disapproved: "DISAPPROVED",
  Cancelled: "CANCELLED",
};

export function mapPettyCashReplenishmentRecordFromDto(dto: PettyCashReplenishmentResponseDto): PettyCashReplenishmentRecord {
  const dtoExtras = dto as PettyCashReplenishmentResponseDto & PettyCashReplenishmentResponseExtras;
  const entries: PettyCashReplenishmentEntry[] = (dto.details ?? []).map((d, index) => ({
    id: d.id ? String(d.id) : `entry-${index + 1}`,
    pettyCashDate: d.pettyCashDate ? d.pettyCashDate.split("T")[0] : "",
    pettyCashNo: d.pettyCashNo ?? "",
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

  const formValues: PettyCashReplenishmentFormValues = {
    transactionNo: dto.transactionNo,
    documentDate: dto.documentDate,
    status: StatusFromApi[dto.status] ?? PettyCashReplenishmentStatuses.Draft,
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

  const createdUser = dtoExtras.createdByUser;
  const updatedUser = dtoExtras.updatedByUser;
  const totals = calculatePettyCashReplenishmentTotals(entries);

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
    disburseAmount: totals.disburseAmount || Number(dtoExtras.disburseAmount ?? dto.amount ?? 0),
    remarks: dto.remarks ?? "",
    status: StatusFromApi[dto.status] ?? PettyCashReplenishmentStatuses.Draft,
    createdBy: createdUser ? `${createdUser.firstName ?? ""} ${createdUser.lastName ?? ""}`.trim() : "",
    createdAt: dto.createdAt,
    updatedBy: updatedUser ? `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim() : "",
    updatedAt: dto.updatedAt,
    formValues,
  };
}

export function mapPettyCashReplenishmentFormValuesToCreateDto(values: PettyCashReplenishmentFormValues): CreatePettyCashReplenishmentDto {
  const entries =
    values.status === PettyCashReplenishmentStatuses.Draft
      ? (values.entries ?? []).filter(isPettyCashReplenishmentEntryPopulated)
      : (values.entries ?? []);
  const details = entries.map((item, index) => ({
    lineNumber: index + 1,
    pettyCashDate: item.pettyCashDate || undefined,
    pettyCashNo: item.pettyCashNo,
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
    status: values.status && values.status !== "Open" ? StatusToApi[values.status as PettyCashReplenishmentStatus] : "DRAFT",
    details,
  };
}

function isPettyCashReplenishmentEntryPopulated(item: PettyCashReplenishmentEntry) {
  return Boolean(
    item.pettyCashNo.trim() ||
      item.supplierCode.trim() ||
      item.supplierName.trim() ||
      item.particulars.trim() ||
      item.amount.trim() ||
      item.disburseAmount.trim(),
  );
}

export function mapPettyCashReplenishmentFormValuesToUpdateDto(values: PettyCashReplenishmentFormValues): UpdatePettyCashReplenishmentDto {
  return mapPettyCashReplenishmentFormValuesToCreateDto(values) as UpdatePettyCashReplenishmentDto;
}

export async function fetchPettyCashReplenishmentList(
  params?: FetchPettyCashReplenishmentListParams,
): Promise<MappedPettyCashReplenishmentListResponse> {
  const queryParams: PettyCashReplenishmentQueryParams = {
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
    queryParams.status = (StatusToApi[params.status as PettyCashReplenishmentStatus] ??
      params.status) as PettyCashReplenishmentQueryParams["status"];
  }

  const response = (await pettyCashReplenishmentControllerFindAll(queryParams)) as PettyCashReplenishmentListResponseDto;
  return {
    data: (response?.items ?? []).map(mapPettyCashReplenishmentRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

export async function fetchPettyCashReplenishmentById(id: string): Promise<PettyCashReplenishmentRecord> {
  const response = (await pettyCashReplenishmentControllerFindOne(id)) as PettyCashReplenishmentResponseDto;
  return mapPettyCashReplenishmentRecordFromDto(response);
}

export async function fetchNextPettyCashReplenishmentNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(pettyCashReplenishmentControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createPettyCashReplenishmentApi(values: PettyCashReplenishmentFormValues): Promise<PettyCashReplenishmentRecord> {
  const payload = mapPettyCashReplenishmentFormValuesToCreateDto(values);
  const response = (await pettyCashReplenishmentControllerCreate(payload)) as PettyCashReplenishmentResponseDto;
  return mapPettyCashReplenishmentRecordFromDto(response);
}

export async function updatePettyCashReplenishmentApi(id: string, values: PettyCashReplenishmentFormValues): Promise<PettyCashReplenishmentRecord> {
  const payload = mapPettyCashReplenishmentFormValuesToUpdateDto(values);
  const response = (await pettyCashReplenishmentControllerUpdate(id, payload)) as PettyCashReplenishmentResponseDto;
  return mapPettyCashReplenishmentRecordFromDto(response);
}

export async function updatePettyCashReplenishmentStatusApi(id: string, status: PettyCashReplenishmentStatus): Promise<PettyCashReplenishmentRecord> {
  const apiStatus = StatusToApi[status];
  const response = (await pettyCashReplenishmentControllerUpdateStatus(id, { status: apiStatus })) as PettyCashReplenishmentResponseDto;
  return mapPettyCashReplenishmentRecordFromDto(response);
}

export async function deletePettyCashReplenishmentApi(id: string): Promise<{ success: boolean; message: string }> {
  await pettyCashReplenishmentControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchPettyCashReplenishmentPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePartyOptions();
}

export async function fetchPettyCashReplenishmentAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenancePostingAccountOptions();
}

export async function fetchPettyCashReplenishmentResponsibilityCenters(): Promise<AppAdvancedDropdownOption[]> {
  return fetchMaintenanceResponsibilityCenterOptions();
}
