<!-- BEGIN:nextjs-agent-rules -->

# Next.js Note

This project uses a newer Next.js version. Before changing framework APIs,
routes, layouts, or server/client boundaries, check the relevant guide in
`node_modules/next/dist/docs/`.

<!-- END:nextjs-agent-rules -->

# Project Structure

Use a modular monolith inside `app`.

Routes stay thin and import real UI from `app/src/ui/...`.

```txt
app/
  (auth)/
  (modules)/
    <domain>/<feature>/
      page.tsx
      add/page.tsx
      edit/[recordId]/page.tsx
      view/[recordId]/page.tsx
  workspace/
  pricing/
  src/
    constants/
    data/
    hooks/
    services/
    types/
    ui/
    validations/
```

Feature files are grouped by concern first:

```txt
app/src/ui/modules/<domain>/<feature>/          # React components only
app/src/hooks/modules/<domain>/<feature>/       # state, orchestration, stores
app/src/data/modules/<domain>/<feature>/        # mock data, defaults, mappers
app/src/types/modules/<domain>/<feature>/       # TypeScript-only types
app/src/constants/modules/<domain>/<feature>/   # hrefs, options, table config
app/src/validations/modules/<domain>/<feature>/ # Zod schemas and validators
app/src/services/modules/<domain>/<feature>/    # API/server/query helpers
```

Top-level areas follow the same split, for example:

```txt
app/src/ui/auth/             app/src/validations/auth/
app/src/ui/billing/          app/src/validations/billing/
app/src/ui/onboarding/       app/src/validations/onboarding/
app/src/ui/pricing/          app/src/validations/pricing/
app/src/ui/shared/           app/src/validations/shared/
```

# Module Rules

When creating or refactoring a module:

- Do not put hooks, constants, data, types, or validation inside `app/src/ui/...`.
- Do not put validation in hooks or data. Put it in `app/src/validations/...`.
- Use Zod for validation when adding new validation logic.
- Keep route files thin.
- Use `/add`, `/edit/[recordId]`, and `/view/[recordId]`. Never use `/add/new`.
- Use clear file names such as `PurchaseRequestListPage.tsx`,
  `PurchaseRequestFormPage.tsx`, `PurchaseRequestDetailsPanel.tsx`, and
  `PurchaseRequestTableRow.tsx`.
- Avoid generic new module files named `Main.tsx`, `Action.tsx`, or `index.ts`.

Route files should look like:

```tsx
import { FeatureListPage } from "@/app/src/ui/modules/<domain>/<feature>/FeatureListPage";

export default function Page() {
  return <FeatureListPage />;
}
```

Add/edit/view route files should import the form page:

```tsx
import { FeatureFormPage } from "@/app/src/ui/modules/<domain>/<feature>/FeatureFormPage";

export default function Page() {
  return <FeatureFormPage />;
}
```

# Path Aliases

- Use the `@/` path alias for app imports instead of deep relative paths when
  importing across route, source, or shared module folders.

# Recommended Module Files

```txt
app/src/ui/modules/<domain>/<feature>/
  FeatureListPage.tsx
  FeatureFormPage.tsx
  FeatureTable.tsx
  FeatureTableRow.tsx
  FeatureRecordActions.tsx
  FeatureDetailsPanel.tsx
  FeatureDataEntryTable.tsx
  FeatureItemsTable.tsx
  FeatureNotFound.tsx

app/src/hooks/modules/<domain>/<feature>/
  useFeature.ts
  useFeatureListPage.ts
  useFeatureFormPage.ts

app/src/data/modules/<domain>/<feature>/
  FeatureData.ts

app/src/types/modules/<domain>/<feature>/
  FeatureTypes.ts

app/src/constants/modules/<domain>/<feature>/
  FeatureConstants.ts

app/src/validations/modules/<domain>/<feature>/
  FeatureValidation.ts
```

# Shared Module UI

Use the shared module UI for list pages.

- Use `app/src/ui/shared/module/ModuleHeader.tsx` for module page headers.
- Use App Dialog when Activating/Deactivating Data.
- Use `app/src/ui/shared/module/ModuleStatisticCards.tsx` for list-page
  statistic cards. For the standard pattern: a `ModuleHeader`, a
  `ModuleStatisticCards` block, then the module table.
