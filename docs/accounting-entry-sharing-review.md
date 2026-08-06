# Accounting Entry Sharing Review

## Purpose

This document reviews how transaction accounting entries are currently modeled and rendered in the Gr8Books Neo frontend, with Goods Issue as the immediate use case. It is an architecture review only. No Goods Issue accounting-entry implementation is included.

## Executive Summary

The project already has a reusable table framework in `ui/shared/module/module-data-entry`, but accounting-entry behavior is fragmented across transaction modules.

`ServiceInvoiceData.ts` is not entirely misplaced. Its posting calculation is Service Invoice business logic and should remain owned by the Service Invoice module. However, the accounting-entry shape, editor behavior, row operations, totals, and balance validation are repeated and should be shared.

Goods Issue currently has only inventory line entries. It has no accounting-entry type, form state, tab, update hook, or persistence contract. Adding the Service Invoice table by copying its files would reproduce the current duplication and, more importantly, would apply the wrong accounting rules.

Recommended direction:

```text
Shared accounting-entry contract and editor mechanics
                         +
Transaction-specific posting policy
                         +
Backend validation and journal persistence
                         =
Complete transaction accounting entries
```

## Current Architecture

### Shared table infrastructure

The reusable table shell already exists in:

- `app/src/ui/shared/module/module-data-entry/ModuleDataEntry.tsx`
- `app/src/ui/shared/module/module-data-entry/*`

It provides generic row rendering, toolbar actions, column settings, import/export controls, row movement, and summary cells. This is the correct shared layer for any tabular transaction entry UI.

It intentionally does not know accounting rules.

### Service Invoice

Service Invoice has a complete frontend-only accounting-entry workflow:

- `ServiceInvoiceAccountingEntry` is declared in `ServiceInvoiceTypes.ts`.
- `ServiceInvoiceFormValues` owns `accountingEntries`.
- `createServiceInvoiceAccountingEntries()` derives four posting rows from service totals.
- Existing records copy their saved accounting entries or regenerate defaults.
- `ServiceInvoiceEntrySection.tsx` switches between Service Details and Accounting Entries.
- `ServiceInvoiceAccountingEntryColumns.tsx` renders the accounting editor.
- `ServiceInvoiceEntryRowUtils.ts` contains blank-row and row-management helpers.

The posting rule in `ServiceInvoiceData.ts` is specifically:

```text
Debit  Accounts Receivable - Trade
Debit  Sales Discount
Credit Output Tax
Credit Service Fees
```

This rule is tied to sales/service-invoice semantics. It should not be moved into a generic shared utility and should not be copied to Goods Issue.

### Goods Receipt and Delivery Receipt

Goods Receipt and Delivery Receipt independently define substantially the same accounting-entry shape as Service Invoice. Goods Receipt generates Inventory and Accrued Payable rows, while Delivery Receipt has its own entry setup.

This confirms two things:

1. The row contract and editor mechanics are cross-module concepts.
2. The generated accounts and amounts are transaction-specific concepts.

### Purchasing

Purchasing already demonstrates a partial sharing pattern:

- `app/src/types/modules/purchasing/PurchasingAccountingTypes.ts`
- `app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns.tsx`

Purchase Request, Purchase Order, and Canvass Form reuse purchasing accounting columns while retaining module-specific state and default-row generation. This is directionally better than copying columns into every module, but the reusable contract is still limited to the Purchasing domain.

### Goods Issue

Goods Issue currently contains no accounting-entry model:

- `GoodsIssueFormValues` contains only `lineEntries`.
- `createGoodsIssueFormValues()` initializes only inventory rows.
- `createGoodsIssueFormValuesFromRecord()` restores only inventory rows.
- `createGoodsIssueRecordFromForm()` persists only inventory rows in the frontend record.
- `GoodsIssueEntrySection.tsx` renders one `ModuleDataEntry` titled Goods Issue Details and has no tabs.
- `useGoodsIssue.ts` updates only line entries.

Therefore, Goods Issue cannot currently display, edit, restore, or save accounting entries.

## Duplication Found

The following fields are repeated across Service Invoice, Goods Receipt, Delivery Receipt, and Purchasing accounting types:

```ts
type AccountingEntryDraft = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: number;
  credit: number;
  partyCode: string;
  partyName: string;
  particulars: string;
  vatType: string;
  atcCode: string;
  responsibilityCenter: string;
  refNo: string;
};
```

Repeated UI behavior includes:

