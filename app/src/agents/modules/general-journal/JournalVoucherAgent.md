# Journal Voucher Module Guide

Use this guide when working on the General Journal > Journal Voucher feature.

## Main Folders

- `app/(modules)/general-journal/journal-voucher/`
  Thin Next.js routes for list, add, edit, and view pages.

- `app/src/ui/modules/general-journal/journal-voucher/`
  React page components, table rows, form header, not-found state, and the Data Entry table.

- `app/src/hooks/modules/general-journal/journal-voucher/`
  React Query cache, list state, form state, line-entry behavior, totals, validation orchestration, and save/delete actions.

- `app/src/data/modules/general-journal/journal-voucher/`
  Mock records, default form values, line factories, record mappers, totals, and amount formatting.

- `app/src/constants/modules/general-journal/journal-voucher/`
  Href, status/currency options, action copy, pagination key, and Data Entry column configuration.

- `app/src/types/modules/general-journal/journal-voucher/`
  TypeScript-only record, form, line, status, error, and action-mode shapes.

- `app/src/validations/modules/general-journal/journal-voucher/`
  Zod-backed form and line validation rules.

- `app/src/services/modules/general-journal/journal-voucher/`
  Query key factories and future API helpers.

## Frontend Behavior

The module has:

- List page with search, view, edit, and delete actions.
- Add/edit/view pages under `/add`, `/edit/[recordId]`, and `/view/[recordId]`.
- Header fields with remarks, currency type, and currency rate on the left.
- Header fields with transaction number, document date, and status on the right.
- A shared `ModuleDataEntry` accounting grid, matching the Data Entry surface used by Disbursement Voucher.

## Data Entry Rules

The journal line grid uses `ModuleDataEntry` from:

```text
app/src/ui/shared/module/module-data-entry/ModuleDataEntry.tsx
```

Keep line state and row actions in the hook. Keep column ids, labels, protected columns, and widths in constants.

Current line columns:

- Account Code
- Account Title
- Particulars
- Party Code
- Party Name
- Responsibility Center
- Ref No.
- VAT Type
- ATC Code
- Debit
- Credit

Required save rules:

- At least two journal lines.
- Each line needs account code and account title.
- Each line must have either debit or credit, not both.
- Debit and credit totals must balance.
- Currency rate must be greater than zero.

## Catalog Registration

The module uses stable permission/module code `JV`.

Registration points already expected for the module:

- Backend module identity: `gr8bookslite-backend/prisma/seeds/moduleCatalog.ts`
- Backend system sidebar: `gr8bookslite-backend/prisma/seeds/moduleSystemCatalog.ts`
- Frontend route map: `app/src/data/shared/modules/ModuleRouteMap.ts`
- Frontend sidebar catalog: `app/src/data/shared/modules/ModuleCatalogData.ts`

The backend owns module identity and permission metadata. The frontend owns the route:

```text
/general-journal/journal-voucher
```

## Future API Direction

When replacing mock records, add API calls under:

```text
app/src/services/modules/general-journal/journal-voucher/
```

Keep backend posting rules authoritative. Frontend validation should remain a user-experience guard for balanced entries and required header fields.
