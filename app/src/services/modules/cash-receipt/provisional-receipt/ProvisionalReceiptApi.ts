import {
  provisionalReceiptControllerCreateV1,
  provisionalReceiptControllerFindAllV1,
  provisionalReceiptControllerFindOneV1,
  provisionalReceiptControllerSuggestTransactionNumberV1,
  provisionalReceiptControllerUpdateStatusV1,
  provisionalReceiptControllerUpdateV1,
} from "@/app/src/generated/api/provisional-receipt/provisional-receipt";
import type {
  CreateProvisionalReceiptDto,
  ProvisionalReceiptJournalEntryDto,
  ProvisionalReceiptControllerFindAllV1Params,
  ProvisionalReceiptResponseDto,
  ProvisionalReceiptResponseDtoStatus,
  UpdateProvisionalReceiptStatusDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  createProvisionalReceiptAccountingRows,
  calculateProvisionalReceiptCwtAmount,
  calculateProvisionalReceiptNetOfVat,
  calculateProvisionalReceiptTotalReceived,
  calculateProvisionalReceiptTotals,
  calculateProvisionalReceiptVatAmount,
  syncProvisionalReceiptCheckDetails,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  ProvisionalReceiptFormValues,
  ProvisionalReceiptRecord,
  ProvisionalReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";

export type ProvisionalReceiptListData = Awaited<ReturnType<typeof provisionalReceiptControllerFindAllV1>>;
export type ProvisionalReceiptNumberSuggestion = Awaited<ReturnType<typeof provisionalReceiptControllerSuggestTransactionNumberV1>>;

type ProvisionalReceiptListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?: ProvisionalReceiptControllerFindAllV1Params["sortBy"];
  sortDirection?: ProvisionalReceiptControllerFindAllV1Params["sortDirection"];
  status?: ProvisionalReceiptStatus | "all" | null;
};

const StatusFromApi: Record<string, ProvisionalReceiptStatus> = {
  CANCELLED: "Cancelled",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<ProvisionalReceiptStatus, UpdateProvisionalReceiptStatusDto["status"]> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
};

export async function fetchProvisionalReceipts(query: ProvisionalReceiptListQuery = {}): Promise<ProvisionalReceiptListData> {
  return provisionalReceiptControllerFindAllV1(
    cleanQueryParams({
      amountFrom: query.amountFrom,
      amountTo: query.amountTo,
      branchUnitId: query.branchUnitId,
      documentDateFrom: query.documentDateFrom,
      documentDateTo: query.documentDateTo,
      limit: query.limit ?? 500,
      page: query.page ?? 1,
      search: query.search,
      sortBy: query.sortBy ?? "documentDate",
      sortDirection: query.sortDirection ?? "desc",
      status: query.status && query.status !== "all" ? mapStatusToApi(query.status) : undefined,
    }),
  );
}

export async function fetchProvisionalReceipt(
  id: string,
  query: Pick<ProvisionalReceiptListQuery, "branchUnitId"> = {},
): Promise<ProvisionalReceiptRecord> {
  const response = await provisionalReceiptControllerFindOneV1(id, cleanQueryParams({ branchUnitId: query.branchUnitId }));

  return mapApiProvisionalReceipt(response.receipt);
}

export async function fetchProvisionalReceiptNumberSuggestion(branchUnitId?: number | null): Promise<ProvisionalReceiptNumberSuggestion> {
  return provisionalReceiptControllerSuggestTransactionNumberV1(cleanQueryParams({ branchUnitId }));
}

export async function createProvisionalReceipt(
  values: ProvisionalReceiptFormValues,
  branchUnitId?: number | null,
): Promise<ProvisionalReceiptRecord> {
  const response = await provisionalReceiptControllerCreateV1(toApiProvisionalReceiptPayload(values, branchUnitId));

  return mapApiProvisionalReceipt(response.receipt);
}

export async function updateProvisionalReceipt(
  record: ProvisionalReceiptRecord,
  branchUnitId?: number | null,
): Promise<ProvisionalReceiptRecord> {
  const response = await provisionalReceiptControllerUpdateV1(
    record.id,
    toApiProvisionalReceiptPayload(record.formValues ?? createFormValuesFromRecord(record), branchUnitId),
  );

  return mapApiProvisionalReceipt(response.receipt);
}

