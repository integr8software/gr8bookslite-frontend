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
import { calculateOfficialReceiptTotals } from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
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

export async function fetchCollectionReceiptNumberSuggestion(
  branchUnitId?: number | null,
): Promise<CollectionReceiptNumberSuggestion> {
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
    paymentType: "",
    receiptDate: receipt.documentDate,
    receiptNo: receipt.receiptNo ?? receipt.transactionNo,
    referenceNo: receipt.referenceNo ?? "",
    remarks: receipt.remarks ?? "",
    status: mapStatusFromApi(receipt.status),
  };
}

function createLineEntriesFromApi(receipt: CollectionReceiptResponseDto): CollectionReceiptFormValues["lineEntries"] {
  if (receipt.details.length === 0) {
    return receipt.journalEntries.map((entry) => ({
      accountCode: entry.accountCode,
      accountTitle: entry.accountTitle,
      bankName: "",
      checkDate: "",
      checkNo: "",
      collectionType: entry.particulars ?? "",
      credit: entry.credit.toFixed(2),
      customerName: entry.partyName ?? receipt.customerName,
      debit: entry.debit.toFixed(2),
      ewt: "0.0000",
      grossReceipt: Math.max(entry.debit, entry.credit).toFixed(4),
      id: entry.id,
      partyCode: entry.partyCode ?? receipt.customerCode,
      referenceNo: entry.refNo ?? receipt.referenceNo ?? "",
      vat: "0.0000",
      vatExempt: "0.0000",
    }));
  }

  return receipt.details.map((detail, index) => {
    const pairedJournalEntries = getJournalEntriesForDetail(receipt, index, detail.lineNumber);
    const accountEntry = pairedJournalEntries.find((entry) => entry.accountCode.trim() !== "") ?? receipt.journalEntries[0];
    const debit = pairedJournalEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const credit = pairedJournalEntries.reduce((sum, entry) => sum + entry.credit, 0);

    return {
      accountCode: accountEntry?.accountCode ?? "",
      accountTitle: accountEntry?.accountTitle ?? "",
      bankName: "",
      checkDate: "",
      checkNo: "",
      collectionType: detail.description,
      credit: credit.toFixed(2),
      customerName: accountEntry?.partyName ?? receipt.customerName,
      debit: debit.toFixed(2),
      ewt: detail.ewtAmount.toFixed(4),
      grossReceipt: detail.grossAmount.toFixed(4),
      id: detail.id,
      partyCode: accountEntry?.partyCode ?? receipt.customerCode,
      referenceNo: accountEntry?.refNo ?? receipt.referenceNo ?? "",
      vat: detail.vatAmount.toFixed(4),
      vatExempt: "0.0000",
    };
  });
}

function getJournalEntriesForDetail(
  receipt: CollectionReceiptResponseDto,
  detailIndex: number,
  detailLineNumber: number,
) {
  const pairedEntries = receipt.journalEntries.slice(detailIndex * 2, detailIndex * 2 + 2);

  if (pairedEntries.length > 0) {
    return pairedEntries;
  }

  return receipt.journalEntries.filter((entry) => entry.lineNumber === detailLineNumber);
}

