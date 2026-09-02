import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  ProvisionalReceiptCopyFromRecord,
  ProvisionalReceiptFormValues,
  ProvisionalReceiptLineEntry,
  ProvisionalReceiptRecord,
  ProvisionalReceiptStatus,
  ProvisionalReceiptTotals,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";

export const ProvisionalReceiptStorageKey = "gr8books.provisional-receipt.receipts";

export const ProvisionalReceiptPaymentTypeOptions = [
  { name: "Cash", value: "Cash" },
  { name: "Check", value: "Check" },
  { name: "Bank deposit", value: "Bank deposit" },
  { name: "Online transfer", value: "Online transfer" },
];

export const ProvisionalReceiptCurrencyOptions = [
  { name: "PHP", value: "PHP" },
  { name: "USD", value: "USD" },
];

export const ProvisionalReceiptCollectionTypeOptions = [
  { name: "Customer payment", value: "Customer payment" },
  { name: "Service Revenue", value: "Service Revenue" },
  { name: "Service income", value: "Service income" },
  { name: "Advance deposit", value: "Advance deposit" },
  { name: "Rental collection", value: "Rental collection" },
];

export const ProvisionalReceiptVatTypeOptions = [
  { name: "Output VAT (12%)", value: "Output VAT (12%)" },
  { name: "VAT Exempt", value: "VAT Exempt" },
  { name: "Zero Rated", value: "Zero Rated" },
];

export const ProvisionalReceiptCwtCodeOptions = [
  { name: "WC 160", value: "WC 160" },
  { name: "WC 157", value: "WC 157" },
  { name: "WC 100", value: "WC 100" },
];

export const ProvisionalReceiptCopyFromRecords: ProvisionalReceiptCopyFromRecord[] = [];

export const ProvisionalReceiptCopySources = [
  "Sales invoice",
  "Statement of account",
  "Billing statement",
  "Billing invoice",
  "Customer Order",
];