- Debit and credit mutual exclusion.
- Accounting column labels and widths.
- Default visible and protected columns.
- Blank row creation.
- Add, insert, duplicate, move, clear, and remove behavior.
- Debit and credit summaries.
- Detection of blank or incomplete rows.

This is meaningful duplication and is a reasonable extraction target.

## Correct Sharing Boundary

### Move to a shared accounting-entry layer

A future shared folder may contain:

```text
app/src/types/shared/accounting/
  AccountingEntryTypes.ts

app/src/ui/shared/accounting-entry/
  AccountingEntryColumns.tsx
  AccountingEntryTable.tsx
  AccountingEntryRowUtils.ts
  AccountingEntryTotals.ts
```

Shared responsibilities should be limited to:

- A common draft row contract.
- Generic accounting-entry columns and cells.
- Row manipulation.
- Debit/credit totals.
- Balance checks and presentation.
- Generic validation such as one-sided rows and non-negative values.

The shared editor can remain generic over a base contract if some modules require additional fields.

### Keep inside each transaction module

The following must remain module-specific:

- Which accounts are posted.
- How amounts are calculated.
- When entries are regenerated.
- Which default-account roles are required.
- Tax and discount treatment.
- Inventory valuation behavior.
- Party and responsibility-center propagation.
- Rules for Draft, Approved, Posted, Cancelled, and reversed transactions.

This avoids a large universal posting function filled with transaction-type conditionals.

## Proposed Goods Issue Design

### Frontend state

Goods Issue would eventually add:

- `GoodsIssueAccountingEntry`, preferably extending the shared contract.
- `accountingEntries` in `GoodsIssueFormValues`.
- A module-local `createGoodsIssueAccountingEntries()` posting-policy function.
- An Accounting Entries tab beside Goods Issue Details.
- Hook actions for updating generated or manually adjusted entries.
- Restore/save support in the Goods Issue record or API DTO.

### Posting policy

Goods Issue must not reuse the Service Invoice accounts. Its normal posting pattern is closer to:

```text
Debit  Destination account (expense, COGS, production/WIP, project, or another configured role)
Credit Inventory asset account
```

The exact debit account depends on transaction type, item setup, warehouse, responsibility center, and company accounting configuration. That rule must be confirmed with the backend/accounting design before implementation.

Generated rows should use real company chart-account IDs and configured default-account roles. Hardcoded display names such as `Inventory`, `Expense`, or `COGS` are acceptable only for a prototype, not authoritative posting.

### Synchronization rule

A clear rule is required for line changes after a user manually edits accounting entries. Recommended behavior:

1. Generate defaults from item rows while the accounting entries are untouched.
2. Mark entries as manually adjusted after a user edits them.
3. Warn before regenerating and replacing manual adjustments.
4. Always revalidate balance and account eligibility before save/post.

Silently regenerating on every render would overwrite user work. Never regenerating would leave stale amounts.

## Backend and ERP Correctness Gap

The frontend currently contains several mocked or local-storage transaction flows. The backend schema has a general `journal_entries` model, but the current backend search found concrete journal-entry persistence and validation under Accounts Payable Voucher, not a Goods Issue transaction service.

That means a Goods Issue accounting tab can be built visually, but it will not by itself create authoritative accounting records.

For production ERP behavior, the backend must own or verify:

- Company and branch scope.
- Account IDs and active status.
- Debit/credit balance.
- Currency and exchange rate.
- Inventory valuation and costing.
- Posting period controls.
- Transaction status and immutable posted entries.
- Idempotent journal creation.
- Reversal behavior instead of destructive editing.

The frontend may preview proposed entries. The backend must be the final source of truth when a Goods Issue is posted.

## Risks in the Current Pattern

### High: accounting logic exists only in frontend mock data

Service Invoice currently derives account titles and amounts in frontend data code. This can support UI development, but it is not a secure accounting boundary. A client can modify the payload.

### High: copying Service Invoice would create incorrect Goods Issue entries

Accounts Receivable, Sales Discount, Output Tax, and Service Fees do not represent inventory issuance.

### Medium: duplicate entry types can drift

Several modules use nearly identical row shapes. A new field or validation rule must currently be changed in many places.

### Medium: duplicate editors behave differently

Some modules have richer visible-column controls and row utilities than others. Users may experience inconsistent entry behavior across modules.

### Medium: generated defaults and manual edits lack a shared lifecycle

The project needs an explicit generated-versus-adjusted policy to prevent stale entries or overwritten edits.

### Low: moving all module data into `shared` would overcorrect

