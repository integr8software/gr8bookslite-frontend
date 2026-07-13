import { BeginningBalanceUploaderColumns } from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import type {
  BeginningBalanceUploaderField,
  BeginningBalanceUploaderFormValues,
  BeginningBalanceUploaderRecord,
  BeginningBalanceUploaderRow,
  BeginningBalanceUploaderTotals,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

export const BeginningBalanceUploaderInitialRows: BeginningBalanceUploaderRow[] = [
  createBeginningBalanceUploaderRow("1"),
];

export const BeginningBalanceUploaderInitialFormValues: BeginningBalanceUploaderFormValues = {
  currencyRate: "1.00",
  currencyType: "PHP",
  documentDate: new Date().toISOString().slice(0, 10),
  remarks: "",
  rows: BeginningBalanceUploaderInitialRows,
  transactionNumber: "Generated on save",
};

export const MockBeginningBalanceUploaderRecords: BeginningBalanceUploaderRecord[] = [
  createMockRecord({
    id: "beginning-balance-001",
    transactionNumber: "BB-2026-0001",
    documentDate: "2026-01-01",
    remarks: "Opening balances for fiscal year 2026",
    status: "Posted",
    rows: [
      createMockRow("1", "1010103001", "Accounts Receivable - Trade", "PTY-0001", "Pacific Office Supplies Inc.", "Customer opening balance", "125000", ""),
      createMockRow("2", "1010101001", "Cash on Hand", "PTY-0001", "Pacific Office Supplies Inc.", "Opening cash adjustment", "", "125000"),
    ],
  }),
  createMockRecord({
    id: "beginning-balance-002",
    transactionNumber: "BB-2026-0002",
    documentDate: "2026-01-02",
    remarks: "Supplier balances carried forward",
    status: "Draft",
    rows: [
      createMockRow("1", "1010400001", "Inventory - Merchandise", "PTY-0001", "Pacific Office Supplies Inc.", "Opening inventory", "85000", ""),
      createMockRow("2", "2010001001", "Accounts Payable - Trade", "PTY-0001", "Pacific Office Supplies Inc.", "Supplier opening balance", "", "85000"),
    ],
  }),
  createMockRecord({
    id: "beginning-balance-003",
    transactionNumber: "BB-2026-0003",
    documentDate: "2026-01-03",
    remarks: "Employee advances opening balance",
    status: "Draft",
    rows: [
      createMockRow("1", "1010103004", "Advances to Employees", "PTY-0002", "Mara Santos Reyes", "Employee advance", "15000", ""),
      createMockRow("2", "1010101001", "Cash on Hand", "PTY-0002", "Mara Santos Reyes", "Opening cash adjustment", "", "15000"),
    ],
  }),
];

export function createBeginningBalanceUploaderRow(
  id: string,
): BeginningBalanceUploaderRow {
  return {
    id,
    accntCode: "",
    accntTitle: "",
    partyCode: "",
    partyName: "",
    particulars: "",
    debit: "",
    credit: "",
  };
}

export function getNextBeginningBalanceUploaderRowId(
  rows: BeginningBalanceUploaderRow[],
) {
  return String(Math.max(0, ...rows.map((row) => Number(row.id))) + 1);
}

export function getBeginningBalanceUploaderTotals(
  rows: BeginningBalanceUploaderRow[],
): BeginningBalanceUploaderTotals {
  const debit = rows.reduce((sum, row) => sum + toAmount(row.debit), 0);
  const credit = rows.reduce((sum, row) => sum + toAmount(row.credit), 0);

  return {
    debit,
    credit,
    variance: debit - credit,
  };
}

export function parseBeginningBalanceSpreadsheetText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((row, index, allRows) => row.length > 0 || index < allRows.length - 1)
    .map((row) => row.split("\t"));
}

export function isBeginningBalanceHeaderRow(
  row: string[] | undefined,
  startColumnIndex: number,
) {
  if (!row?.length) {
    return false;
  }

  return row.every((cell, index) => {
    const column = BeginningBalanceUploaderColumns[startColumnIndex + index];
    return column && normalizeHeader(cell) === normalizeHeader(column.label);
  });
}

export function normalizeBeginningBalancePastedCell(
  field: BeginningBalanceUploaderField,
  value: string,
) {
  void field;
  return value.trim();
}

export function createBeginningBalanceUploaderFormValues(
  record: BeginningBalanceUploaderRecord,
): BeginningBalanceUploaderFormValues {
  return {
    currencyRate: record.currencyRate,
    currencyType: record.currencyType,
    documentDate: record.documentDate,
    remarks: record.remarks,
    rows: record.rows.map((row) => ({ ...row })),
    transactionNumber: record.transactionNumber,
  };
}

export function createBeginningBalanceUploaderRecord(
  values: BeginningBalanceUploaderFormValues,
): BeginningBalanceUploaderRecord {
  const now = new Date().toISOString();
  const sequence = Date.now().toString().slice(-6);

  return {
    ...values,
    createdAt: now,
    id: `beginning-balance-${Date.now()}`,
    rows: values.rows.map((row) => ({ ...row })),
    status: "Draft",
    transactionNumber: `BB-${new Date().getFullYear()}-${sequence}`,
    updatedAt: now,
  };
}

export function updateBeginningBalanceUploaderRecord(
  record: BeginningBalanceUploaderRecord,
  values: BeginningBalanceUploaderFormValues,
): BeginningBalanceUploaderRecord {
  return {
    ...record,
    ...values,
    rows: values.rows.map((row) => ({ ...row })),
    transactionNumber: record.transactionNumber,
    updatedAt: new Date().toISOString(),
  };
}

export function formatBeginningBalanceAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function toAmount(value: string) {
  const amount = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createMockRow(
  id: string,
  accntCode: string,
  accntTitle: string,
  partyCode: string,
  partyName: string,
  particulars: string,
  debit: string,
  credit: string,
): BeginningBalanceUploaderRow {
  return { id, accntCode, accntTitle, partyCode, partyName, particulars, debit, credit };
}

function createMockRecord({
  id,
  transactionNumber,
  documentDate,
  remarks,
  status,
  rows,
}: Pick<BeginningBalanceUploaderRecord, "id" | "transactionNumber" | "documentDate" | "remarks" | "status" | "rows">): BeginningBalanceUploaderRecord {
  return {
    id,
    transactionNumber,
    documentDate,
    remarks,
    status,
    rows,
    currencyType: "PHP",
    currencyRate: "1.00",
    createdAt: `${documentDate}T08:00:00.000Z`,
    updatedAt: `${documentDate}T08:00:00.000Z`,
  };
}