function toApiCollectionReceiptPayload(
  values: CollectionReceiptFormValues,
  branchUnitId?: number | null,
): CreateCollectionReceiptDto {
  const currencyCode = values.currency.trim();
  const exchangeRate = toExchangeRate(values.exchangeRate);
  const totals = calculateOfficialReceiptTotals(values.lineEntries);
  const referenceNo = cleanOptional(values.referenceNo);
  const firstLine = values.lineEntries[0];

  return {
    address: null,
    billToName: cleanOptional(values.customerName),
    branchUnitId: branchUnitId ?? undefined,
    businessStyle: null,
    contactNo: null,
    contactPerson: null,
    currency: currencyCode,
    customerCode: values.partyCode.trim(),
    customerName: values.customerName.trim(),
    details: values.lineEntries.map((line, index) => {
      const grossReceipt = toNumber(line.grossReceipt);
      const vatAmount = toNumber(line.vat);
      const ewtAmount = toNumber(line.ewt);

      return {
        amount: grossReceipt,
        description: line.collectionType.trim() || "Collection",
        discountAmount: 0,
        discountPercent: 0,
        ewtAmount,
        ewtType: null,
        grossAmount: grossReceipt,
        lineNumber: index + 1,
        netAmount: Math.max(grossReceipt - vatAmount, 0),
        particulars: cleanOptional(line.collectionType),
        quantity: 1,
        responsibilityCenter: null,
        vatAmount,
        vatInclusive: false,
        vatType: null,
        vatable: vatAmount > 0,
        withEwt: ewtAmount > 0,
        withWvat: false,
        wvatAmount: 0,
        wvatType: null,
      };
    }),
    discountAmount: 0,
    documentDate: values.receiptDate,
    dueDate: values.receiptDate,
    ewtAmount: totals.ewt,
    exchangeRate,
    grossAmount: totals.grossReceipt,
    journalEntries: createCollectionReceiptJournalEntries(values, currencyCode, exchangeRate, referenceNo),
    netAmount: Math.max(totals.grossReceipt - totals.vat, 0),
    projectCode: null,
    projectName: null,
    projectRef: null,
    receivableAccountCode: firstLine?.accountCode.trim() || "1010",
    receivableAccountTitle: firstLine?.accountTitle.trim() || "Cash in Bank",
    receiptNo: cleanOptional(values.receiptNo),
    referenceNo,
    remarks: cleanOptional(values.remarks),
    salesAssociate: null,
    teamAssigned: null,
    termId: null,
    terms: null,
    transactionNo: cleanOptional(values.receiptNo),
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
  const journalEntries: CollectionReceiptJournalEntryDto[] = [];

  for (const entry of values.lineEntries) {
    const debit = toNumber(entry.debit);
    const credit = toNumber(entry.credit);
    const fallbackAmount = Math.max(toNumber(entry.grossReceipt), 0);

    if (debit > 0) {
      journalEntries.push(createJournalEntry(entry, journalEntries.length + 1, currencyCode, exchangeRate, fallbackReferenceNo, debit, 0));
    }

    if (credit > 0) {
      journalEntries.push(createJournalEntry(entry, journalEntries.length + 1, currencyCode, exchangeRate, fallbackReferenceNo, 0, credit));
    }

    if (debit <= 0 && credit <= 0 && fallbackAmount > 0) {
      journalEntries.push(createJournalEntry(entry, journalEntries.length + 1, currencyCode, exchangeRate, fallbackReferenceNo, fallbackAmount, 0));
      journalEntries.push(createJournalEntry(entry, journalEntries.length + 1, currencyCode, exchangeRate, fallbackReferenceNo, 0, fallbackAmount));
    }
  }

  const totals = journalEntries.reduce(
    (summary, entry) => ({
      credit: summary.credit + entry.credit,
      debit: summary.debit + entry.debit,
    }),
    { credit: 0, debit: 0 },
  );
  const balancingSource = values.lineEntries[0];

  if (balancingSource && totals.debit > totals.credit) {
    journalEntries.push(
      createJournalEntry(balancingSource, journalEntries.length + 1, currencyCode, exchangeRate, fallbackReferenceNo, 0, totals.debit - totals.credit),
    );
  }

  if (balancingSource && totals.credit > totals.debit) {
    journalEntries.push(
      createJournalEntry(balancingSource, journalEntries.length + 1, currencyCode, exchangeRate, fallbackReferenceNo, totals.credit - totals.debit, 0),
    );
  }

  return journalEntries;
}

function createJournalEntry(
  entry: CollectionReceiptFormValues["lineEntries"][number],
  lineNumber: number,
  currencyCode: string,
  exchangeRate: number,
  fallbackReferenceNo: string | null,
  debit: number,
  credit: number,
): CollectionReceiptJournalEntryDto {
  return {
    accountCode: entry.accountCode.trim(),
    accountTitle: entry.accountTitle.trim(),
    atcCode: null,
    credit,
    currencyCode,
    debit,
    exchangeRate,
    lineNumber,
    particulars: cleanOptional(entry.collectionType),
    partyCode: cleanOptional(entry.partyCode),
    partyName: cleanOptional(entry.customerName),
    referenceType: "CR",
    refNo: cleanOptional(entry.referenceNo) ?? fallbackReferenceNo,
    responsibilityCenter: null,
    vatType: null,
  };
}

function createFormValuesFromRecord(record: CollectionReceiptRecord): CollectionReceiptFormValues {
  return {
    currency: "PHP",
    customerName: record.customerName,
    exchangeRate: "1.0000",
    lineEntries: record.formValues?.lineEntries ?? [],
    partyCode: record.partyCode,
    paymentType: record.formValues?.paymentType ?? "",
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