- Use `app/src/ui/shared/module/module-table/ModuleTable.tsx` for table-based
  module lists.
- Use the rest of `app/src/ui/shared/module/module-table/` instead of creating
  custom table chrome.
- Use `app/src/ui/shared/module/ModuleTooltip.tsx` on icon-only controls that
  do not have visible labels. This also applies responsively when labels are
  hidden on smaller screens.
- Build TanStack table instances in feature hooks, not in UI components.
- Keep table columns, pagination storage keys, hrefs, and option lists in
  constants.
- Keep row cells in `FeatureTableRow.tsx`.
- Keep row action buttons in `FeatureRecordActions.tsx` when actions are
  reused or non-trivial.
- Prefer `ModuleStatisticCards` over custom summary cards for common counts, status
  totals, and dashboard-style module facts. Keep metric labels short, values
  derived from feature state, and helper text concise.

Use `ModuleTable` for dense record lists with sorting, pagination, filtering,
or scan-heavy data. Use cards/lists only when records are naturally low-density.

# Transaction Data Entry Tables

Some transaction modules have editable line, item, or accounting entry grids.
For spreadsheet-like data entry, use the shared Data Entry UI instead of a
custom table:

- Use `app/src/ui/shared/module/module-data-entry/ModuleDataEntry.tsx` and its
  exported types for editable transaction rows.
- Keep feature-specific entry-table components in
  `app/src/ui/modules/<domain>/<feature>/FeatureDataEntryTable.tsx` or
  `FeatureItemsTable.tsx`.
- Keep Data Entry column definitions, visible-column options, add-column
  options, export options, and row default values outside the UI layer when they
  are reusable. Constants belong in `app/src/constants/...`; defaults and pure
  row mappers belong in `app/src/data/...`.
- Keep Data Entry row state, add/insert/remove/duplicate/move/paste/clear
  handlers, derived totals, and submit orchestration in feature hooks.
- Keep item, line, debit/credit, required-row, and balancing validation in
  `app/src/validations/...`.
- Respect readonly modes in Data Entry tables and pass through validation errors
  to the shared component when rows are incomplete or out of balance.
- Use a custom simple table only when the rows are read-only or low-interaction.

# Form Fields

- Use a real `<label>` element for form fields whenever the field has visible
  label text.
- Mark required fields with `*` in the label.

# Validation

Validation belongs in `app/src/validations/...`.

Validation files should contain:

- Zod schemas.
- Helper functions such as `validateFeatureForm(values)`.
- Cross-field checks, duplicate checks, conditional required fields, item table
  requirements, and debit/credit balance rules.
- Mapping from Zod errors to the feature's form error shape.

Hooks may call validation helpers, but hooks should not define validation rules.
Data files should not export validation helpers.

# Hook, Data, Type, Constant Separation

Hooks:

- Own client state, form state, derived state, table state, routing, and submit
  handlers.
- Call data mappers and validation helpers.
- Keep UI files mostly presentational.

Data:

- Mock/static records.
- Initial form values.
- Local storage helpers.
- Pure mappers such as `createFeatureFormValues`,
  `createFeatureRecord`, and `updateFeatureRecord`.

Types:

- Record types.
- Form value and form error types.
- Status/mode unions.

Constants:

- `FeatureHref`.
- Select options.
- Table columns.
- Pagination storage keys.
- Reusable copy/labels.

Services:

- API wrappers, server actions, TanStack Query key factories, and business
  operations that talk outside the UI layer.

# Naming

- Use PascalCase for components, data files, constants, validations, and types.
- Use React hook naming for hooks, such as `usePurchaseRequestFormPage.ts`.
- Route-group folders stay lowercase where Next.js requires it.
- Prefer feature-specific names over vague names.

# Checks

Run checks once near the end of the work, not after every small edit.

```bash
npm run lint
npm run build
```

For route refactors, also search for old add routes:

```bash
rg '/add/new|add/\[recordId\]|add\\\[recordId\\\]' 'app/(modules)' app/src -g '*.tsx' -g '*.ts'
```

# Styling

Use project Tailwind tokens from `app/globals.css`.

- `darknavy`
- `coralpink`
- `citron`
- `offwhite`
- `skyblue`

Prefer token classes such as `text-darknavy`, `bg-offwhite`,
`bg-coralpink`, `bg-citron`, and `bg-skyblue` over ad hoc hex values.
