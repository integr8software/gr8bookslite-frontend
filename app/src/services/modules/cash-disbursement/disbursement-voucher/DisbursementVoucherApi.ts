import { defaultAccountControllerFindOptionsByTypeV1 } from "@/app/src/generated/api/default-account/default-account";
import {
  disbursementVoucherControllerCreateV1,
  disbursementVoucherControllerFindAllV1,
  disbursementVoucherControllerFindOneV1,
  disbursementVoucherControllerRemoveV1,
  disbursementVoucherControllerSuggestTransactionNumberV1,
  disbursementVoucherControllerUpdatePutV1,
  disbursementVoucherControllerUpdateStatusV1,
} from "@/app/src/generated/api/disbursement-voucher/disbursement-voucher";
import type {
  CreateDisbursementVoucherDto,
  CreateDisbursementVoucherDtoStatus,
  DefaultAccountOptionResponseDto,
  DisbursementVoucherControllerFindAllV1Params,
  DisbursementVoucherListResponseDto,
  DisbursementVoucherRecordResponseDto,
  DisbursementVoucherSingleResponseDto,
  UpdateDisbursementVoucherDto,
  UpdateDisbursementVoucherDtoStatus,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type {
  DisbursementLineEntry,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
  DisbursementVoucherPaymentDetails,
  DisbursementAttachment,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

type ApiDisbursementVoucherStatus = CreateDisbursementVoucherDtoStatus | UpdateDisbursementVoucherDtoStatus | string;
type ApiDisbursementVoucherLineAmountSource = Partial<DisbursementLineEntry> & {
  accountTitle?: string;
  disburseAmount?: number;
  grossAmount?: number;
  netAmount?: number;
  vatCode?: string;
  vatPercent?: number;
  vatAmount?: number;
  ewtCode?: string;
  ewtPercent?: number;
  ewtAmount?: number;
};

export type FetchDisbursementVoucherListParams = {
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

type MappedDisbursementVoucherListResponse = Omit<DisbursementVoucherListResponseDto, "data"> & {
  data: DisbursementVoucherRecord[];
};

export async function fetchDisbursementVoucherList(
  params?: FetchDisbursementVoucherListParams,
): Promise<MappedDisbursementVoucherListResponse> {
  const response = await disbursementVoucherControllerFindAllV1({
    ...params,
    status: params?.status && params.status !== "all" ? mapDisbursementVoucherStatusToApi(params.status) : params?.status,
  } as DisbursementVoucherControllerFindAllV1Params);

  return {
    ...response,
    data: response.data.map(mapDisbursementVoucherRecordFromApi),
  };
}

export async function fetchDisbursementVoucherById(id: string): Promise<DisbursementVoucherRecord> {
  const response = await disbursementVoucherControllerFindOneV1(id);
  return mapDisbursementVoucherRecordFromApi(response.data);
}

export async function fetchNextDisbursementVoucherTransactionNo(branchUnitId?: number): Promise<string> {
  const response = await disbursementVoucherControllerSuggestTransactionNumberV1({ branchUnitId });
  return response.transactionNo;
}

export async function fetchDisbursementVoucherExpenseAccountOptions(): Promise<DefaultAccountOptionResponseDto[]> {
  const response = await defaultAccountControllerFindOptionsByTypeV1("expense", { status: "ACTIVE" });

  return response.options;
}

export async function fetchDisbursementVoucherAccountTitleOptions(): Promise<ModuleChartAccount[]> {
  const response = await ApiClient.get<CashDisbursementAccountTitleOptionsResponse>(
    "/cash-disbursement/disbursement-voucher/account-title-options",
  );

  return (response.data.accounts ?? []).map(mapAccountTitleOption);
}

export async function createDisbursementVoucherApi(payload: {
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
  paymentDetails?: DisbursementVoucherPaymentDetails;
  attachments?: DisbursementAttachment[];
  disbursementType?: string;
  costCenter?: string;
  projectCode?: string;
  projectName?: string;
  preparedBy?: string;
  currency?: string;
  fxRate?: string | number;
  amount?: string | number;
  remarks?: string;
  status?: DisbursementVoucherStatus;
  details: DisbursementLineEntry[];
}): Promise<DisbursementVoucherRecord> {
  const details = getDisbursementVoucherPayloadDetails(payload.details, payload.status);
  const { details: _frontendDetails, ...payloadWithoutDetails } = payload;
  void _frontendDetails;
  const transformedPayload: CreateDisbursementVoucherDto = {
    ...payloadWithoutDetails,
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
    status: payload.status ? (mapDisbursementVoucherStatusToApi(payload.status) as CreateDisbursementVoucherDtoStatus) : undefined,
  };

  const response = await disbursementVoucherControllerCreateV1(transformedPayload);
  return mapDisbursementVoucherResponseFromApi(response);
}

export async function updateDisbursementVoucherApi(
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
    paymentDetails?: DisbursementVoucherPaymentDetails;
    attachments?: DisbursementAttachment[];
    disbursementType?: string;
    costCenter?: string;
    projectCode?: string;
    projectName?: string;
    preparedBy?: string;
    currency?: string;
    fxRate?: string | number;
    amount?: string | number;
    remarks?: string;
    status?: DisbursementVoucherStatus;
    details?: DisbursementLineEntry[];
  }>,
): Promise<DisbursementVoucherRecord> {
  const details = payload.details ? getDisbursementVoucherPayloadDetails(payload.details, payload.status) : undefined;
  const { details: _frontendDetails, ...payloadWithoutDetails } = payload;
  void _frontendDetails;
  const transformedPayload: UpdateDisbursementVoucherDto = {
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
    status: payload.status ? (mapDisbursementVoucherStatusToApi(payload.status) as UpdateDisbursementVoucherDtoStatus) : undefined,
  };

  const response = await disbursementVoucherControllerUpdatePutV1(id, transformedPayload);
  return mapDisbursementVoucherResponseFromApi(response);
}

export async function updateDisbursementVoucherStatusApi(
  id: string,
  status: DisbursementVoucherStatus,
): Promise<DisbursementVoucherRecord> {
  const response = await disbursementVoucherControllerUpdateStatusV1(id, {
    status: mapDisbursementVoucherStatusToApi(status),
  });
  return mapDisbursementVoucherResponseFromApi(response);
}

export async function deleteDisbursementVoucherApi(id: string): Promise<void> {
  await disbursementVoucherControllerRemoveV1(id);
}

function mapDisbursementVoucherResponseFromApi(response: DisbursementVoucherSingleResponseDto): DisbursementVoucherRecord {
  return mapDisbursementVoucherRecordFromApi(response.data);
}

function mapDisbursementVoucherRecordFromApi(record: DisbursementVoucherRecordResponseDto): DisbursementVoucherRecord {
  const rawRecord = record as DisbursementVoucherRecordResponseDto & {
    disburseAmount?: number;
    lineEntries?: ApiDisbursementVoucherLineAmountSource[];
    details?: ApiDisbursementVoucherLineAmountSource[];
  };
  const rawDetails = (rawRecord.lineEntries ?? rawRecord.details ?? []) as ApiDisbursementVoucherLineAmountSource[];
  const displayAmount = getDisbursementVoucherDisplayGrossAmount(record);
  const sourceDetails = rawDetails.filter((detail) => !isGeneratedDisbursementVoucherApiLine(detail));
  const computedDisburseAmount = sourceDetails.reduce((sum, detail) => sum + getDisbursementVoucherApiLineDisburseAmount(detail), 0);
  const disburseAmount =
    rawRecord.disburseAmount != null && Number(rawRecord.disburseAmount) > 0
      ? roundDisbursementVoucherApiAmount(Number(rawRecord.disburseAmount))
      : computedDisburseAmount > 0
        ? roundDisbursementVoucherApiAmount(computedDisburseAmount)
        : record.amount || displayAmount;
  return {
    ...record,
    transactionId: record.id,
    lineEntries: rawDetails.map((detail, index) => ({
      id: detail.id ?? `line-${index + 1}`,
      accountCode: detail.accountCode ?? "",
      accountName: detail.accountName || detail.accountTitle || "",
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
      debit: Number(detail.debit || 0),
      credit: Number(detail.credit || 0),
      taxRate: "",
      taxDetails: {
        code: detail.vatCode ?? detail.taxDetails?.code ?? "",
        name: detail.vatType ?? detail.taxDetails?.name ?? "",
        responsibilityCenter: detail.responsibilityCenter ?? detail.taxDetails?.responsibilityCenter ?? "",
        refId: detail.refId ?? detail.taxDetails?.refId ?? "",
        vatType: detail.vatType ?? detail.taxDetails?.vatType ?? "",
        grossAmount: detail.grossAmount ?? detail.taxDetails?.grossAmount ?? Number(detail.debit || 0),
        netAmount: detail.netAmount ?? detail.taxDetails?.netAmount ?? Number(detail.debit || 0),
        vatCode: detail.vatCode ?? detail.taxDetails?.vatCode ?? "",
        vatPercent: detail.vatPercent ?? detail.taxDetails?.vatPercent ?? 0,
        vatAmount: detail.vatAmount ?? detail.taxDetails?.vatAmount ?? 0,
        ewtCode: detail.ewtCode ?? detail.taxDetails?.ewtCode ?? "",
        ewtPercent: detail.ewtPercent ?? detail.taxDetails?.ewtPercent ?? 0,
        ewtAmount: detail.ewtAmount ?? detail.taxDetails?.ewtAmount ?? 0,
        amount: getDisbursementVoucherApiLineDisburseAmount(detail),
      },
      status: Number(detail.debit || 0) === Number(detail.credit || 0) ? "Balanced" : "Pending",
    })),
    fxRate: String(record.fxRate ?? "1.00"),
    amount: displayAmount,
    disburseAmount,
    costCenter: record.costCenter ?? "",
    paymentMethod: record.paymentMethod ?? "",
    disbursementType: record.disbursementType ?? "",
    currency: record.currency ?? "PHP",
    paymentDetails: (record.paymentDetails as DisbursementVoucherPaymentDetails | null | undefined) ?? createEmptyPaymentDetails(),
    attachments: (record.attachments as DisbursementAttachment[] | null | undefined) ?? [],
    taxRate: "0%",
    taxDetails: createApiTaxDetails(displayAmount),
    history: [],
    status: mapDisbursementVoucherStatusFromApi(record.status),
    referenceModule: record.referenceModule ?? "",
    voucherReferenceNo: record.voucherReferenceNo ?? "",
    invoiceReferenceNo: record.invoiceReferenceNo ?? "",
    paymentDueDate: record.paymentDueDate ?? record.voucherDate,
    projectName: record.projectName ?? "",
    preparedBy: record.preparedBy ?? "",
    remarks: record.remarks ?? "",
    createdBy: record.createdBy ?? undefined,
    updatedBy: record.updatedBy ?? undefined,
    updatedAt: record.updatedAt ?? undefined,
  };
}

function createEmptyPaymentDetails(): DisbursementVoucherPaymentDetails {
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

function createApiTaxDetails(amount: number) {
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

function getDisbursementVoucherDisplayGrossAmount(record: DisbursementVoucherRecordResponseDto) {
  const rawRecord = record as DisbursementVoucherRecordResponseDto & {
    lineEntries?: ApiDisbursementVoucherLineAmountSource[];
    details?: ApiDisbursementVoucherLineAmountSource[];
  };
  const sourceRows = (rawRecord.lineEntries ?? rawRecord.details ?? []).filter((entry) => !isGeneratedDisbursementVoucherApiLine(entry));
  const grossAmount = sourceRows.reduce((sum, entry) => sum + getDisbursementVoucherApiLineGrossAmount(entry), 0);

  return grossAmount > 0 ? roundDisbursementVoucherApiAmount(grossAmount) : record.amount;
}

function getDisbursementVoucherApiLineGrossAmount(entry: ApiDisbursementVoucherLineAmountSource) {
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

function getDisbursementVoucherApiLineDisburseAmount(entry: ApiDisbursementVoucherLineAmountSource): number {
  if (entry.disburseAmount != null && Number(entry.disburseAmount) > 0) {
    return Number(entry.disburseAmount);
  }

  if (entry.taxDetails?.amount != null && Number(entry.taxDetails.amount) > 0) {
    return Number(entry.taxDetails.amount);
  }

  const gross = getDisbursementVoucherApiLineGrossAmount(entry);
  const ewt = Number(entry.taxDetails?.ewtAmount || entry.ewtAmount || 0);
  const net = gross - ewt;

  if (net > 0) {
    return net;
  }

  return Number(entry.debit || 0);
}

function isGeneratedDisbursementVoucherApiLine(entry: ApiDisbursementVoucherLineAmountSource) {
  const id = String(entry.id ?? "");
  const accountName = String(entry.accountName || entry.accountTitle || "")
    .trim()
    .toLowerCase();
  const debit = Number(entry.debit || 0);
  const credit = Number(entry.credit || 0);

  if (credit > 0 && debit <= 0) {
    return true;
  }

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

function roundDisbursementVoucherApiAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function mapDisbursementVoucherStatusFromApi(status: string): DisbursementVoucherStatus {
  const statusMap: Record<string, DisbursementVoucherStatus> = {
    APPROVED: "Posted",
    CANCELLED: "Cancelled",
    CLOSED: "Closed",
    DISAPPROVED: "Disapproved",
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
  };

  return statusMap[status] ?? (status as DisbursementVoucherStatus);
}

function mapDisbursementVoucherStatusToApi(status: string): ApiDisbursementVoucherStatus {
  const statusMap: Record<string, ApiDisbursementVoucherStatus> = {
    Cancelled: "CANCELLED",
    Closed: "CLOSED",
    Disapproved: "DISAPPROVED",
    Draft: "DRAFT",
    "For Approval": "FOR_APPROVAL",
    Open: "DRAFT",
    Posted: "POSTED",
  };

  return statusMap[status] ?? (status as ApiDisbursementVoucherStatus);
}

function getDisbursementVoucherPayloadDetails(details: DisbursementLineEntry[], status?: DisbursementVoucherStatus) {
  if (status === "Draft" || status === "Open" || !status) {
    return details.filter(disbursementVoucherLineEntryHasData);
  }

  return details;
}

function disbursementVoucherLineEntryHasData(detail: DisbursementLineEntry) {
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

type CashDisbursementAccountTitleOptionsResponse = {
  accounts: CashDisbursementAccountTitleOption[];
};

type CashDisbursementAccountTitleOption = {
  id: string;
  accountCode: string;
  accountTitle: string;
  accountType?: string | null;
  accountNature?: string | null;
  status?: string | null;
};

function mapAccountTitleOption(account: CashDisbursementAccountTitleOption): ModuleChartAccount {
  const accountType = mapChartAccountType(account.accountType);
  const accountNature = account.accountNature ?? "DEBIT";

  return {
    accountCategory: accountNature,
    accountName: account.accountTitle,
    accountNumber: account.accountCode,
    accountType,
    description: account.accountTitle,
    id: account.id,
    normalBalance: accountNature === "CREDIT" ? "Credit" : "Debit",
    statementGroup: accountType === "Expenses" ? "Income Statement" : "Balance Sheet",
    statementSection: accountNature,
    status: account.status === "INACTIVE" ? "Inactive" : "Active",
  };
}

function mapChartAccountType(accountType?: string | null) {
  if (accountType === "EXPENSE") return "Expenses";
  if (accountType === "ASSET") return "Assets";
  if (accountType === "LIABILITY") return "Liabilities";
  if (accountType === "REVENUE") return "Revenues";
  if (accountType === "EQUITY") return "Equity";

  return accountType ?? "";
}
