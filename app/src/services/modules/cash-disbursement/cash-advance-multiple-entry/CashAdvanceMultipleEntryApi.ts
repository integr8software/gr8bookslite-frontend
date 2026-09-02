import {
  cashAdvanceMultipleEntryControllerCreateV1,
  cashAdvanceMultipleEntryControllerFindAllV1,
  cashAdvanceMultipleEntryControllerFindOneV1,
  cashAdvanceMultipleEntryControllerRemoveV1,
  cashAdvanceMultipleEntryControllerSuggestTransactionNumberV1,
  cashAdvanceMultipleEntryControllerUpdateStatusV1,
  cashAdvanceMultipleEntryControllerUpdateV1,
} from "@/app/src/generated/api/cash-advance-multiple-entry/cash-advance-multiple-entry";
import type {
  CreateCashAdvanceMultipleEntryDto,
  CreateCashAdvanceMultipleEntryDtoStatus,
  UpdateCashAdvanceMultipleEntryDto,
  UpdateCashAdvanceMultipleEntryDtoStatus,
  UpdateCashAdvanceMultipleEntryStatusDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryRecord,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";

type ApiCashAdvanceStatus =
  | CreateCashAdvanceMultipleEntryDtoStatus
  | UpdateCashAdvanceMultipleEntryDtoStatus
  | UpdateCashAdvanceMultipleEntryStatusDtoStatus
  | string;

type CashAdvanceMultipleEntryApiOptions = {
  branchUnitId?: number;
};

type CashAdvanceMultipleEntryListResponseDto = {
  data: CashAdvanceMultipleEntryRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function fetchCashAdvanceMultipleEntryList(): Promise<CashAdvanceMultipleEntryListResponseDto> {
  const response = (await cashAdvanceMultipleEntryControllerFindAllV1()) as unknown as CashAdvanceMultipleEntryListResponseDto;

  return {
    ...response,
    data: response.data.map(mapCashAdvanceMultipleEntryRecordFromApi),
  };
}

export async function fetchCashAdvanceMultipleEntryById(id: string): Promise<CashAdvanceMultipleEntryRecord> {
  const response = (await cashAdvanceMultipleEntryControllerFindOneV1(id)) as unknown as { data: CashAdvanceMultipleEntryRecord };
  return mapCashAdvanceMultipleEntryRecordFromApi(response.data);
}

export async function fetchNextCashAdvanceMultipleEntryTransactionNo(branchUnitId?: number): Promise<string> {
  return fetchTransactionNumber(cashAdvanceMultipleEntryControllerSuggestTransactionNumberV1, { branchUnitId });
}

export async function createCashAdvanceMultipleEntryApi(
  values: CashAdvanceMultipleEntryFormValues,
  options?: CashAdvanceMultipleEntryApiOptions,
): Promise<CashAdvanceMultipleEntryRecord> {
  const response = (await cashAdvanceMultipleEntryControllerCreateV1(
    mapCashAdvanceMultipleEntryValuesToApi(values, options) as CreateCashAdvanceMultipleEntryDto,
  )) as unknown as { data: CashAdvanceMultipleEntryRecord };
  return mapCashAdvanceMultipleEntryRecordFromApi(response.data);
}

export async function updateCashAdvanceMultipleEntryApi(
  id: string,
  values: CashAdvanceMultipleEntryFormValues,
  options?: CashAdvanceMultipleEntryApiOptions,
): Promise<CashAdvanceMultipleEntryRecord> {
  const response = (await cashAdvanceMultipleEntryControllerUpdateV1(
    id,
    mapCashAdvanceMultipleEntryValuesToApi(values, options) as UpdateCashAdvanceMultipleEntryDto,
  )) as unknown as { data: CashAdvanceMultipleEntryRecord };
  return mapCashAdvanceMultipleEntryRecordFromApi(response.data);
}

export async function updateCashAdvanceMultipleEntryStatusApi(
  id: string,
  status: CashAdvanceStatus,
): Promise<CashAdvanceMultipleEntryRecord> {
  const response = (await cashAdvanceMultipleEntryControllerUpdateStatusV1(id, {
    status: mapCashAdvanceStatusToApi(status) as UpdateCashAdvanceMultipleEntryStatusDtoStatus,
  })) as unknown as { data: CashAdvanceMultipleEntryRecord };
  return mapCashAdvanceMultipleEntryRecordFromApi(response.data);
}

export async function deleteCashAdvanceMultipleEntryApi(id: string): Promise<void> {
  await cashAdvanceMultipleEntryControllerRemoveV1(id);
}

function mapCashAdvanceMultipleEntryValuesToApi(values: CashAdvanceMultipleEntryFormValues, options?: CashAdvanceMultipleEntryApiOptions) {
  return {
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    accountingEntries: values.accountingEntries,
    branchUnitId: options?.branchUnitId,
    costCenter: values.costCenter,
    currency: values.currency,
    documentDate: values.documentDate,
    exchangeRate: values.exchangeRate,
    items: values.items.filter((item) => item.partyCode.trim() || item.partyName.trim() || item.amount.trim()),
    partyCode: values.partyCode,
    partyName: values.partyName,
    projectCode: values.projectCode,
    projectName: values.projectName,
    projectRef: values.projectName,
    remarks: values.remarks,
    status: mapCashAdvanceStatusToApi(values.status) as CreateCashAdvanceMultipleEntryDtoStatus | UpdateCashAdvanceMultipleEntryDtoStatus,
    transNo: values.transNo,
  };
}

function mapCashAdvanceMultipleEntryRecordFromApi(record: CashAdvanceMultipleEntryRecord): CashAdvanceMultipleEntryRecord {
  return {
    ...record,
    currency: record.currency ?? record.formValues?.currency ?? "PHP",
    exchangeRate: record.exchangeRate ?? record.formValues?.exchangeRate ?? "1.00",
    projectName: record.projectName ?? record.projectRef ?? "",
    projectRef: record.projectName ?? record.projectRef ?? "",
    formValues: record.formValues
      ? {
          ...record.formValues,
          projectName: record.formValues.projectName ?? record.formValues.projectRef ?? "",
          projectRef: record.formValues.projectName ?? record.formValues.projectRef ?? "",
          status: mapCashAdvanceStatusFromApi(record.formValues.status),
        }
      : record.formValues,
    status: mapCashAdvanceStatusFromApi(record.status),
  };
}

function mapCashAdvanceStatusFromApi(status: string): CashAdvanceStatus {
  const statusMap: Record<string, CashAdvanceStatus> = {
    APPROVED: "Posted",
    CANCELLED: "Cancelled",
    DISAPPROVED: "Disapproved",
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
  };

  return statusMap[status] ?? (status as CashAdvanceStatus);
}

function mapCashAdvanceStatusToApi(status: string): ApiCashAdvanceStatus {
  const statusMap: Record<string, ApiCashAdvanceStatus> = {
    Cancelled: "CANCELLED",
    Disapproved: "DISAPPROVED",
    Draft: "DRAFT",
    "For Approval": "FOR_APPROVAL",
    Open: "DRAFT",
    Posted: "POSTED",
  };

  return statusMap[status] ?? (status as ApiCashAdvanceStatus);
}