export async function updateProvisionalReceiptStatus(input: {
  recordId: string;
  status: ProvisionalReceiptStatus;
}): Promise<ProvisionalReceiptRecord> {
  const response = await provisionalReceiptControllerUpdateStatusV1(input.recordId, {
    status: mapStatusToApi(input.status),
  });

  return mapApiProvisionalReceipt(response.receipt);
}

export function mapApiProvisionalReceipt(receipt: ProvisionalReceiptResponseDto): ProvisionalReceiptRecord {
  const formValues = createFormValuesFromApi(receipt);
  const firstEntry = formValues.lineEntries[0];

  return {
    amount: receipt.grossAmount,
    collectionType: firstEntry?.collectionType ?? "",
    customerName: receipt.customerName,
    formValues,
    id: receipt.id,
    partyCode: receipt.customerCode,
    receiptDate: receipt.documentDate,
    receiptNo: receipt.receiptNo ?? receipt.transactionNo,
    referenceNo: receipt.referenceNo ?? "",
    status: mapStatusFromApi(receipt.status),
  };
}

function createFormValuesFromApi(receipt: ProvisionalReceiptResponseDto): ProvisionalReceiptFormValues {
  return {
    currency: receipt.currency,
    customerName: receipt.customerName,
    exchangeRate: receipt.exchangeRate.toFixed(4),
    lineEntries: createLineEntriesFromApi(receipt),
    partyCode: receipt.customerCode,
    paymentType: receipt.paymentType ?? "",
    paymentId: receipt.paymentId ?? "",
    bankName: "",
    checkNo: "",
    checkDate: "",
    receiptDate: receipt.documentDate,
    receiptNo: receipt.receiptNo ?? receipt.transactionNo,
    referenceNo: receipt.referenceNo ?? "",
    remarks: receipt.remarks ?? "",
    status: mapStatusFromApi(receipt.status),
  };
}

function createLineEntriesFromApi(receipt: ProvisionalReceiptResponseDto): ProvisionalReceiptFormValues["lineEntries"] {
  return receipt.details.map((detail) => {
    const accountEntry = receipt.journalEntries[0];
    const debit = detail.grossAmount;
    const credit = detail.grossAmount;

    return {
      accountCode: accountEntry?.accountCode ?? "",
      accountTitle: accountEntry?.accountTitle ?? "",
      bankName: "",
      checkDate: "",
      checkNo: "",
      collectionType: detail.description,
      credit: credit.toFixed(2),
      customerName: detail.partyName ?? receipt.customerName,
      cwtCode: detail.cwtCode ?? "",
      cwtPercent: detail.cwtPercent.toFixed(2),
      debit: debit.toFixed(2),
      ewt: detail.ewtAmount.toFixed(4),
      grossReceipt: detail.grossAmount.toFixed(4),
      id: detail.id,
      particulars: detail.particulars ?? "",
      partyCode: detail.partyCode ?? receipt.customerCode,
      partyName: detail.partyName ?? receipt.customerName,
      referenceNo: detail.referenceNo ?? receipt.referenceNo ?? "",
      responsibilityCenter: detail.responsibilityCenter ?? "",
      vat: detail.vatAmount.toFixed(4),
      vatExempt: "0.0000",
      vatPercent: detail.vatPercent.toFixed(2),
      vatType: detail.vatType ?? "",
    };
  });
}

