import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  CollectionReceiptCopyFromRecord,
  CollectionReceiptFormValues,
  CollectionReceiptLineEntry,
  CollectionReceiptRecord,
  CollectionReceiptStatus,
  CollectionReceiptTotals,
} from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";

export const CollectionReceiptStorageKey = "gr8books.collection-receipt.receipts";

export const CollectionReceiptPaymentTypeOptions = [
  { name: "Cash", value: "Cash" },
  { name: "Check", value: "Check" },
  { name: "Bank deposit", value: "Bank deposit" },
  { name: "Online transfer", value: "Online transfer" },
];

export const CollectionReceiptCurrencyOptions = [
  { name: "PHP", value: "PHP" },
  { name: "USD", value: "USD" },
];

export const CollectionReceiptCollectionTypeOptions = [
  { name: "Customer payment", value: "Customer payment" },
  { name: "Service Revenue", value: "Service Revenue" },
  { name: "Service income", value: "Service income" },
  { name: "Advance deposit", value: "Advance deposit" },
  { name: "Rental collection", value: "Rental collection" },
];

export const CollectionReceiptVatTypeOptions = [
  { name: "Output VAT (12%)", value: "Output VAT (12%)" },
  { name: "VAT Exempt", value: "VAT Exempt" },
  { name: "Zero Rated", value: "Zero Rated" },
];

export const CollectionReceiptCwtCodeOptions = [
  { name: "WC 160", value: "WC 160" },
  { name: "WC 157", value: "WC 157" },
  { name: "WC 100", value: "WC 100" },
];

export const CollectionReceiptCopyFromRecords: CollectionReceiptCopyFromRecord[] = [];

export const CollectionReceiptCopySources = [
  "Sales invoice",
  "Statement of account",
  "Billing statement",
  "Billing invoice",
  "Customer Order",
];

export function applyCopyFromRecordToCollectionReceiptForm(
  currentValues: CollectionReceiptFormValues,
  record: CollectionReceiptCopyFromRecord,
): CollectionReceiptFormValues {
  const partyName = record.partyName || record.customerName || currentValues.customerName;
  const partyCode = record.partyCode || currentValues.partyCode;
  const rawAmount = typeof record.amount === "string" ? record.amount.replace(/,/g, "") : "0";
  const numAmount = Number(rawAmount) || 0;
  const formattedAmount = numAmount > 0 ? numAmount.toFixed(2) : "0.00";
  const formattedGross = numAmount > 0 ? numAmount.toFixed(4) : "0.0000";

  const lineEntries: CollectionReceiptLineEntry[] =
    record.lineEntries && record.lineEntries.length > 0
      ? record.lineEntries.map((entry) => ({ ...entry }))
      : [
          createBlankCollectionReceiptLineEntry({
            accountCode: record.accountCode || "1010",
            accountTitle: record.accountTitle || "Cash in Bank",
            collectionType: record.collectionType || "Customer payment",
            bankName: record.bankName || "",
            checkNo: record.checkNo || "",
            checkDate: record.checkDate || "",
            credit: record.credit || formattedAmount,
            customerName: partyName,
            debit: record.debit || formattedAmount,
            grossReceipt: record.grossReceipt || formattedGross,
            partyCode,
            partyName,
            referenceNo: record.sourceNo,
            vatType: record.vatType || "Output VAT (12%)",
            vatPercent: record.vatPercent || "12.00",
            cwtCode: record.cwtCode || "WC 160",
            cwtPercent: record.cwtPercent || "2.00",
            particulars: record.particulars || record.remarks || "",
            responsibilityCenter: record.responsibilityCenter || "",
            vat: record.vat || "0.0000",
            vatExempt: record.vatExempt || "0.0000",
            ewt: record.ewt || "0.0000",
          }),
        ];

  return {
    ...currentValues,
    bankName: record.bankName || lineEntries[0]?.bankName || currentValues.bankName,
    checkDate: record.checkDate || lineEntries[0]?.checkDate || currentValues.checkDate,
    checkNo: record.checkNo || lineEntries[0]?.checkNo || currentValues.checkNo,
    customerName: partyName,
    partyCode,
    paymentType: record.paymentType || currentValues.paymentType,
    paymentId: currentValues.paymentId,
    currency: record.currency || currentValues.currency,
    exchangeRate: record.exchangeRate || currentValues.exchangeRate,
    referenceNo: record.sourceNo,
    remarks: record.remarks || `Copied from ${record.source} ${record.sourceNo}`,
    lineEntries,
  };
}

