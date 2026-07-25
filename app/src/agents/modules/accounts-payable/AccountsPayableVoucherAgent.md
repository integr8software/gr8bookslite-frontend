# Accounts Payable Voucher Module Guide

Use this guide when working on Accounts Payable > Accounts Payable Voucher.

## Main Folders

- `app/(modules)/accounts-payable/accounts-payable-voucher/`
  Thin Next.js routes for list, add, edit, and view pages.

- `app/src/ui/modules/accounts-payable/accounts-payable-voucher/`
  React page components, table rows, form header, not-found state, and the Expense and Accounting Entries data-entry tables.

- `app/src/hooks/modules/accounts-payable/accounts-payable-voucher/`
  React Query cache, list filters, form state, grid row behavior, totals, validation orchestration, and save/delete actions.

- `app/src/data/modules/accounts-payable/accounts-payable-voucher/`
  Mock records, default form values, row factories, record mappers, totals, and amount formatting.

- `app/src/constants/modules/accounts-payable/accounts-payable-voucher/`
  Href, status/currency/payable-type options, action copy, pagination key, and data-entry column configuration.

- `app/src/types/modules/accounts-payable/accounts-payable-voucher/`
  TypeScript-only record, form, expense-line, accounting-entry, status, error, and action-mode shapes.

- `app/src/validations/modules/accounts-payable/accounts-payable-voucher/`
  Zod-backed header and grid validation rules.

- `app/src/services/modules/accounts-payable/accounts-payable-voucher/`
  Query key factories and future API helpers.

## Frontend Behavior

The module has:

- List page with statistics, search, date range, amount range, status filter, and view/edit/delete actions.
- Add/edit/view pages under `/add`, `/edit/[recordId]`, and `/view/[recordId]`.
- Header fields with Party Code, Party Name, Currency, Exchange Rate, Amount, Credit Account, Payable Type, and Remarks on the left.
- Header fields with Transaction Number, Document Date, and read-only Status on the right.
- Currency changes load the PHP exchange rate through `/api/exchange-rates`.
- Status defaults to `Draft` and remains a read-only textbox in the form.

## Data Entry Rules

The module uses `ModuleDataEntry` from:

```text
app/src/ui/shared/module/module-data-entry/ModuleDataEntry.tsx
```

Keep row state and row actions in the form hook. Keep column ids, labels, protected columns, and widths in constants.

Expense Details columns:

- No
- Expense Type
- Amount
- Net Amount
- VAT
- VAT %
- VAT Amount
- EWT
- EWT %
- EWT Amount
- Party Name
- Particulars
- Reference No

Accounting Entries columns:

- Account Code
- Account Title
- Particulars
- Debit
- Credit
- VAT Type
- ATC Code
- Party Code
- Party Name
- Responsibility Center
- Ref No.

Combo box sources:

- Party Name comes from Party Maintenance.
- Responsibility Center comes from Maintenance > Responsibility Center `name`.
- Account Title and Credit Account come from the chart of accounts.

Required save rules:

- At least one Expense Details row.
- At least two accounting entry rows.
- Expense rows require expense type and amount.
- Accounting rows require account code and account title.
- Accounting rows must have either debit or credit, not both.
- Accounting variance must be zero.
- Header amount must match the expense total and accounting debit/credit totals.
- Exchange rate must be greater than zero.

## Catalog Registration

The module uses stable permission/module code `APV`.

Registration points:

- Backend module identity: `gr8bookslite-backend/prisma/seeds/moduleCatalog.ts`
- Backend system sidebar: `gr8bookslite-backend/prisma/seeds/moduleSystemCatalog.ts`
- Frontend module catalog and route map: `app/src/data/shared/modules/ModuleCatalogData.ts`
- Frontend sidebar catalog: `app/src/data/shared/modules/ModuleCatalogData.ts`

The backend owns module identity and permission metadata. The frontend owns the route:

```text
/accounts-payable/accounts-payable-voucher
```

## Future API Direction

When replacing mock records, add API calls under:

```text
app/src/services/modules/accounts-payable/accounts-payable-voucher/
```

Keep backend posting and approval rules authoritative. Frontend validation should remain a user-experience guard for balanced accounting entries and required header fields.
