import {
  acknowledgementReceiptControllerCreateV1,
  acknowledgementReceiptControllerFindAllV1,
  acknowledgementReceiptControllerFindOneV1,
  acknowledgementReceiptControllerSuggestTransactionNumberV1,
  acknowledgementReceiptControllerUpdateStatusV1,
  acknowledgementReceiptControllerUpdateV1,
} from "@/app/src/generated/api/acknowledgement-receipt/acknowledgement-receipt";
import type {
  CreateAcknowledgementReceiptDto,
  AcknowledgementReceiptJournalEntryDto,
  AcknowledgementReceiptControllerFindAllV1Params,
  AcknowledgementReceiptResponseDto,
  AcknowledgementReceiptResponseDtoStatus,
  UpdateAcknowledgementReceiptStatusDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  createAcknowledgementReceiptAccountingRows,
  calculateAcknowledgementReceiptCwtAmount,
  calculateAcknowledgementReceiptNetOfVat,
  calculateAcknowledgementReceiptTotalReceived,
  calculateAcknowledgementReceiptTotals,
  calculateAcknowledgementReceiptVatAmount,
  syncAcknowledgementReceiptCheckDetails,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AcknowledgementReceiptFormValues,
  AcknowledgementReceiptRecord,
  AcknowledgementReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";

export type AcknowledgementReceiptListData = Awaited<ReturnType<typeof acknowledgementReceiptControllerFindAllV1>>;
export type AcknowledgementReceiptNumberSuggestion = Awaited<ReturnType<typeof acknowledgementReceiptControllerSuggestTransactionNumberV1>>;

type AcknowledgementReceiptListQuery = {
  amountFrom?: number | null;
  amountTo?: number | null;
  branchUnitId?: number | null;
  documentDateFrom?: string | null;
  documentDateTo?: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  sortBy?: AcknowledgementReceiptControllerFindAllV1Params["sortBy"];
  sortDirection?: AcknowledgementReceiptControllerFindAllV1Params["sortDirection"];
  status?: AcknowledgementReceiptStatus | "all" | null;
};

const StatusFromApi: Record<string, AcknowledgementReceiptStatus> = {
  CANCELLED: "Cancelled",
  DISAPPROVED: "Disapproved",
  DRAFT: "Draft",
  FOR_APPROVAL: "For Approval",
  POSTED: "Posted",
};

const StatusToApi: Record<AcknowledgementReceiptStatus, UpdateAcknowledgementReceiptStatusDto["status"]> = {
  Cancelled: "CANCELLED",
  Disapproved: "DISAPPROVED",
  Draft: "DRAFT",
  "For Approval": "FOR_APPROVAL",
  Posted: "POSTED",
};

export async function fetchAcknowledgementReceipts(query: AcknowledgementReceiptListQuery = {}): Promise<AcknowledgementReceiptListData> {
  return acknowledgementReceiptControllerFindAllV1(
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

export async function fetchAcknowledgementReceipt(
  id: string,
  query: Pick<AcknowledgementReceiptListQuery, "branchUnitId"> = {},
): Promise<AcknowledgementReceiptRecord> {
  const response = await acknowledgementReceiptControllerFindOneV1(id, cleanQueryParams({ branchUnitId: query.branchUnitId }));

  return mapApiAcknowledgementReceipt(response.receipt);
}

export async function fetchAcknowledgementReceiptNumberSuggestion(
  branchUnitId?: number | null,
): Promise<AcknowledgementReceiptNumberSuggestion> {
  return acknowledgementReceiptControllerSuggestTransactionNumberV1(cleanQueryParams({ branchUnitId }));
}

export async function createAcknowledgementReceipt(
  values: AcknowledgementReceiptFormValues,
  branchUnitId?: number | null,
): Promise<AcknowledgementReceiptRecord> {
  const response = await acknowledgementReceiptControllerCreateV1(toApiAcknowledgementReceiptPayload(values, branchUnitId));

  return mapApiAcknowledgementReceipt(response.receipt);
}

export async function updateAcknowledgementReceipt(
  record: AcknowledgementReceiptRecord,
  branchUnitId?: number | null,
): Promise<AcknowledgementReceiptRecord> {
  const response = await acknowledgementReceiptControllerUpdateV1(
    record.id,
    toApiAcknowledgementReceiptPayload(record.formValues ?? createFormValuesFromRecord(record), branchUnitId),
  );

  return mapApiAcknowledgementReceipt(response.receipt);
}

export async function updateAcknowledgementReceiptStatus(input: {
  recordId: string;
  status: AcknowledgementReceiptStatus;
}): Promise<AcknowledgementReceiptRecord> {
  const response = await acknowledgementReceiptControllerUpdateStatusV1(input.recordId, {
    status: mapStatusToApi(input.status),
  });

  return mapApiAcknowledgementReceipt(response.receipt);
}

export function mapApiAcknowledgementReceipt(receipt: AcknowledgementReceiptResponseDto): AcknowledgementReceiptRecord {
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

function createFormValuesFromApi(receipt: AcknowledgementReceiptResponseDto): AcknowledgementReceiptFormValues {
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

function createLineEntriesFromApi(receipt: AcknowledgementReceiptResponseDto): AcknowledgementReceiptFormValues["lineEntries"] {
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

function toApiAcknowledgementReceiptPayload(
  values: AcknowledgementReceiptFormValues,
  branchUnitId?: number | null,
): CreateAcknowledgementReceiptDto {
  const syncedValues = syncAcknowledgementReceiptCheckDetails(values);
  const currencyCode = values.currency.trim();
  const exchangeRate = toExchangeRate(values.exchangeRate);
  const totals = calculateAcknowledgementReceiptTotals(syncedValues.lineEntries);
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
      const vatAmount = calculateAcknowledgementReceiptVatAmount(line);
      const ewtAmount = calculateAcknowledgementReceiptCwtAmount(line);

      return {
        cwtCode: cleanOptional(line.cwtCode),
        cwtPercent: toNumber(line.cwtPercent),
        description: line.collectionType.trim() || "Collection",
        ewtAmount,
        grossAmount: grossReceipt,
        lineNumber: index + 1,
        netAmount: calculateAcknowledgementReceiptNetOfVat(line),
        particulars: cleanOptional(line.particulars) ?? cleanOptional(line.collectionType),
        partyCode: cleanOptional(line.partyCode),
        partyName: cleanOptional(line.partyName) ?? cleanOptional(line.customerName),
        referenceNo: cleanOptional(line.referenceNo),
        responsibilityCenter: cleanOptional(line.responsibilityCenter),
        totalReceived: calculateAcknowledgementReceiptTotalReceived(line),
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
    journalEntries: createAcknowledgementReceiptJournalEntries(syncedValues, currencyCode, exchangeRate, referenceNo),
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

function createAcknowledgementReceiptJournalEntries(
  values: AcknowledgementReceiptFormValues,
  currencyCode: string,
  exchangeRate: number,
  fallbackReferenceNo: string | null,
): AcknowledgementReceiptJournalEntryDto[] {
  return createAcknowledgementReceiptAccountingRows(values.lineEntries).map((entry, index) => ({
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
    referenceType: "AR",
    refNo: cleanOptional(entry.referenceNo) ?? fallbackReferenceNo,
    responsibilityCenter: cleanOptional(entry.responsibilityCenter),
    vatType: cleanOptional(entry.vatType),
  }));
}

function createFormValuesFromRecord(record: AcknowledgementReceiptRecord): AcknowledgementReceiptFormValues {
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

function mapStatusFromApi(value: AcknowledgementReceiptResponseDtoStatus): AcknowledgementReceiptStatus {
  return StatusFromApi[value] ?? "Draft";
}

function mapStatusToApi(value: AcknowledgementReceiptStatus): UpdateAcknowledgementReceiptStatusDto["status"] {
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
