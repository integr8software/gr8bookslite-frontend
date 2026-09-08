import assert from "node:assert/strict";
import test from "node:test";
import { createAccountsPayableVoucherInitialFormValues } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import {
  normalizeExpenseLineUpdate,
  syncAccountsPayableVoucherWithGeneratedAccountingEntries,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherFormStateData";
import { createAccountsPayableVoucherPurchaseOrderLines } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherPurchaseOrderData";
import { createPurchaseOrderFormValues } from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { AccountsPayableVoucherLookupAccount } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import { validateAccountsPayableVoucherForm } from "@/app/src/validations/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherValidation";

const account: AccountsPayableVoucherLookupAccount = {
  id: "expense-account",
  accountNumber: "5001",
  accountName: "Service Revenue",
  accountType: "Expenses",
  statementGroup: "Income Statement",
  statementSection: "Expenses",
  normalBalance: "Debit",
  accountCategory: "Detail",
  description: "",
  status: "Active",
};
const context = {
  accountOptions: [],
  taxCodes: [],
  defaultAccountIds: {
    inputTaxAccountId: "",
    outputTaxAccountId: "",
    deferredTaxAccountId: "",
    expandedWithholdingTaxAccountId: "",
    creditableWithholdingTaxAccountId: "",
    withholdingVatableTaxAccountId: "",
    finalWithholdingTaxAccountId: "",
  },
};
function purchaseOrder() {
  const defaults = createPurchaseOrderFormValues();
  return {
    ...defaults,
    id: "purchase-order",
    transNo: "PO-001",
    partyId: "supplier-id",
    vceCode: "SUP-001",
    vceName: "Supplier",
    accountingEntries: [],
    items: [1, 2].map((id) => ({
      ...defaults.items[0],
      id: String(id),
      itemName: "Service Revenue",
      quantity: 1,
      cost: 1000,
    })),
  };
}
function voucher() {
  return {
    ...createAccountsPayableVoucherInitialFormValues(),
    transactionNo: "APV-001",
    partyCode: "SUP-001",
    partyName: "Supplier",
    termId: "cash",
    terms: "Cash",
    creditAccountId: "payable-id",
    creditAccountCode: "2001",
    creditAccountTitle: "Accounts Payable",
    expenseLines: createAccountsPayableVoucherPurchaseOrderLines(purchaseOrder(), [account]),
  };
}

test("copied PO rows without journal entries resolve accounts and pass voucher validation", () => {
  const result = syncAccountsPayableVoucherWithGeneratedAccountingEntries(voucher(), context);
  assert.deepEqual(validateAccountsPayableVoucherForm(result), {});
  assert.equal(result.amount, 2000);
  assert.equal(result.expenseLines[0].expenseAccountId, account.id);
  assert.equal(result.expenseLines[0].partyId, "supplier-id");
  assert.equal(result.accountingEntries[0].accountId, account.id);
  assert.equal(result.accountingEntries.at(-1)?.accountId, "payable-id");
  assert.equal(
    result.accountingEntries.reduce((sum, row) => sum + row.debit - row.credit, 0),
    0,
  );
});

test("missing and ambiguous account matches stay empty instead of displaying an item as a payable type", () => {
  for (const accounts of [[], [account, { ...account, id: "other", accountNumber: "5002" }]]) {
    const rows = createAccountsPayableVoucherPurchaseOrderLines(purchaseOrder(), accounts);
    assert.equal(rows[0].expenseType, "");
    assert.equal(rows[0].expenseAccountCode, "");
    assert.equal(rows[0].particulars, "Service Revenue");
  }
});

test("each copied item resolves its own payable account", () => {
  const order = purchaseOrder();
  order.items[1].itemName = "Office Supplies";
  const other = { ...account, id: "supplies-id", accountNumber: "5002", accountName: "Office Supplies" };
  const rows = createAccountsPayableVoucherPurchaseOrderLines(order, [account, other]);
  assert.deepEqual(
    rows.map((row) => row.expenseAccountCode),
    ["5001", "5002"],
  );
});

test("editing a copied account or party clears the previous record ID", () => {
  const row = voucher().expenseLines[0];
  assert.equal(normalizeExpenseLineUpdate(row, "expenseAccountCode", "5002").expenseAccountId, undefined);
  assert.equal(normalizeExpenseLineUpdate(row, "partyCode", "SUP-002").partyId, undefined);
});

test("tax entries require configured accounts instead of using hardcoded sample accounts", () => {
  const values = voucher();
  values.expenseLines[0].vat = "VAT-12";
  values.expenseLines[0].vatPercent = 12;
  const result = syncAccountsPayableVoucherWithGeneratedAccountingEntries(values, context);
  const taxEntry = result.accountingEntries.find((row) => row.id.startsWith("apv-entry-input-vat-"));
  assert.equal(taxEntry?.accountCode, "");
  assert.ok(validateAccountsPayableVoucherForm(result).accountingEntryErrors);
});
