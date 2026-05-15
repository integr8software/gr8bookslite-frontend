# CRUD Module Pattern

Use this guide when creating or refactoring CRUD modules. Keep the existing
`AGENTS.md` rules as the baseline, then apply this file for module structure,
route shape, and UI/data/hook placement.

## Next.js Route Shape

Before changing routes, read the relevant guide in
`node_modules/next/dist/docs/`.

Routes stay thin and only import feature UI from `app/src/ui/...`.

```txt
app/(modules)/<domain>/<feature>/
  page.tsx
  add/page.tsx
  edit/[recordId]/page.tsx
  view/[recordId]/page.tsx
```

Use `add/page.tsx` for create pages. Do not create `add/[recordId]` and do not
link to `/add/new`.

Route files should look like this:

```tsx
import { FeatureMain } from "@/app/src/ui/modules/<domain>/<feature>/ui/Main";

export default function Page() {
  return <FeatureMain />;
}
```

For add/edit/view routes:

```tsx
import { FeatureAction } from "@/app/src/ui/modules/<domain>/<feature>/ui/Action";

export default function Page() {
  return <FeatureAction />;
}
```

## Feature Folder Layout

Place files by concern, not all inside UI.

```txt
app/src/ui/modules/<domain>/<feature>/ui/
  Main.tsx
  Action.tsx
  FeatureHeader.tsx
  FeatureTable.tsx
  FeatureActionHeader.tsx
  FeatureDetailsFields.tsx
  FeatureNotFound.tsx

app/src/data/modules/<domain>/<feature>/
  FeatureData.ts

app/src/hooks/modules/<domain>/<feature>/
  useFeature.ts

app/src/services/modules/<domain>/<feature>/
  FeatureQueryKeys.ts

app/src/types/modules/<feature>/
  FeatureTypes.ts

app/src/constants/modules/<feature>/
  FeatureConstants.ts
```

Use PascalCase for files under `app/src`, except React hooks which keep the
`useFeature.ts` convention.

## List Page Pattern

`Main.tsx` owns page composition only:

- Read list state from the feature hook.
- Render the feature header.
- Render the table/list component.
- Wire delete/status actions through clear handler props.
- Use shared dialogs such as `AppConfirmDialog` instead of `window.confirm`
  when adding or refactoring UI.

`FeatureHeader.tsx` owns the top action area:

- Title and short helper text when needed.
- Primary Add button linked to `${FeatureHref}/add`.
- Keep import/export/filter buttons only when the feature requires them.

`FeatureTable.tsx` owns rendering:

- Prefer TanStack Table for data tables with sorting, filtering, pagination,
  selection, and column visibility.
- Keep table columns local to the table unless reused elsewhere.
- Use project shared controls and `AppSkeleton` for loading rows.
- Keep actions as icon buttons with accessible labels.
- Center action cells. Keep text-heavy identity fields left aligned.

## Action Page Pattern

`Action.tsx` handles add/edit/view orchestration:

- Detect mode from pathname:
  - `/add` means `add`
  - `/edit/[recordId]` means `edit`
  - `/view/[recordId]` means `view`
- Read `recordId` only for edit/view.
- Build initial form values from data helpers.
- Keep validation and field update orchestration in the hook or action
  component, depending on complexity.
- Make view mode readonly.
- If edit/view record is missing, render `FeatureNotFound`.
- After successful add/edit/delete, navigate back to `FeatureHref`.

`FeatureActionHeader.tsx` owns:

- Mode-aware heading/actions.
- Back/cancel navigation.
- Save button for add/edit.
- Delete button for edit/view when allowed.

`FeatureDetailsFields.tsx` owns:

- Field layout and inputs.
- Error display.
- Disabled/readonly behavior.
- No business logic beyond calling provided handlers.

## Data, Types, Constants, Services

`FeatureTypes.ts`:

- Shared TypeScript-only record, status, action mode, and form error types.

`FeatureConstants.ts`:

- Runtime constants such as `FeatureHref`, status options, page-size options,
  and labels.

`FeatureData.ts`:

- Mock/static records.
- Initial form values.
- Pure data mappers such as `createFeatureFormValues`,
  `createFeatureFromForm`, and `updateFeatureFromForm`.
- Validation helpers if they are pure and reusable.

`FeatureQueryKeys.ts`:

- TanStack Query key factories.

`useFeature.ts`:

- TanStack Query data loading.
- Mutations for create, update, delete, and status changes.
- Derived options for filters.
- Table state and handlers when the feature has a TanStack table.

## Shared UI

Use shared components from `app/src/ui/shared/` when available:

- `AppConfirmDialog` for confirmations.
- `AppSkeleton` for loading states.
- Shared providers, query client, and API clients from the existing shared
  stack.

Add new shared components only when at least two modules need the same
behavior or the UX should be consistent globally.

## CRUD Links

Use constants for hrefs:

```tsx
export const FeatureHref = "/<domain>/<feature>";
```

Then build links consistently:

```tsx
`${FeatureHref}/add`
`${FeatureHref}/edit/${record.id}`
`${FeatureHref}/view/${record.id}`
```

Never hard-code `/add/new`.

## Validation Checklist

After CRUD refactors, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Also search for route regressions:

```bash
rg '/add/new|add/\[recordId\]|add\\\[recordId\\\]' 'app/(modules)' app/src -g '*.tsx' -g '*.ts'
```
