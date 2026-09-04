import {
  cashVoucherControllerCreateV1,
  cashVoucherControllerFindAllV1,
  cashVoucherControllerFindOneV1,
  cashVoucherControllerRemoveV1,
  cashVoucherControllerSuggestTransactionNumberV1,
  cashVoucherControllerUpdatePutV1,
  cashVoucherControllerUpdateStatusV1,
} from "@/app/src/generated/api/cash-voucher/cash-voucher";
import type {
  CashVoucherControllerFindAllV1Params,
  CashVoucherListResponseDto,
  CashVoucherRecordResponseDto,
  CashVoucherSingleResponseDto,
  CreateCashVoucherDto,
  CreateCashVoucherDtoStatus,
  UpdateCashVoucherDto,
  UpdateCashVoucherDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { fetchTransactionNumber } from "@/app/src/services/shared/transaction-number/TransactionNumberApi";
import type {
  CashVoucherLineEntry,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

type ApiCashVoucherStatus = CreateCashVoucherDtoStatus | UpdateCashVoucherDtoStatus | string;
type ApiCashVoucherLineAmountSource = CashVoucherLineEntry & {
  accountTitle?: string;
  disburseAmount?: number;
  grossAmount?: number;
  ewtPercent?: number;
  vatPercent?: number;
};

type FetchCashVoucherListParams = CashVoucherControllerFindAllV1Params;
type FetchCashVoucherListResponse = Omit<CashVoucherListResponseDto, "data"> & { data: CashVoucherRecord[] };

export async function fetchCashVoucherList(params?: FetchCashVoucherListParams): Promise<FetchCashVoucherListResponse> {
  const response = await cashVoucherControllerFindAllV1({
    ...params,
    status:
      params?.status && params.status !== "all" && params.status !== "All"
        ? mapCashVoucherStatusToApi(params.status)
        : undefined,
  });

  return {
    ...response,
    data: response.data.map(mapCashVoucherRecordFromApi),
  };
}

export async function fetchCashVoucherById(id: string): Promise<CashVoucherRecord> {
  const response = await cashVoucherControllerFindOneV1(id);
  return mapCashVoucherResponseFromApi(response);
}

export async function fetchNextCashVoucherTransactionNo(): Promise<string> {
  return fetchTransactionNumber(cashVoucherControllerSuggestTransactionNumberV1);
}

export async function createCashVoucherApi(payload: {
  branchUnitId?: number;
  partyId?: string;
  partyCode: string;
  partyName: string;
  creditAccountId?: string;
  voucherNo?: string;
  voucherDate: string;
  paymentDueDate?: string;
  referenceNo?: string;
  referenceModule?: string;
  voucherReferenceNo?: string;
  invoiceReferenceNo?: string;
  paymentMethod?: string;
  disbursementType?: string;
  costCenter?: string;
  projectCode?: string;
  projectName?: string;
  preparedBy?: string;
  currency?: string;
  fxRate?: string | number;
  amount?: string | number;
  remarks?: string;
  status?: CashVoucherStatus;
  details: CashVoucherLineEntry[];
}): Promise<CashVoucherRecord> {
  const details = getCashVoucherPayloadDetails(payload.details, payload.status);
  const transformedPayload: CreateCashVoucherDto = {
    ...payload,
    amount: payload.amount === undefined ? undefined : Number(payload.amount),
    details: details.map((detail, index) => ({
      id: detail.id,
      lineNumber: index + 1,
      accountCode: detail.accountCode,
      accountTitle: detail.accountName,
      particulars: detail.particulars || detail.remarks || "",
      remarks: detail.remarks || detail.particulars || "",
      debit: detail.debit,
      credit: detail.credit,
      grossAmount: detail.taxDetails?.grossAmount ?? detail.debit,
      netAmount: detail.taxDetails?.netAmount ?? detail.debit,
      vatType: detail.taxDetails?.vatType ?? detail.vatType ?? "",
      vatCode: detail.taxDetails?.vatCode ?? "",
      vatPercent: detail.taxDetails?.vatPercent ?? 0,
      vatAmount: detail.taxDetails?.vatAmount ?? 0,
      ewtCode: detail.taxDetails?.ewtCode ?? detail.ewtCode ?? "",
      ewtPercent: detail.taxDetails?.ewtPercent ?? 0,
      ewtAmount: detail.taxDetails?.ewtAmount ?? 0,
      disburseAmount: detail.taxDetails?.amount ?? detail.debit,
      partyCode: detail.partyCode || payload.partyCode,
      partyName: detail.partyName || payload.partyName,
      responsibilityCenter: detail.responsibilityCenter || payload.projectCode || payload.costCenter || "",
      refId: detail.refId || payload.voucherReferenceNo || payload.voucherNo || "",
      checkDate: cleanOptional(detail.checkDate),
      checkNo: detail.checkNo,
      checkStatus: detail.checkStatus,
    })),
    fxRate: payload.fxRate === undefined ? undefined : Number(payload.fxRate),
    status: payload.status ? (mapCashVoucherStatusToApi(payload.status) as CreateCashVoucherDtoStatus) : undefined,
  };

  const response = await cashVoucherControllerCreateV1(transformedPayload);
  return mapCashVoucherResponseFromApi(response);
}

export async function updateCashVoucherApi(
  id: string,
  payload: Partial<{
    branchUnitId?: number;
    partyId?: string;
    partyCode: string;
    partyName: string;
    creditAccountId?: string;
    voucherDate: string;
    paymentDueDate?: string;
    referenceNo?: string;
    referenceModule?: string;
    voucherReferenceNo?: string;
    invoiceReferenceNo?: string;
    paymentMethod?: string;
    disbursementType?: string;
    costCenter?: string;
    projectCode?: string;
    projectName?: string;
    preparedBy?: string;
    currency?: string;
    fxRate?: string | number;
    amount?: string | number;
    remarks?: string;
    status?: CashVoucherStatus;
    details?: CashVoucherLineEntry[];
  }>,
): Promise<CashVoucherRecord> {
  const details = payload.details ? getCashVoucherPayloadDetails(payload.details, payload.status) : undefined;
  const { details: _frontendDetails, ...payloadWithoutDetails } = payload;
  void _frontendDetails;
  const transformedPayload: UpdateCashVoucherDto = {
    ...payloadWithoutDetails,
    amount: payload.amount === undefined ? undefined : Number(payload.amount),
    ...(details
      ? {
          details: details.map((detail, index) => ({
            id: detail.id,
            lineNumber: index + 1,
            accountCode: detail.accountCode,
            accountTitle: detail.accountName,
            particulars: detail.particulars || detail.remarks || "",
            remarks: detail.remarks || detail.particulars || "",
            debit: detail.debit,
            credit: detail.credit,
            grossAmount: detail.taxDetails?.grossAmount ?? detail.debit,
            netAmount: detail.taxDetails?.netAmount ?? detail.debit,
            vatType: detail.taxDetails?.vatType ?? detail.vatType ?? "",
            vatCode: detail.taxDetails?.vatCode ?? "",
            vatPercent: detail.taxDetails?.vatPercent ?? 0,
            vatAmount: detail.taxDetails?.vatAmount ?? 0,
            ewtCode: detail.taxDetails?.ewtCode ?? detail.ewtCode ?? "",
            ewtPercent: detail.taxDetails?.ewtPercent ?? 0,
            ewtAmount: detail.taxDetails?.ewtAmount ?? 0,
            disburseAmount: detail.taxDetails?.amount ?? detail.debit,
            partyCode: detail.partyCode || payload.partyCode,
            partyName: detail.partyName || payload.partyName,
            responsibilityCenter: detail.responsibilityCenter || payload.projectCode || payload.costCenter || "",
            refId: detail.refId || payload.voucherReferenceNo || "",
            checkDate: cleanOptional(detail.checkDate),
            checkNo: detail.checkNo,
            checkStatus: detail.checkStatus,
          })),
        }
      : {}),
    fxRate: payload.fxRate === undefined ? undefined : Number(payload.fxRate),
    status: payload.status ? (mapCashVoucherStatusToApi(payload.status) as UpdateCashVoucherDtoStatus) : undefined,
  };

  const response = await cashVoucherControllerUpdatePutV1(id, transformedPayload);
  return mapCashVoucherResponseFromApi(response);
}

export async function updateCashVoucherStatusApi(id: string, status: CashVoucherStatus): Promise<CashVoucherRecord> {
  const response = await cashVoucherControllerUpdateStatusV1(id, {
    status: mapCashVoucherStatusToApi(status),
  });
  return mapCashVoucherResponseFromApi(response);
}

export async function deleteCashVoucherApi(id: string): Promise<void> {
  await cashVoucherControllerRemoveV1(id);
}

function mapCashVoucherResponseFromApi(response: CashVoucherSingleResponseDto): CashVoucherRecord {
  return mapCashVoucherRecordFromApi(response.data);
}

function mapCashVoucherRecordFromApi(record: CashVoucherRecordResponseDto): CashVoucherRecord {
  const displayAmount = getCashVoucherDisplayGrossAmount(record);
  const displayDisburseAmount = getCashVoucherDisplayDisburseAmount(record);

  return {
    ...record,
    amount: displayAmount,
    disburseAmount: displayDisburseAmount,
    costCenter: record.projectCode ?? record.costCenter ?? "",
    projectCode: record.projectCode ?? record.costCenter ?? "",
    createdBy: record.createdBy ?? undefined,
    disbursementType: record.disbursementType ?? "",
    fxRate: String(record.fxRate ?? "1.00"),
    history: [],
    invoiceReferenceNo: record.invoiceReferenceNo ?? "",
    lineEntries: record.details.map((detail) => ({
      id: detail.id,
      accountCode: detail.accountCode,
      accountName: detail.accountTitle,
      checkDate: detail.checkDate ?? undefined,
      checkNo: detail.checkNo ?? undefined,
      checkStatus: detail.checkStatus ?? undefined,
      partyCode: detail.partyCode ?? undefined,
      partyName: detail.partyName ?? undefined,
      responsibilityCenter: detail.responsibilityCenter ?? undefined,
      refId: detail.refId ?? undefined,
      vatType: detail.vatType ?? undefined,
      ewtCode: detail.ewtCode ?? undefined,
      particulars: detail.particulars ?? "",
      remarks: detail.remarks ?? undefined,
      debit: detail.debit,
      credit: detail.credit,
      taxRate: "",
      taxDetails: {
        code: detail.vatCode ?? "",
        name: detail.vatType ?? "",
        responsibilityCenter: detail.responsibilityCenter ?? "",
        refId: detail.refId ?? "",
        vatType: detail.vatType ?? "",
        grossAmount: detail.grossAmount,
        netAmount: detail.netAmount,
        vatCode: detail.vatCode ?? "",
        vatPercent: detail.vatPercent,
        vatAmount: detail.vatAmount,
        ewtCode: detail.ewtCode ?? "",
        ewtPercent: detail.ewtPercent,
        ewtAmount: detail.ewtAmount,
        amount: detail.disburseAmount || detail.debit,
      },
      status: detail.debit === detail.credit ? "Balanced" : "Pending",
    })),
    paymentDetails: createEmptyPaymentDetails(),
    paymentDueDate: record.paymentDueDate ?? record.voucherDate,
    paymentMethod: record.paymentMethod as CashVoucherRecord["paymentMethod"],
    preparedBy: record.preparedBy ?? "",
    projectName: record.projectName ?? "",
    referenceModule: record.referenceModule ?? "",
    remarks: record.remarks ?? "",
    status: mapCashVoucherStatusFromApi(record.status),
    taxDetails: createApiTaxDetails(displayAmount),
    taxRate: "0%",
    transactionId: record.id,
    updatedBy: record.updatedBy ?? undefined,
    updatedAt: record.updatedAt ?? undefined,
    voucherReferenceNo: record.voucherReferenceNo ?? "",
    attachments: [],
  };
}

function getCashVoucherDisplayDisburseAmount(record: CashVoucherRecordResponseDto) {
  const rawRecord = record as unknown as CashVoucherRecord & { details?: ApiCashVoucherLineAmountSource[] };
  const sourceRows = (rawRecord.lineEntries ?? rawRecord.details ?? []).filter((entry) => !isGeneratedCashVoucherApiLine(entry));
  const disburseAmount = sourceRows.reduce((sum, entry) => sum + getCashVoucherApiLineDisburseAmount(entry), 0);

  return disburseAmount > 0 ? roundCashVoucherApiAmount(disburseAmount) : record.amount;
}

function getCashVoucherDisplayGrossAmount(record: CashVoucherRecordResponseDto) {
  const rawRecord = record as unknown as CashVoucherRecord & { details?: ApiCashVoucherLineAmountSource[] };
  const sourceRows = (rawRecord.lineEntries ?? rawRecord.details ?? []).filter((entry) => !isGeneratedCashVoucherApiLine(entry));
  const grossAmount = sourceRows.reduce((sum, entry) => sum + getCashVoucherApiLineGrossAmount(entry), 0);

  return grossAmount > 0 ? roundCashVoucherApiAmount(grossAmount) : record.amount;
}

function createEmptyPaymentDetails(): CashVoucherRecord["paymentDetails"] {
  return {
    bankAccountCode: "",
    bankAccountName: "",
    bankAccountNo: "",
    bankAccountTitle: "",
    bankBranch: "",
    bankName: "",
    checkDate: "",
    checkNo: "",
    checkStatus: "",
    isMultiCheckNumber: false,
    payee: "",
    paymentReferenceNo: "",
    transferAccountName: "",
    transferAccountNo: "",
    transferToBank: "",
    transferTo: "",
  };
}

function createApiTaxDetails(amount: number): CashVoucherRecord["taxDetails"] {
  return {
    code: "",
    name: "",
    responsibilityCenter: "",
    refId: "",
    vatType: "",
    grossAmount: amount,
    netAmount: amount,
    vatCode: "",
    vatPercent: 0,
    vatAmount: 0,
    ewtCode: "",
    ewtPercent: 0,
    ewtAmount: 0,
    amount,
  };
}

function getCashVoucherApiLineDisburseAmount(entry: ApiCashVoucherLineAmountSource) {
  const grossAmount = getCashVoucherApiLineGrossAmount(entry);
  const ewtPercent = Number(entry.taxDetails?.ewtPercent || entry.ewtPercent || 0);

  if (grossAmount > 0 && ewtPercent > 0) {
    return grossAmount - grossAmount * (ewtPercent / 100);
  }

  return Number(entry.taxDetails?.amount || entry.disburseAmount || 0) || grossAmount;
}

function getCashVoucherApiLineGrossAmount(entry: ApiCashVoucherLineAmountSource) {
  const storedGrossAmount = Number(entry.taxDetails?.grossAmount || entry.grossAmount || 0);
  const debitAmount = Number(entry.debit || 0);
  const vatPercent = Number(entry.taxDetails?.vatPercent || entry.vatPercent || 0);

  if (storedGrossAmount > 0 && debitAmount > 0 && vatPercent > 0 && Math.abs(storedGrossAmount - debitAmount) <= 0.01) {
    const netRatio = 1 - vatPercent / 100;

    if (netRatio > 0) {
      return debitAmount / netRatio;
    }
  }

  return storedGrossAmount || debitAmount;
}

function isGeneratedCashVoucherApiLine(entry: ApiCashVoucherLineAmountSource) {
  const id = String(entry.id ?? "");
  const accountName = String(entry.accountName || entry.accountTitle || "").trim().toLowerCase();

  return (
    id.startsWith("auto-input-vat-") ||
    id.startsWith("auto-ewt-") ||
    id.startsWith("auto-credit-") ||
    accountName === "input vat" ||
    accountName === "expanded withholding tax" ||
    accountName === "cash on hand" ||
    accountName === "cash in bank" ||
    accountName.startsWith("cash in bank - ") ||
    accountName === "check cashvoucher clearing" ||
    accountName === "online payment clearing"
  );
}

function roundCashVoucherApiAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function mapCashVoucherStatusFromApi(status: string): CashVoucherStatus {
  const statusMap: Record<string, CashVoucherStatus> = {
    APPROVED: "Posted",
    CANCELLED: "Cancelled",
    CLOSED: "Closed",
    DISAPPROVED: "Disapproved",
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
  };

  return statusMap[status] ?? (status as CashVoucherStatus);
}

function mapCashVoucherStatusToApi(status: string): ApiCashVoucherStatus {
  const statusMap: Record<string, ApiCashVoucherStatus> = {
    Cancelled: "CANCELLED",
    Closed: "CLOSED",
    Disapproved: "DISAPPROVED",
    Draft: "DRAFT",
    "For Approval": "FOR_APPROVAL",
    Open: "DRAFT",
    Posted: "POSTED",
  };

  return statusMap[status] ?? (status as ApiCashVoucherStatus);
}

function getCashVoucherPayloadDetails(details: CashVoucherLineEntry[], status?: CashVoucherStatus) {
  if (status === "Draft" || status === "Open" || !status) {
    return details.filter(cashVoucherLineEntryHasData);
  }

  return details;
}

function cashVoucherLineEntryHasData(detail: CashVoucherLineEntry) {
  return (
    detail.accountCode.trim() !== "" ||
    detail.accountName.trim() !== "" ||
    (detail.checkDate ?? "").trim() !== "" ||
    (detail.checkNo ?? "").trim() !== "" ||
    (detail.checkStatus ?? "").trim() !== "" ||
    (detail.partyCode ?? "").trim() !== "" ||
    (detail.partyName ?? "").trim() !== "" ||
    (detail.responsibilityCenter ?? "").trim() !== "" ||
    (detail.refId ?? "").trim() !== "" ||
    (detail.vatType ?? "").trim() !== "" ||
    (detail.ewtCode ?? "").trim() !== "" ||
    (detail.particulars ?? detail.remarks ?? "").trim() !== "" ||
    Number(detail.debit || 0) > 0 ||
    Number(detail.credit || 0) > 0 ||
    detail.taxRate !== "0%"
  );
}

function cleanOptional(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}