export function applyCopyFromRecordsToCollectionReceiptForm(
  currentValues: CollectionReceiptFormValues,
  records: CollectionReceiptCopyFromRecord[],
): CollectionReceiptFormValues {
  if (records.length === 0) {
    return currentValues;
  }

  if (records.length === 1 && records[0]) {
    return applyCopyFromRecordToCollectionReceiptForm(currentValues, records[0]);
  }

  const firstRecord = records[0];
  if (!firstRecord) {
    return currentValues;
  }

  const partyName = firstRecord.partyName || firstRecord.customerName || currentValues.customerName;
  const partyCode = firstRecord.partyCode || currentValues.partyCode;
  const combinedRefNo = records.map((record) => record.sourceNo).join(", ");
  const combinedRemarks = records.map((record) => record.remarks || `Copied from ${record.source} ${record.sourceNo}`).join("\n");

  const lineEntries: CollectionReceiptLineEntry[] = records.flatMap((record, index) => {
    if (record.lineEntries && record.lineEntries.length > 0) {
      return record.lineEntries.map((entry, entryIndex) => ({
        ...entry,
        id: `copied-line-${record.id}-${index}-${entryIndex}-${Date.now()}`,
        referenceNo: entry.referenceNo || record.sourceNo,
      }));
    }

    const rawAmount = typeof record.amount === "string" ? record.amount.replace(/,/g, "") : "0";
    const numAmount = Number(rawAmount) || 0;
    const formattedAmount = numAmount > 0 ? numAmount.toFixed(2) : "0.00";
    const formattedGross = numAmount > 0 ? numAmount.toFixed(4) : "0.0000";

    return [
      createBlankCollectionReceiptLineEntry({
        id: `copied-line-${record.id}-${index}-${Date.now()}`,
        accountCode: record.accountCode || "1010",
        accountTitle: record.accountTitle || "Cash in Bank",
        collectionType: record.collectionType || "Customer payment",
        bankName: record.bankName || "",
        checkNo: record.checkNo || "",
        checkDate: record.checkDate || "",
        credit: record.credit || formattedAmount,
        customerName: record.partyName || record.customerName || partyName,
        debit: record.debit || formattedAmount,
        grossReceipt: record.grossReceipt || formattedGross,
        partyCode: record.partyCode || partyCode,
        partyName: record.partyName || record.customerName || partyName,
        referenceNo: record.sourceNo,
        vatType: record.vatType || "Output VAT (12%)",
        vatPercent: record.vatPercent || "12.00",
        cwtCode: record.cwtCode || "WC 160",
        cwtPercent: record.cwtPercent || "2.00",
        particulars: record.particulars || record.remarks || "",
        responsibilityCenter: record.responsibilityCenter || "",
        vat: record.vat || "0.0000",
        vatExempt: record.vatExempt || "0.0000",
        ewt: record.ewt || "0.0000",
      }),
    ];
  });

  return {
    ...currentValues,
    bankName: firstRecord.bankName || lineEntries[0]?.bankName || currentValues.bankName,
    checkDate: firstRecord.checkDate || lineEntries[0]?.checkDate || currentValues.checkDate,
    checkNo: firstRecord.checkNo || lineEntries[0]?.checkNo || currentValues.checkNo,
    customerName: partyName,
    partyCode,
    paymentType: firstRecord.paymentType || currentValues.paymentType,
    paymentId: currentValues.paymentId,
    currency: firstRecord.currency || currentValues.currency,
    exchangeRate: firstRecord.exchangeRate || currentValues.exchangeRate,
    referenceNo: combinedRefNo,
    remarks: combinedRemarks,
    lineEntries: lineEntries.length > 0 ? lineEntries : currentValues.lineEntries,
  };
}

