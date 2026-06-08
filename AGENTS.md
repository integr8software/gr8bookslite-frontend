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

# Recommended Module Files

```txt
app/src/ui/modules/<domain>/<feature>/
  FeatureListPage.tsx
  FeatureFormPage.tsx
  FeatureTable.tsx
  FeatureTableRow.tsx
  FeatureRecordActions.tsx
  FeatureDetailsPanel.tsx
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
- Use `app/src/ui/shared/module/module-table/ModuleTable.tsx` for table-based
  module lists.
- Use the rest of `app/src/ui/shared/module/module-table/` instead of creating
  custom table chrome.
- Build TanStack table instances in feature hooks, not in UI components.
- Keep table columns, pagination storage keys, hrefs, and option lists in
  constants.
- Keep row cells in `FeatureTableRow.tsx`.
- Keep row action buttons in `FeatureRecordActions.tsx` when actions are
  reused or non-trivial.

Use `ModuleTable` for dense record lists with sorting, pagination, filtering,
or scan-heavy data. Use cards/lists only when records are naturally low-density.

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