function toApiProvisionalReceiptPayload(values: ProvisionalReceiptFormValues, branchUnitId?: number | null): CreateProvisionalReceiptDto {
  const syncedValues = syncProvisionalReceiptCheckDetails(values);
  const currencyCode = values.currency.trim();
  const exchangeRate = toExchangeRate(values.exchangeRate);
  const totals = calculateProvisionalReceiptTotals(syncedValues.lineEntries);
  const referenceNo = cleanOptional(syncedValues.referenceNo);
  const firstLine = syncedValues.lineEntries[0];

  return {
    billToName: cleanOptional(syncedValues.customerName),
    branchUnitId: branchUnitId ?? undefined,
    currency: currencyCode,
    customerCode: syncedValues.partyCode.trim(),
    customerName: syncedValues.customerName.trim(),
    details: syncedValues.lineEntries.map((line, index) => {
      const grossReceipt = toNumber(line.grossReceipt);
      const vatAmount = calculateProvisionalReceiptVatAmount(line);
      const ewtAmount = calculateProvisionalReceiptCwtAmount(line);

      return {
        cwtCode: cleanOptional(line.cwtCode),
        cwtPercent: toNumber(line.cwtPercent),
        description: line.collectionType.trim() || "Collection",
        ewtAmount,
        grossAmount: grossReceipt,
        lineNumber: index + 1,
        netAmount: calculateProvisionalReceiptNetOfVat(line),
        particulars: cleanOptional(line.particulars) ?? cleanOptional(line.collectionType),
        partyCode: cleanOptional(line.partyCode),
        partyName: cleanOptional(line.partyName) ?? cleanOptional(line.customerName),
        referenceNo: cleanOptional(line.referenceNo),
        responsibilityCenter: cleanOptional(line.responsibilityCenter),
        totalReceived: calculateProvisionalReceiptTotalReceived(line),
        vatAmount,
        vatPercent: toNumber(line.vatPercent),
        vatType: cleanOptional(line.vatType),
      };
    }),
    discountAmount: 0,
    documentDate: syncedValues.receiptDate,
    dueDate: syncedValues.receiptDate,
    ewtAmount: totals.ewt,
    exchangeRate,
    grossAmount: totals.grossReceipt,
    journalEntries: createProvisionalReceiptJournalEntries(syncedValues, currencyCode, exchangeRate, referenceNo),
    netAmount: Math.max(totals.grossReceipt - totals.vat, 0),
    paymentId: cleanOptional(syncedValues.paymentId),
    receivableAccountCode: firstLine?.accountCode.trim() || "1010103001",
    receivableAccountTitle: firstLine?.accountTitle.trim() || "Cash in Bank",
    receiptNo: cleanOptional(syncedValues.receiptNo),
    referenceNo,
    remarks: cleanOptional(syncedValues.remarks),
    transactionNo: cleanOptional(syncedValues.receiptNo),
    vatAmount: totals.vat,
    wvatAmount: 0,
  };
}

function createProvisionalReceiptJournalEntries(
  values: ProvisionalReceiptFormValues,
  currencyCode: string,
  exchangeRate: number,
  fallbackReferenceNo: string | null,
): ProvisionalReceiptJournalEntryDto[] {
  return createProvisionalReceiptAccountingRows(values.lineEntries).map((entry, index) => ({
    accountCode: entry.accountCode,
    accountTitle: entry.accountTitle,
    atcCode: cleanOptional(entry.cwtCode),
    credit: toNumber(entry.credit),
    currencyCode,
    debit: toNumber(entry.debit),
    exchangeRate,
    lineNumber: index + 1,
    particulars: cleanOptional(entry.particulars),
    partyCode: cleanOptional(entry.partyCode),
    partyName: cleanOptional(entry.partyName),
    referenceType: "PVR",
    refNo: cleanOptional(entry.referenceNo) ?? fallbackReferenceNo,
    responsibilityCenter: cleanOptional(entry.responsibilityCenter),
    vatType: cleanOptional(entry.vatType),
  }));
}

function createFormValuesFromRecord(record: ProvisionalReceiptRecord): ProvisionalReceiptFormValues {
  return {
    currency: "PHP",
    customerName: record.customerName,
    exchangeRate: "1.0000",
    lineEntries: record.formValues?.lineEntries ?? [],
    partyCode: record.partyCode,
    paymentType: record.formValues?.paymentType ?? "",
    paymentId: record.formValues?.paymentId ?? "",
    bankName: record.formValues?.bankName ?? record.formValues?.lineEntries[0]?.bankName ?? "",
    checkNo: record.formValues?.checkNo ?? record.formValues?.lineEntries[0]?.checkNo ?? "",
    checkDate: record.formValues?.checkDate ?? record.formValues?.lineEntries[0]?.checkDate ?? "",
    receiptDate: record.receiptDate,
    receiptNo: record.receiptNo,
    referenceNo: record.referenceNo,
    remarks: record.formValues?.remarks ?? "",
    status: record.status,
  };
}

function cleanQueryParams(params: Record<string, number | string | null | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }),
  );
}

function cleanOptional(value?: string | null) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function mapStatusFromApi(value: ProvisionalReceiptResponseDtoStatus): ProvisionalReceiptStatus {
  return StatusFromApi[value] ?? "Draft";
}

function mapStatusToApi(value: ProvisionalReceiptStatus): UpdateProvisionalReceiptStatusDto["status"] {
  return StatusToApi[value] ?? "DRAFT";
}

function toExchangeRate(value: number | string | null | undefined) {
  const numberValue = toNumber(value, 1);

  return numberValue > 0 ? numberValue : 1;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const numberValue = typeof value === "string" ? parseMoneyNumberInput(value) : Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}
