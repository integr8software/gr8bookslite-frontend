# Shared Accounting Entries Template

## Implementation Summary

The frontend now has a reusable `AccountingEntryTable` built on the existing
`ModuleDataEntry` component. It provides the common accounting-entry editor
behavior without changing transaction accounting rules or adding backend
posting logic.

The shared type supports account, party, tax, responsibility-center,
particulars, reference, debit, and credit fields. The table supports editable
debit and credit cells with mutual exclusion, row add/insert/duplicate/remove/
clear/move actions, configurable columns, read-only mode, totals, and balance
status.

## Migrated Modules

The shared table is used by:

- Service Invoice
- Goods Receipt
- Delivery Receipt
- Goods Issue

Goods Issue now persists `accountingEntries` in its existing form record and
restores them when the form is reopened. Because the repository did not have a
Goods Issue accounting mapping factory, it starts with one blank editable row;
no account mapping was invented.

## Responsibility Boundaries

Transaction-specific defaults remain in their data modules:

- `createServiceInvoiceAccountingEntries`
- `createGoodsReceiptAccountingEntries`
- `createDeliveryReceiptAccountingEntries`
- `createGoodsIssueAccountingEntries`

The shared layer owns only the common table/editor mechanics. It does not
calculate journal entries and does not decide which accounts a transaction
should use.

## Validation

Focused `node:test` coverage was added for debit/credit mutual exclusion,
totals and balance difference, and row operations. The frontend package does
not currently define a test script or include Jest/Vitest, so these tests are
source coverage for the repository's future test runner rather than a command
that can be executed by the current package scripts.

Validated commands:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

The build completed successfully. Lint reports only pre-existing warnings in
unrelated files.
