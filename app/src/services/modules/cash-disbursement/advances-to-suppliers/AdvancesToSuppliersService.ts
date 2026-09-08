"use client";

import {
  advancesToSuppliersControllerCreateV1,
  advancesToSuppliersControllerFindAllV1,
  advancesToSuppliersControllerFindOneV1,
  advancesToSuppliersControllerRemoveV1,
  advancesToSuppliersControllerSubmitApprovalV1,
  advancesToSuppliersControllerSuggestTransactionNumberV1,
  advancesToSuppliersControllerUpdateStatusV1,
  advancesToSuppliersControllerUpdateV1,
} from "@/app/src/generated/api/advances-to-suppliers/advances-to-suppliers";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import type {
  AdvanceToSupplierResponseDto,
  AdvanceToSupplierListResponseDto,
  AdvancesToSuppliersControllerFindAllV1Params,
  CreateAdvanceToSupplierDto,
  CreateAdvanceToSupplierDtoAdvancePaymentType,
  CreateAdvanceToSupplierDtoStatus,
  UpdateAdvanceToSupplierDto,
  UpdateAdvanceToSupplierStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { cleanQueryParams } from "@/app/src/utils/query.util";
import type {
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersPaymentType,
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";

type FetchAdvancesToSuppliersListParams = AdvancesToSuppliersControllerFindAllV1Params;
export type AdvanceToSupplierCopyFromCandidate = {
  amount: number;
  availableAmount: number;
  availableGrossAmount: number;
  branchUnitId?: number | null;
  consumedAmount: number;
  consumedGrossAmount: number;
  currency: string;
  details: Array<{
    accountCode?: string | null;
    accountTitle?: string | null;
    amount: number;
    consumptionAmount: number;
    grossAmount: number;
    id: string;
    lineNumber: number;
    particulars?: string | null;
    referenceNo?: string | null;
    responsibilityCenter?: string | null;
  }>;
  documentDate: string;
  exchangeRate: number;
  grossAmount: number;
  id: string;
  partyCode: string;
  partyId?: string | null;
  partyName: string;
  poReference?: string | null;
  projectCode?: string | null;
  projectName?: string | null;
  remarks?: string | null;
  source: "Advances to Suppliers";
  sourceNo: string;
  transactionNo: string;
};
type MappedAdvancesToSuppliersListResponse = Omit<AdvanceToSupplierListResponseDto, "items"> & {
  data: AdvancesToSuppliersRecord[];
};

type AdvancesToSuppliersListApiResponse = {
  data?: AdvanceToSupplierResponseDto[];
  items?: AdvanceToSupplierResponseDto[];
  meta?: MappedAdvancesToSuppliersListResponse["meta"];
};

type AdvancesToSuppliersApiResponse =
  | AdvanceToSupplierResponseDto
  | {
      data?: AdvanceToSupplierResponseDto;
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
): Promise<MappedAdvancesToSuppliersListResponse> {
  const response = (await advancesToSuppliersControllerFindAllV1({
    ...params,
    status: params?.status && params.status !== "All" ? StatusToApi[params.status as AdvancesToSuppliersStatus] : undefined,
  })) as AdvanceToSupplierListResponseDto & AdvancesToSuppliersListApiResponse;

  return {
    data: (response.items ?? response.data ?? []).map(mapAdvancesToSuppliersRecordFromDto),
    meta: response?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchAdvancesToSuppliersById(id: string): Promise<AdvancesToSuppliersRecord> {
  const response = (await advancesToSuppliersControllerFindOneV1(id)) as AdvancesToSuppliersApiResponse;
  return mapAdvancesToSuppliersRecordFromDto(unwrapAdvancesToSuppliersResponse(response));
}

export async function fetchNextAdvancesToSuppliersNumber(): Promise<string> {
  return fetchTransactionNumber(advancesToSuppliersControllerSuggestTransactionNumberV1);
}

export async function fetchAdvanceToSupplierCopyFromCandidates(query: {
  branchUnitId?: number | null;
  limit?: number;
  page?: number;
  partyCode?: string | null;
  partyId?: string | null;
  search?: string | null;
  target: "cash-voucher" | "disbursement-voucher";
}): Promise<AdvanceToSupplierCopyFromCandidate[]> {
  const response = await ApiClient.get<{ records: AdvanceToSupplierCopyFromCandidate[] }>(
    "/cash-disbursement/advances-to-suppliers/copy-from/candidates",
    {
      params: cleanQueryParams({
        branchUnitId: query.branchUnitId,
        limit: query.limit ?? 100,
        page: query.page ?? 1,
        partyCode: query.partyCode,
        partyId: query.partyId,
        search: query.search,
        target: query.target,
      }),
    },
  );

  return response.data.records;
}

export async function createAdvancesToSuppliersApi(values: AdvancesToSuppliersFormValues): Promise<AdvancesToSuppliersRecord> {
  const response = (await advancesToSuppliersControllerCreateV1(mapFormValuesToCreateDto(values))) as AdvancesToSuppliersApiResponse;
  return mapAdvancesToSuppliersRecordFromDto(unwrapAdvancesToSuppliersResponse(response));
}

export async function updateAdvancesToSuppliersApi(id: string, values: AdvancesToSuppliersFormValues): Promise<AdvancesToSuppliersRecord> {
  const response = (await advancesToSuppliersControllerUpdateV1(
    id,
    mapFormValuesToCreateDto(values) as UpdateAdvanceToSupplierDto,
  )) as AdvancesToSuppliersApiResponse;
  return mapAdvancesToSuppliersRecordFromDto(unwrapAdvancesToSuppliersResponse(response));
}

export async function submitAdvancesToSuppliersApprovalApi(id: string): Promise<AdvancesToSuppliersRecord> {
  const response = (await advancesToSuppliersControllerSubmitApprovalV1(id)) as AdvancesToSuppliersApiResponse;
  return mapAdvancesToSuppliersRecordFromDto(unwrapAdvancesToSuppliersResponse(response));
}

export async function updateAdvancesToSuppliersStatusApi(
  id: string,
  status: AdvancesToSuppliersStatus,
): Promise<AdvancesToSuppliersRecord> {
  const response = (await advancesToSuppliersControllerUpdateStatusV1(id, {
    status: StatusToApi[status],
  })) as AdvancesToSuppliersApiResponse;
  return mapAdvancesToSuppliersRecordFromDto(unwrapAdvancesToSuppliersResponse(response));
}

export async function deleteAdvancesToSuppliersApi(id: string): Promise<{ success: boolean; message: string }> {
  await advancesToSuppliersControllerRemoveV1(id);
  return { success: true, message: "Deleted successfully" };
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

function unwrapAdvancesToSuppliersResponse(response: AdvancesToSuppliersApiResponse): AdvanceToSupplierResponseDto {
  return "data" in response && response.data ? response.data : (response as AdvanceToSupplierResponseDto);
}