export function applyCopyFromRecordToProvisionalReceiptForm(
  currentValues: ProvisionalReceiptFormValues,
  record: ProvisionalReceiptCopyFromRecord,
): ProvisionalReceiptFormValues {
  const partyName = record.partyName || record.customerName || currentValues.customerName;
  const partyCode = record.partyCode || currentValues.partyCode;
  const rawAmount = typeof record.amount === "string" ? record.amount.replace(/,/g, "") : "0";
  const numAmount = Number(rawAmount) || 0;
  const formattedAmount = numAmount > 0 ? numAmount.toFixed(2) : "0.00";
  const formattedGross = numAmount > 0 ? numAmount.toFixed(4) : "0.0000";

  const lineEntries: ProvisionalReceiptLineEntry[] =
    record.lineEntries && record.lineEntries.length > 0
      ? record.lineEntries.map((entry) => ({ ...entry }))
      : [
          createBlankProvisionalReceiptLineEntry({
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

export function applyCopyFromRecordsToProvisionalReceiptForm(
  currentValues: ProvisionalReceiptFormValues,
  records: ProvisionalReceiptCopyFromRecord[],
): ProvisionalReceiptFormValues {
  if (records.length === 0) {
    return currentValues;
  }

  if (records.length === 1 && records[0]) {
    return applyCopyFromRecordToProvisionalReceiptForm(currentValues, records[0]);
  }

  const firstRecord = records[0];
  if (!firstRecord) {
    return currentValues;
  }

  const partyName = firstRecord.partyName || firstRecord.customerName || currentValues.customerName;
  const partyCode = firstRecord.partyCode || currentValues.partyCode;
  const combinedRefNo = records.map((record) => record.sourceNo).join(", ");
  const combinedRemarks = records.map((record) => record.remarks || `Copied from ${record.source} ${record.sourceNo}`).join("\n");

  const lineEntries: ProvisionalReceiptLineEntry[] = records.flatMap((record, index) => {
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
      createBlankProvisionalReceiptLineEntry({
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

export function createBlankProvisionalReceiptLineEntry(overrides: Partial<ProvisionalReceiptLineEntry> = {}): ProvisionalReceiptLineEntry {
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

export function createProvisionalReceiptFormValues(): ProvisionalReceiptFormValues {
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
      createBlankProvisionalReceiptLineEntry({
        accountCode: "1010103001",
        accountTitle: "Cash in Bank",
      }),
    ],
  };
}

export function createProvisionalReceiptFormValuesFromRecord(record: ProvisionalReceiptRecord): ProvisionalReceiptFormValues {
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
    ...createProvisionalReceiptFormValues(),
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
      createBlankProvisionalReceiptLineEntry({
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

export function createProvisionalReceiptRecordFromForm(
  values: ProvisionalReceiptFormValues,
  existingRecord?: ProvisionalReceiptRecord,
): ProvisionalReceiptRecord {
  const syncedValues = syncProvisionalReceiptCheckDetails(values);
  const totals = calculateProvisionalReceiptTotals(syncedValues.lineEntries);
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
    status: normalizeProvisionalReceiptStatus(syncedValues.status),
  };
}

export function syncProvisionalReceiptCheckDetails(values: ProvisionalReceiptFormValues): ProvisionalReceiptFormValues {
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

export function calculateProvisionalReceiptTotals(entries: ProvisionalReceiptLineEntry[]): ProvisionalReceiptTotals {
  return entries.reduce(
    (summary, entry) => {
      const grossReceipt = parseMoneyNumberInput(entry.grossReceipt);
      const vat = calculateProvisionalReceiptVatAmount(entry);
      const ewt = calculateProvisionalReceiptCwtAmount(entry);
      const netOfVat = calculateProvisionalReceiptNetOfVat(entry);

      return {
        credit: summary.credit + vat + netOfVat,
        debit: summary.debit + calculateProvisionalReceiptTotalReceived(entry) + ewt,
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

export function calculateProvisionalReceiptVatAmount(entry: ProvisionalReceiptLineEntry) {
  const grossReceipt = parseMoneyNumberInput(entry.grossReceipt);
  const vatPercent = parseMoneyNumberInput(entry.vatPercent);

  return roundProvisionalReceiptAmount(grossReceipt * (vatPercent / 100));
}

export function calculateProvisionalReceiptCwtAmount(entry: ProvisionalReceiptLineEntry) {
  const grossReceipt = parseMoneyNumberInput(entry.grossReceipt);
  const cwtPercent = parseMoneyNumberInput(entry.cwtPercent);

  return roundProvisionalReceiptAmount(grossReceipt * (cwtPercent / 100));
}

export function calculateProvisionalReceiptNetOfVat(entry: ProvisionalReceiptLineEntry) {
  return Math.max(parseMoneyNumberInput(entry.grossReceipt) - calculateProvisionalReceiptVatAmount(entry), 0);
}

export function calculateProvisionalReceiptTotalReceived(entry: ProvisionalReceiptLineEntry) {
  return Math.max(parseMoneyNumberInput(entry.grossReceipt) - calculateProvisionalReceiptCwtAmount(entry), 0);
}

function roundProvisionalReceiptAmount(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatProvisionalReceiptAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatProvisionalReceiptCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatProvisionalReceiptDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function countProvisionalReceiptsByStatus(receipts: ProvisionalReceiptRecord[], status: ProvisionalReceiptStatus) {
  return receipts.filter((receipt) => receipt.status === status).length;
}

export function isProvisionalReceiptActiveStatus(status: ProvisionalReceiptStatus) {
  return status === "For Approval" || status === "Posted";
}

export function formatProvisionalReceiptPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function provisionalReceiptEntryHasData(entry: ProvisionalReceiptLineEntry) {
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

export function provisionalReceiptEntryIsComplete(entry: ProvisionalReceiptLineEntry) {
  return (
    entry.collectionType.trim() !== "" &&
    (entry.customerName.trim() !== "" || entry.partyName.trim() !== "") &&
    (parseMoneyNumberInput(entry.grossReceipt) > 0 || parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0)
  );
}

export function shouldClearProvisionalReceiptEntry(entry: ProvisionalReceiptLineEntry, action: "incomplete" | "no-data" | "with-data") {
  if (action === "with-data") {
    return provisionalReceiptEntryHasData(entry);
  }

  if (action === "incomplete") {
    return provisionalReceiptEntryHasData(entry) && !provisionalReceiptEntryIsComplete(entry);
  }

  return !provisionalReceiptEntryHasData(entry);
}

export function createProvisionalReceiptAccountingRows(rows: ProvisionalReceiptLineEntry[]) {
  return rows.flatMap((row) => {
    const grossReceipt = parseMoneyNumberInput(row.grossReceipt);

    if (grossReceipt <= 0) {
      return [];
    }

    const netOfVat = calculateProvisionalReceiptNetOfVat(row);
    const vatAmount = calculateProvisionalReceiptVatAmount(row);
    const cwtAmount = calculateProvisionalReceiptCwtAmount(row);
    const totalReceived = calculateProvisionalReceiptTotalReceived(row);
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
      vat: formatProvisionalReceiptAmount(vatAmount),
      vatExempt: row.vatExempt,
      vatPercent: row.vatPercent,
      vatType: row.vatType,
      ewt: formatProvisionalReceiptAmount(cwtAmount),
    } satisfies Omit<ProvisionalReceiptLineEntry, "accountCode" | "accountTitle" | "credit" | "debit" | "id">;

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

function normalizeProvisionalReceiptStatus(value: string): ProvisionalReceiptStatus {
  const statuses: ProvisionalReceiptStatus[] = ["Cancelled", "Disapproved", "Draft", "For Approval", "Posted"];

  return statuses.includes(value as ProvisionalReceiptStatus) ? (value as ProvisionalReceiptStatus) : "Draft";
}
