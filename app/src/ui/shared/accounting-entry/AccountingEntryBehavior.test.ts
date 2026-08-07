import assert from "node:assert/strict";
import test from "node:test";
import type { AccountingEntry } from "@/app/src/types/shared/accounting/AccountingEntryTypes";
import { isAccountingEntryColumnReadOnly } from "@/app/src/ui/shared/accounting-entry/AccountingEntryColumns";
import {
  clearAccountingEntryRows,
  duplicateAccountingEntryRow,
  getAccountingEntryAmountUpdates,
  insertAccountingEntryRow,
  moveAccountingEntryRow,
  removeAccountingEntryRow,
} from "@/app/src/ui/shared/accounting-entry/AccountingEntryRowUtils";
import { getAccountingEntryTotals } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTotals";

function createRow(id: string): AccountingEntry {
  return {
    id,
    accountCode: "",
    accountTitle: "",
    debit: 0,
    credit: 0,
    partyCode: "",
    partyName: "",
    particulars: "",
    vatType: "",
    atcCode: "",
    responsibilityCenter: "",
    refNo: "",
  };
}

test("debit clears credit and credit clears debit", () => {
  const row = { ...createRow("1"), credit: 100 };

  assert.deepEqual(getAccountingEntryAmountUpdates(row, "debit", 250), {
    debit: 250,
    credit: 0,
  });
  assert.deepEqual(getAccountingEntryAmountUpdates(row, "credit", 75), {
    debit: 0,
    credit: 75,
  });
});

test("read-only mode and read-only fields prevent editing", () => {
  assert.equal(isAccountingEntryColumnReadOnly("debit", true), true);
  assert.equal(isAccountingEntryColumnReadOnly("partyCode", false, ["partyCode"]), true);
  assert.equal(isAccountingEntryColumnReadOnly("particulars", false, ["partyCode"]), false);
});

test("totals expose difference and balance state", () => {
  const rows = [
    { ...createRow("1"), debit: "100.25" },
    { ...createRow("2"), credit: 40 },
  ];

  assert.deepEqual(getAccountingEntryTotals(rows), {
    debit: 100.25,
    credit: 40,
    difference: 60.25,
    isBalanced: false,
  });
  assert.equal(getAccountingEntryTotals([{ ...createRow("1"), debit: 40, credit: 40 }]).isBalanced, true);
});

test("row operations preserve order and keep a blank row", () => {
  const rows = [createRow("1"), createRow("2")];
  const factory = () => createRow("new");

  assert.deepEqual(
    duplicateAccountingEntryRow(rows, "1", factory).map((row) => row.id),
    ["1", "new", "2"],
  );
  assert.deepEqual(
    insertAccountingEntryRow(rows, "2", "above", factory).map((row) => row.id),
    ["1", "new", "2"],
  );
  assert.deepEqual(
    moveAccountingEntryRow(rows, "2", "1").map((row) => row.id),
    ["2", "1"],
  );
  assert.deepEqual(
    removeAccountingEntryRow([rows[0]], "1", factory).map((row) => row.id),
    ["new"],
  );
  assert.deepEqual(
    clearAccountingEntryRows(rows, "all", factory).map((row) => row.id),
    ["new"],
  );
});
