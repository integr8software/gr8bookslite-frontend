"use client";

import {
  advancesToSuppliersControllerCreate,
  advancesToSuppliersControllerFindAll,
  advancesToSuppliersControllerFindOne,
  advancesToSuppliersControllerFindParties,
  advancesToSuppliersControllerFindPostingAccounts,
  advancesToSuppliersControllerFindResponsibilityCenters,
  advancesToSuppliersControllerRemove,
  advancesToSuppliersControllerSubmitApproval,
  advancesToSuppliersControllerSuggestTransactionNo,
  advancesToSuppliersControllerUpdate,
  advancesToSuppliersControllerUpdateStatus,
} from "@/app/src/generated/api/cash-disbursement-advances-to-suppliers/cash-disbursement-advances-to-suppliers";
import type {
  AdvanceToSupplierResponseDto,
  CreateAdvanceToSupplierDto,
  CreateAdvanceToSupplierDtoAdvancePaymentType,
  CreateAdvanceToSupplierDtoStatus,
  UpdateAdvanceToSupplierDto,
  UpdateAdvanceToSupplierStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersPaymentType,
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type FetchAdvancesToSuppliersListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  partyCode?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type FetchAdvancesToSuppliersListResponse = {
  data: AdvancesToSuppliersRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const StatusFromApi: Record<string, AdvancesToSuppliersStatus> = {
  APPROVED: "Posted",
  CANCELLED: "Cancelled",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<AdvancesToSuppliersStatus, UpdateAdvanceToSupplierStatusDtoStatus> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
};

const PaymentTypeFromApi: Record<string, AdvancesToSuppliersPaymentType> = {
  FIXED_AMOUNT: "Fixed Amount",
  PERCENTAGE: "Percentage",
};

const PaymentTypeToApi: Record<AdvancesToSuppliersPaymentType, CreateAdvanceToSupplierDtoAdvancePaymentType> = {
  "Fixed Amount": "FIXED_AMOUNT",
  Percentage: "PERCENTAGE",
};

export async function fetchAdvancesToSuppliersList(
  params?: FetchAdvancesToSuppliersListParams,
): Promise<FetchAdvancesToSuppliersListResponse> {
  const response: any = await advancesToSuppliersControllerFindAll({
    ...params,
    status: params?.status && params.status !== "All" ? StatusToApi[params.status as AdvancesToSuppliersStatus] : undefined,
  });

  return {
    data: (response?.items ?? response?.data ?? []).map(mapAdvancesToSuppliersRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchAdvancesToSuppliersById(id: string): Promise<AdvancesToSuppliersRecord> {
  const response: any = await advancesToSuppliersControllerFindOne(id);
  return mapAdvancesToSuppliersRecordFromDto(response?.data ?? response);
}

export async function fetchNextAdvancesToSuppliersNumber(): Promise<string> {
  const response: any = await advancesToSuppliersControllerSuggestTransactionNo();
  return response?.nextTransactionNo ?? response?.transactionNo ?? "";
}

export async function createAdvancesToSuppliersApi(values: AdvancesToSuppliersFormValues): Promise<AdvancesToSuppliersRecord> {
  const response: any = await advancesToSuppliersControllerCreate(mapFormValuesToCreateDto(values));
  return mapAdvancesToSuppliersRecordFromDto(response?.data ?? response);
}

export async function updateAdvancesToSuppliersApi(id: string, values: AdvancesToSuppliersFormValues): Promise<AdvancesToSuppliersRecord> {
  const response: any = await advancesToSuppliersControllerUpdate(id, mapFormValuesToCreateDto(values) as UpdateAdvanceToSupplierDto);
  return mapAdvancesToSuppliersRecordFromDto(response?.data ?? response);
}

export async function submitAdvancesToSuppliersApprovalApi(id: string): Promise<AdvancesToSuppliersRecord> {
  const response: any = await advancesToSuppliersControllerSubmitApproval(id);
  return mapAdvancesToSuppliersRecordFromDto(response?.data ?? response);
}

export async function updateAdvancesToSuppliersStatusApi(
  id: string,
  status: AdvancesToSuppliersStatus,
): Promise<AdvancesToSuppliersRecord> {
  const response: any = await advancesToSuppliersControllerUpdateStatus(id, { status: StatusToApi[status] });
  return mapAdvancesToSuppliersRecordFromDto(response?.data ?? response);
}

export async function deleteAdvancesToSuppliersApi(id: string): Promise<{ success: boolean; message: string }> {
  await advancesToSuppliersControllerRemove(id);
  return { success: true, message: "Deleted successfully" };
}

export async function fetchAdvancesToSuppliersPartyOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await advancesToSuppliersControllerFindParties();
  return (response?.parties ?? response?.options ?? []).map((party: any) => ({
    name: party.partyName || party.name,
    label: party.partyCode || party.label,
    value: party.partyCode || party.value,
    description: party.partyName || party.name,
    partyId: party.partyId || party.id,
    partyCode: party.partyCode,
    partyName: party.partyName || party.name,
  }));
}

export async function fetchAdvancesToSuppliersAccountOptions(): Promise<AppAdvancedDropdownOption[]> {
  const response: any = await advancesToSuppliersControllerFindPostingAccounts();
  const accounts = response?.accounts ?? response?.options ?? [];
  const supplierAdvanceAccounts = accounts.filter((account: any) => {
    const title = String(account.accountTitle ?? account.name ?? "").toLowerCase();
    return title.includes("advance") || title.includes("supplier") || title.includes("deposit");
  });
  const finalAccounts = supplierAdvanceAccounts.length > 0 ? supplierAdvanceAccounts : accounts;

  return finalAccounts.map((account: any) => ({
    name: account.accountTitle || account.name,
    label: account.accountCode || account.label,
    value: account.accountCode || account.value,
    description: account.accountTitle || account.name,
    accountId: account.accountId || account.id,
    accountCode: account.accountCode,
    accountTitle: account.accountTitle || account.name,
  }));
}

export async function fetchAdvancesToSuppliersResponsibilityCenters(): Promise<{
  responsibilityCenters: AppAdvancedDropdownOption[];
  projects: AppAdvancedDropdownOption[];
}> {
  const response: any = await advancesToSuppliersControllerFindResponsibilityCenters();
  const centers = response?.responsibilityCenters ?? response?.options ?? [];
  const isProject = (center: any) =>
    String(center.category ?? "").toLowerCase() === "project" ||
    String(center.typeName ?? "")
      .toLowerCase()
      .includes("project") ||
    String(center.name ?? "")
      .toLowerCase()
      .includes("project");

  return {
    responsibilityCenters: centers.filter((center: any) => !isProject(center)).map(mapResponsibilityCenterOption),
    projects: centers.filter((center: any) => isProject(center)).map(mapResponsibilityCenterOption),
  };
}

function mapFormValuesToCreateDto(values: AdvancesToSuppliersFormValues): CreateAdvanceToSupplierDto {
  return {
    partyId: values.partyId,
    partyCode: values.partyCode,
    partyName: values.partyName,
    creditAccountId: values.accountId,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    responsibilityCenter: values.responsibilityCenter,
    responsibilityCenterCode: values.responsibilityCenterCode,
    projectName: values.projectName,
    projectCode: values.projectCode,
    currency: values.currency || "PHP",
    exchangeRate: values.exchangeRate || "1.00",
    poReference: values.poReference,
    totalPoAmount: String(parseMoneyNumberInput(values.totalPoAmount)),
    advancePaymentType: PaymentTypeToApi[values.advancePaymentType],
    advancePaymentPercentage: String(parseMoneyNumberInput(values.advancePaymentPercentage)),
    advancePaymentAmount: String(parseMoneyNumberInput(values.advancePaymentAmount)),
    documentDate: values.documentDate,
    transactionNo: values.transactionNo,
    remarks: values.remarks,
    status:
      values.status && values.status !== "Open"
        ? (StatusToApi[values.status as AdvancesToSuppliersStatus] as CreateAdvanceToSupplierDtoStatus)
        : "DRAFT",
  };
}

function mapAdvancesToSuppliersRecordFromDto(dto: AdvanceToSupplierResponseDto): AdvancesToSuppliersRecord {
  const status = StatusFromApi[dto.status] ?? "Draft";
  const paymentType = PaymentTypeFromApi[dto.advancePaymentType] ?? "Percentage";
  const exchangeRate = dto.exchangeRate !== undefined && dto.exchangeRate !== null ? String(dto.exchangeRate) : "1.00";

  return {
    id: dto.id,
    transactionNo: dto.transactionNo,
    documentDate: dto.documentDate,
    partyId: dto.partyId ?? undefined,
    partyCode: dto.partyCode,
    partyName: dto.partyName,
    accountCode: dto.accountCode,
    accountTitle: dto.accountTitle ?? "",
    responsibilityCenter: dto.responsibilityCenter ?? "",
    responsibilityCenterCode: dto.responsibilityCenterCode ?? "",
    projectCode: dto.projectCode ?? "",
    projectName: dto.projectName ?? "",
    currency: dto.currency,
    exchangeRate,
    poReference: dto.poReference,
    totalPoAmount: Number(dto.totalPoAmount ?? 0),
    advancePaymentType: paymentType,
    advancePaymentPercentage: Number(dto.advancePaymentPercentage ?? 0),
    amount: Number(dto.amount ?? 0),
    remarks: dto.remarks ?? "",
    status,
    createdBy: dto.createdBy ?? "",
    createdAt: dto.createdAt,
    updatedBy: dto.updatedBy ?? "",
    updatedAt: dto.updatedAt ?? "",
  };
}

function mapResponsibilityCenterOption(center: any): AppAdvancedDropdownOption {
  return {
    name: center.name,
    label: center.code || center.label,
    value: center.code || center.value,
    description: center.name,
  };
}