export function createBlankCollectionReceiptLineEntry(overrides: Partial<CollectionReceiptLineEntry> = {}): CollectionReceiptLineEntry {
  return {
    id: `cr-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    accountTitle: "",
    collectionType: "",
    customerName: "",
    partyCode: "",
    bankName: "",
    checkNo: "",
    checkDate: "",
    grossReceipt: "0.0000",
    vatType: "Output VAT (12%)",
    vatPercent: "12.00",
    cwtCode: "WC 160",
    cwtPercent: "2.00",
    partyName: "",
    particulars: "",
    responsibilityCenter: "",
    vatExempt: "0.0000",
    vat: "0.0000",
    ewt: "0.0000",
    debit: "0.00",
    credit: "0.00",
    referenceNo: "",
    ...overrides,
  };
}

export function createCollectionReceiptFormValues(): CollectionReceiptFormValues {
  return {
    receiptNo: "",
    receiptDate: new Date().toLocaleDateString("en-CA"),
    referenceNo: "",
    customerName: "",
    partyCode: "",
    paymentType: "",
    paymentId: "",
    bankName: "",
    checkNo: "",
    checkDate: "",
    currency: "PHP",
    exchangeRate: "1.0000",
    status: "Draft",
    remarks: "",
    attachments: [],
    lineEntries: [
      createBlankCollectionReceiptLineEntry({
        accountCode: "1010103001",
        accountTitle: "Cash in Bank",
      }),
    ],
  };
}

export function createCollectionReceiptFormValuesFromRecord(record: CollectionReceiptRecord): CollectionReceiptFormValues {
  if (record.formValues) {
    const firstEntry = record.formValues.lineEntries[0];

    return {
      ...record.formValues,
      bankName: record.formValues.bankName ?? firstEntry?.bankName ?? "",
      checkNo: record.formValues.checkNo ?? firstEntry?.checkNo ?? "",
      checkDate: record.formValues.checkDate ?? firstEntry?.checkDate ?? "",
      attachments: record.formValues.attachments ? [...record.formValues.attachments] : [],
      lineEntries: record.formValues.lineEntries.map((entry) => ({
        ...entry,
        bankName: entry.bankName ?? "",
        checkNo: entry.checkNo ?? "",
        checkDate: entry.checkDate ?? "",
        partyName: entry.partyName ?? entry.customerName ?? "",
        vatType: entry.vatType ?? "Output VAT (12%)",
        vatPercent: entry.vatPercent ?? "12.00",
        cwtCode: entry.cwtCode ?? "WC 160",
        cwtPercent: entry.cwtPercent ?? "2.00",
        particulars: entry.particulars ?? "",
        responsibilityCenter: entry.responsibilityCenter ?? "",
      })),
    };
  }

  return {
    ...createCollectionReceiptFormValues(),
    receiptNo: record.receiptNo,
    receiptDate: record.receiptDate,
    referenceNo: record.referenceNo,
    customerName: record.customerName,
    partyCode: record.partyCode ?? "",
    bankName: "",
    checkNo: "",
    checkDate: "",
    status: record.status,
    attachments: [],
    lineEntries: [
      createBlankCollectionReceiptLineEntry({
        collectionType: record.collectionType,
        customerName: record.customerName,
        partyCode: record.partyCode ?? "",
        partyName: record.customerName,
        bankName: "",
        checkNo: "",
        checkDate: "",
        credit: record.amount.toFixed(2),
        grossReceipt: record.amount.toFixed(4),
        referenceNo: record.referenceNo,
      }),
    ],
  };
}

export function createCollectionReceiptRecordFromForm(
  values: CollectionReceiptFormValues,
  existingRecord?: CollectionReceiptRecord,
): CollectionReceiptRecord {
  const syncedValues = syncCollectionReceiptCheckDetails(values);
  const totals = calculateCollectionReceiptTotals(syncedValues.lineEntries);
  const firstEntry = syncedValues.lineEntries[0];
  const amount = Math.max(totals.grossReceipt, totals.debit, totals.credit);

  return {
    id: existingRecord?.id ?? `cr-${Date.now()}`,
    amount,
    collectionType: firstEntry?.collectionType || "Customer payment",
    customerName: syncedValues.customerName || firstEntry?.customerName || "",
    partyCode: syncedValues.partyCode || firstEntry?.partyCode || "",
    formValues: {
      ...syncedValues,
      lineEntries: syncedValues.lineEntries.map((entry) => ({ ...entry })),
    },
    receiptDate: syncedValues.receiptDate,
    receiptNo: syncedValues.receiptNo,
    referenceNo: syncedValues.referenceNo || firstEntry?.referenceNo || "",
    status: normalizeCollectionReceiptStatus(syncedValues.status),
  };
}

export function syncCollectionReceiptCheckDetails(values: CollectionReceiptFormValues): CollectionReceiptFormValues {
  return {
    ...values,
    lineEntries: values.lineEntries.map((entry) => ({
      ...entry,
      bankName: values.bankName,
      checkDate: values.checkDate,
      checkNo: values.checkNo,
      customerName: entry.customerName || values.customerName,
      partyCode: entry.partyCode || values.partyCode,
      partyName: entry.partyName || values.customerName,
    })),
  };
}

export function calculateCollectionReceiptTotals(entries: CollectionReceiptLineEntry[]): CollectionReceiptTotals {
  return entries.reduce(
    (summary, entry) => {
      const grossReceipt = parseMoneyNumberInput(entry.grossReceipt);
      const vat = calculateCollectionReceiptVatAmount(entry);
      const ewt = calculateCollectionReceiptCwtAmount(entry);
      const netOfVat = calculateCollectionReceiptNetOfVat(entry);

      return {
        credit: summary.credit + vat + netOfVat,
        debit: summary.debit + calculateCollectionReceiptTotalReceived(entry) + ewt,
        ewt: summary.ewt + ewt,
        grossReceipt: summary.grossReceipt + grossReceipt,
        vat: summary.vat + vat,
        vatExempt: summary.vatExempt + parseMoneyNumberInput(entry.vatExempt),
      };
    },
    {
      credit: 0,
      debit: 0,
      ewt: 0,
      grossReceipt: 0,
      vat: 0,
      vatExempt: 0,
    },
  );
}

export function calculateCollectionReceiptVatAmount(entry: CollectionReceiptLineEntry) {
  const grossReceipt = parseMoneyNumberInput(entry.grossReceipt);
  const vatPercent = parseMoneyNumberInput(entry.vatPercent);

  return roundCollectionReceiptAmount(grossReceipt * (vatPercent / 100));
}

export function calculateCollectionReceiptCwtAmount(entry: CollectionReceiptLineEntry) {
  const grossReceipt = parseMoneyNumberInput(entry.grossReceipt);
  const cwtPercent = parseMoneyNumberInput(entry.cwtPercent);

  return roundCollectionReceiptAmount(grossReceipt * (cwtPercent / 100));
}

export function calculateCollectionReceiptNetOfVat(entry: CollectionReceiptLineEntry) {
  return Math.max(parseMoneyNumberInput(entry.grossReceipt) - calculateCollectionReceiptVatAmount(entry), 0);
}

export function calculateCollectionReceiptTotalReceived(entry: CollectionReceiptLineEntry) {
  return Math.max(parseMoneyNumberInput(entry.grossReceipt) - calculateCollectionReceiptCwtAmount(entry), 0);
}

function roundCollectionReceiptAmount(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatCollectionReceiptAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCollectionReceiptCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatCollectionReceiptDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function countCollectionReceiptsByStatus(receipts: CollectionReceiptRecord[], status: CollectionReceiptStatus) {
  return receipts.filter((receipt) => receipt.status === status).length;
}

export function isCollectionReceiptActiveStatus(status: CollectionReceiptStatus) {
  return status === "For Approval" || status === "Posted";
}

export function formatCollectionReceiptPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function collectionReceiptEntryHasData(entry: CollectionReceiptLineEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.collectionType.trim() !== "" ||
    entry.customerName.trim() !== "" ||
    entry.partyName.trim() !== "" ||
    entry.bankName.trim() !== "" ||
    entry.checkNo.trim() !== "" ||
    entry.checkDate.trim() !== "" ||
    entry.vatType.trim() !== "" ||
    entry.cwtCode.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    entry.responsibilityCenter.trim() !== "" ||
    entry.referenceNo.trim() !== "" ||
    parseMoneyNumberInput(entry.grossReceipt) > 0 ||
    parseMoneyNumberInput(entry.vatExempt) > 0 ||
    parseMoneyNumberInput(entry.vat) > 0 ||
    parseMoneyNumberInput(entry.ewt) > 0 ||
    parseMoneyNumberInput(entry.vatPercent) > 0 ||
    parseMoneyNumberInput(entry.cwtPercent) > 0 ||
    parseMoneyNumberInput(entry.debit) > 0 ||
    parseMoneyNumberInput(entry.credit) > 0
  );
}

export function collectionReceiptEntryIsComplete(entry: CollectionReceiptLineEntry) {
  return (
    entry.collectionType.trim() !== "" &&
    (entry.customerName.trim() !== "" || entry.partyName.trim() !== "") &&
    (parseMoneyNumberInput(entry.grossReceipt) > 0 || parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0)
  );
}

export function shouldClearCollectionReceiptEntry(entry: CollectionReceiptLineEntry, action: "incomplete" | "no-data" | "with-data") {
  if (action === "with-data") {
    return collectionReceiptEntryHasData(entry);
  }

  if (action === "incomplete") {
    return collectionReceiptEntryHasData(entry) && !collectionReceiptEntryIsComplete(entry);
  }

  return !collectionReceiptEntryHasData(entry);
}

export function createCollectionReceiptAccountingRows(rows: CollectionReceiptLineEntry[]) {
  return rows.flatMap((row) => {
    const grossReceipt = parseMoneyNumberInput(row.grossReceipt);

    if (grossReceipt <= 0) {
      return [];
    }

    const netOfVat = calculateCollectionReceiptNetOfVat(row);
    const vatAmount = calculateCollectionReceiptVatAmount(row);
    const cwtAmount = calculateCollectionReceiptCwtAmount(row);
    const totalReceived = calculateCollectionReceiptTotalReceived(row);
    const commonFields = {
      bankName: row.bankName,
      checkDate: row.checkDate,
      checkNo: row.checkNo,
      collectionType: row.collectionType,
      customerName: row.partyName || row.customerName,
      cwtCode: row.cwtCode,
      cwtPercent: row.cwtPercent,
      grossReceipt: row.grossReceipt,
      particulars: row.particulars || row.collectionType,
      partyCode: row.partyCode,
      partyName: row.partyName || row.customerName,
      referenceNo: row.referenceNo,
      responsibilityCenter: row.responsibilityCenter,
      vat: formatCollectionReceiptAmount(vatAmount),
      vatExempt: row.vatExempt,
      vatPercent: row.vatPercent,
      vatType: row.vatType,
      ewt: formatCollectionReceiptAmount(cwtAmount),
    } satisfies Omit<CollectionReceiptLineEntry, "accountCode" | "accountTitle" | "credit" | "debit" | "id">;

    return [
      {
        ...commonFields,
        id: `${row.id}-cash`,
        accountCode: "1010103001",
        accountTitle: "Cash in Bank",
        debit: totalReceived.toFixed(2),
        credit: "0.00",
      },
      ...(cwtAmount > 0
        ? [
            {
              ...commonFields,
              id: `${row.id}-cwt`,
              accountCode: "1010104008",
              accountTitle: "Creditable Withholding Tax",
              debit: cwtAmount.toFixed(2),
              credit: "0.00",
            },
          ]
        : []),
      ...(vatAmount > 0
        ? [
            {
              ...commonFields,
              id: `${row.id}-vat`,
              accountCode: "2010002005",
              accountTitle: "Output VAT",
              debit: "0.00",
              credit: vatAmount.toFixed(2),
            },
          ]
        : []),
      {
        ...commonFields,
        id: `${row.id}-revenue`,
        accountCode: "4020000001",
        accountTitle: row.collectionType || "Service Revenue",
        debit: "0.00",
        credit: netOfVat.toFixed(2),
      },
    ];
  });
}

function normalizeCollectionReceiptStatus(value: string): CollectionReceiptStatus {
  const statuses: CollectionReceiptStatus[] = ["Cancelled", "Disapproved", "Draft", "For Approval", "Posted"];

  return statuses.includes(value as CollectionReceiptStatus) ? (value as CollectionReceiptStatus) : "Draft";
}