The transaction data files also contain fixtures, form defaults, storage adapters, totals, and posting rules. Moving whole files into `shared` would couple unrelated modules and make accounting behavior harder to trace.

## Recommended Implementation Phases

### Phase 1: define the contract

- Confirm the authoritative Goods Issue posting rules with accounting/backend owners.
- Define a shared accounting-entry draft type aligned with the backend journal-entry DTO.
- Include stable account IDs, not only account labels.
- Define generated, manually adjusted, posted, and reversed behavior.

### Phase 2: extract proven shared frontend behavior

- Extract common accounting columns and cell controls.
- Extract totals, balance validation, and row operations.
- Migrate one existing pair of modules first to verify the API.
- Keep each module's default-entry factory in its own data/domain folder.

### Phase 3: add Goods Issue accounting preview

- Add accounting state and tabs to Goods Issue.
- Generate Goods Issue-specific entries from item totals and configured accounts.
- Preserve manual edits according to the agreed synchronization rule.
- Add tests for account selection, debit/credit balance, regeneration, and persistence.

### Phase 4: backend persistence and posting

- Add or extend the Goods Issue backend contract.
- Validate entries server-side.
- Persist journal entries atomically with Goods Issue posting.
- Make posting idempotent and implement reversal rules.
- Return authoritative entries to the frontend for view mode.

## Suggested Tests

### Shared frontend tests

- Debit entry clears credit and vice versa.
- Totals calculate correctly.
- Unbalanced entries are rejected or visibly flagged.
- Blank-row and row-action behavior is consistent.

### Goods Issue tests

- Empty Goods Issue creates valid default entry rows.
- Item quantity/cost changes update generated totals.
- Inventory credit equals destination-account debit.
- Multiple item accounts aggregate according to the agreed policy.
- Manual adjustments are not silently overwritten.
- Saved records restore accounting entries.
- Posted records are read-only.

### Backend tests

- Cross-company and cross-branch account IDs are rejected.
- Inactive accounts are rejected.
- Unbalanced journals are rejected.
- Repeated posting does not duplicate journal rows.
- Goods Issue and journal rows commit or roll back together.
- Reversal creates traceable reversing entries.

## Files Most Relevant to a Future Change

### Service Invoice reference

- `app/src/data/modules/sales/service-invoice/ServiceInvoiceData.ts`
- `app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes.ts`
- `app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceEntrySection.tsx`
- `app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceAccountingEntryColumns.tsx`
- `app/src/ui/modules/sales/service-invoice/entries/utils/ServiceInvoiceEntryRowUtils.ts`

### Goods Issue target

- `app/src/data/modules/inventory/goods-issue/GoodsIssueData.ts`
- `app/src/types/modules/inventory/goods-issue/GoodsIssueTypes.ts`
- `app/src/hooks/modules/inventory/goods-issue/useGoodsIssue.ts`
- `app/src/ui/modules/inventory/goods-issue/entries/GoodsIssueEntrySection.tsx`
- `app/src/ui/modules/inventory/goods-issue/action/GoodsIssueActionPage.tsx`

### Existing reusable references

- `app/src/ui/shared/module/module-data-entry/*`
- `app/src/types/modules/purchasing/PurchasingAccountingTypes.ts`
- `app/src/ui/modules/purchasing/shared/PurchasingAccountingEntryColumns.tsx`
- Backend `prisma/schema.prisma`, model `JournalEntry`
- Backend Accounts Payable Voucher accounting service and DTOs

## Questions to Resolve Before Coding

1. Which Goods Issue transaction types debit Expense, COGS, WIP, project, or another account?
2. Where are inventory asset and destination account IDs configured today?
3. Is Goods Issue accounting editable, generated-only, or editable only before approval?
4. Should rows aggregate by account, item, warehouse, responsibility center, or tax classification?
5. At which status are journal entries persisted?
6. How are average cost, FIFO, or other inventory valuation methods resolved?
7. What is the reversal policy after posting?
8. Should the shared frontend type exactly mirror the backend journal DTO or use an adapter?

## Final Recommendation

Do not move `ServiceInvoiceData.ts` into a shared folder and do not copy its accounting implementation into Goods Issue.

Extract only the stable accounting-entry UI contract and mechanics. Keep Service Invoice and Goods Issue posting factories beside their respective modules. Add Goods Issue accounting entries only after defining its posting policy and backend persistence contract.

This provides reuse without hiding business rules, and it keeps the backend as the authoritative source for financial postings.
