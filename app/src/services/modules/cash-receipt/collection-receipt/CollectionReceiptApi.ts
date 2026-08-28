import {
  collectionReceiptControllerCreateV1,
  collectionReceiptControllerFindAllV1,
  collectionReceiptControllerFindOneV1,
  collectionReceiptControllerSuggestTransactionNumberV1,
  collectionReceiptControllerUpdateStatusV1,
  collectionReceiptControllerUpdateV1,
} from "@/app/src/generated/api/collection-receipt/collection-receipt";
import type {
  CreateCollectionReceiptDto,
  CollectionReceiptJournalEntryDto,
  CollectionReceiptControllerFindAllV1Params,
  CollectionReceiptResponseDto,
  CollectionReceiptResponseDtoStatus,
  UpdateCollectionReceiptStatusDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  createCollectionReceiptAccountingRows,
  calculateCollectionReceiptCwtAmount,
  calculateCollectionReceiptNetOfVat,
  calculateCollectionReceiptTotalReceived,
  calculateCollectionReceiptTotals,
  calculateCollectionReceiptVatAmount,
  syncCollectionReceiptCheckDetails,
} from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  CollectionReceiptFormValues,
  CollectionReceiptRecord,
  CollectionReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

export type CollectionReceiptListData = Awaited<ReturnType<typeof collectionReceiptControllerFindAllV1>>;
export type CollectionReceiptNumberSuggestion = Awaited<ReturnType<typeof collectionReceiptControllerSuggestTransactionNumberV1>>;

type CollectionReceiptListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?: CollectionReceiptControllerFindAllV1Params["sortBy"];
  sortDirection?: CollectionReceiptControllerFindAllV1Params["sortDirection"];
  status?: CollectionReceiptStatus | "all" | null;
};

const StatusFromApi: Record<string, CollectionReceiptStatus> = {
  CANCELLED: "Cancelled",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<CollectionReceiptStatus, UpdateCollectionReceiptStatusDto["status"]> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
};

export async function fetchCollectionReceipts(query: CollectionReceiptListQuery = {}): Promise<CollectionReceiptListData> {
  return collectionReceiptControllerFindAllV1(
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

export async function fetchCollectionReceipt(
  id: string,
  query: Pick<CollectionReceiptListQuery, "branchUnitId"> = {},
): Promise<CollectionReceiptRecord> {
  const response = await collectionReceiptControllerFindOneV1(id, cleanQueryParams({ branchUnitId: query.branchUnitId }));

  return mapApiCollectionReceipt(response.receipt);
}

export async function fetchCollectionReceiptNumberSuggestion(branchUnitId?: number | null): Promise<CollectionReceiptNumberSuggestion> {
  return collectionReceiptControllerSuggestTransactionNumberV1(cleanQueryParams({ branchUnitId }));
}

export async function createCollectionReceipt(
  values: CollectionReceiptFormValues,
  branchUnitId?: number | null,
): Promise<CollectionReceiptRecord> {
  const response = await collectionReceiptControllerCreateV1(toApiCollectionReceiptPayload(values, branchUnitId));

  return mapApiCollectionReceipt(response.receipt);
}

export async function updateCollectionReceipt(
  record: CollectionReceiptRecord,
  branchUnitId?: number | null,
): Promise<CollectionReceiptRecord> {
  const response = await collectionReceiptControllerUpdateV1(
    record.id,
    toApiCollectionReceiptPayload(record.formValues ?? createFormValuesFromRecord(record), branchUnitId),
  );

  return mapApiCollectionReceipt(response.receipt);
}

export async function updateCollectionReceiptStatus(input: {
  recordId: string;
  status: CollectionReceiptStatus;
}): Promise<CollectionReceiptRecord> {
  const response = await collectionReceiptControllerUpdateStatusV1(input.recordId, {
    status: mapStatusToApi(input.status),
  });

  return mapApiCollectionReceipt(response.receipt);
}

export function mapApiCollectionReceipt(receipt: CollectionReceiptResponseDto): CollectionReceiptRecord {
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

function createFormValuesFromApi(receipt: CollectionReceiptResponseDto): CollectionReceiptFormValues {
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

function createLineEntriesFromApi(receipt: CollectionReceiptResponseDto): CollectionReceiptFormValues["lineEntries"] {
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

function toApiCollectionReceiptPayload(values: CollectionReceiptFormValues, branchUnitId?: number | null): CreateCollectionReceiptDto {
  const syncedValues = syncCollectionReceiptCheckDetails(values);
  const currencyCode = values.currency.trim();
  const exchangeRate = toExchangeRate(values.exchangeRate);
  const totals = calculateCollectionReceiptTotals(syncedValues.lineEntries);
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
      const vatAmount = calculateCollectionReceiptVatAmount(line);
      const ewtAmount = calculateCollectionReceiptCwtAmount(line);

      return {
        cwtCode: cleanOptional(line.cwtCode),
        cwtPercent: toNumber(line.cwtPercent),
        description: line.collectionType.trim() || "Collection",
        ewtAmount,
        grossAmount: grossReceipt,
        lineNumber: index + 1,
        netAmount: calculateCollectionReceiptNetOfVat(line),
        particulars: cleanOptional(line.particulars) ?? cleanOptional(line.collectionType),
        partyCode: cleanOptional(line.partyCode),
        partyName: cleanOptional(line.partyName) ?? cleanOptional(line.customerName),
        referenceNo: cleanOptional(line.referenceNo),
        responsibilityCenter: cleanOptional(line.responsibilityCenter),
        totalReceived: calculateCollectionReceiptTotalReceived(line),
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
    journalEntries: createCollectionReceiptJournalEntries(syncedValues, currencyCode, exchangeRate, referenceNo),
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

function createCollectionReceiptJournalEntries(
  values: CollectionReceiptFormValues,
  currencyCode: string,
  exchangeRate: number,
  fallbackReferenceNo: string | null,
): CollectionReceiptJournalEntryDto[] {
  return createCollectionReceiptAccountingRows(values.lineEntries).map((entry, index) => ({
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
    referenceType: "CR",
    refNo: cleanOptional(entry.referenceNo) ?? fallbackReferenceNo,
    responsibilityCenter: cleanOptional(entry.responsibilityCenter),
    vatType: cleanOptional(entry.vatType),
  }));
}

function createFormValuesFromRecord(record: CollectionReceiptRecord): CollectionReceiptFormValues {
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

function mapStatusFromApi(value: CollectionReceiptResponseDtoStatus): CollectionReceiptStatus {
  return StatusFromApi[value] ?? "Draft";
}

function mapStatusToApi(value: CollectionReceiptStatus): UpdateCollectionReceiptStatusDto["status"] {
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
