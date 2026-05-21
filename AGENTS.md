<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Structure

Use a modular monolith structure inside the `app` directory.

Routes live directly under `app` with route groups for major areas. Route files should stay thin and import the real feature UI from `app/src/ui/...`.

```txt
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    otp/page.tsx
  (onboarding)/
    layout.tsx
    onboarding/page.tsx
  (modules)/
    <domain>/
      <feature>/
        page.tsx
        add/page.tsx
        edit/[recordId]/page.tsx
        view/[recordId]/page.tsx
  pricing/
    page.tsx
  workspace/
    layout.tsx
    dashboard/page.tsx
  api/
  src/
    constants/
    data/
    hooks/
    services/
    types/
    ui/
```

Route group folder names should be lowercase, for example `(auth)` and `(onboarding)`.

`app/pricing/page.tsx` is intentionally public. Keep it outside authenticated route groups unless the product flow changes.

`app/workspace/...` is intentionally a separate admin workspace URL space. Keep company module pages such as `/dashboard` under `(modules)`, and keep admin workspace pages such as `/workspace/dashboard` under `workspace` so the same visible URL does not change meaning based only on the signed-in role.

Feature code belongs under `app/src`, grouped by concern first and module/domain second. Do not create a separate `app/src/modules` folder.

- `app/src/ui/modules/<domain>/<feature>/` for React components only.
- `app/src/data/modules/<domain>/<feature>/` for static data, schemas, form defaults, and pure data helpers.
- `app/src/hooks/modules/<domain>/<feature>/` for client hooks and feature stores.
- `app/src/services/modules/<domain>/<feature>/` for server actions, Axios API wrappers, TanStack Query helpers, and business operations.
- `app/src/types/modules/<feature>/` for shared TypeScript-only types.
- `app/src/constants/modules/<feature>/` for shared runtime constants.

Example:

```txt
app/(modules)/system-administration/branch-management/
  page.tsx
  add/page.tsx
  edit/[recordId]/page.tsx
  view/[recordId]/page.tsx

app/src/ui/modules/system-administration/branch-management/
  ui/
    Main.tsx
    Action.tsx
    BranchManagementTable.tsx

app/src/data/modules/system-administration/branch-management/
  BranchManagementData.ts

app/src/hooks/modules/system-administration/branch-management/
  useBranchManagement.ts

app/src/types/modules/branch-manager/
  BranchActionTypes.ts

app/src/constants/modules/branch-manager/
  BranchManagementConstants.ts
```

When adding a module, keep each concern in its matching root folder. For example, do not put hooks, constants, or data files inside `app/src/ui/...`, and do not put constants inside `app/src/types/...`.

Use `shared` folders under `app/src` for cross-feature modules:

- `app/src/data/shared/`
- `app/src/constants/shared/`
- `app/src/services/shared/`
- `app/src/hooks/shared/`
- `app/src/types/shared/`
- `app/src/ui/shared/`

# CRUD Module Pattern

Use this section when creating or refactoring CRUD modules. `AGENTS.md` is the
canonical project instruction file.

## CRUD Routes

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

## CRUD Feature Layout

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
  useFeatureAction.ts

app/src/services/modules/<domain>/<feature>/
  FeatureQueryKeys.ts

app/src/types/modules/<feature>/
  FeatureTypes.ts

app/src/constants/modules/<feature>/
  FeatureConstants.ts
```

Branch Management is the reference CRUD implementation. User Management should
move toward this same shape when refactored.

## CRUD List Page Pattern

`Main.tsx` owns page composition only:

- Read list state from the feature hook.
- Render the feature header.
- Render the table/list component.
- Wire delete/status actions through clear handler props.
- Use shared dialogs such as `AppConfirmDialog` instead of `window.confirm`
  when adding or refactoring UI.
- Follow the Users page shape as the default composition reference:
  spotlight/tutorial, feature header, then feature table/list.

`FeatureHeader.tsx` owns the top action area:

- Title and short helper text/description that explains what the module is for.
- Header eyebrow/context should show the parent area with the icon first, then
  the parent label text, such as `<UserCog /> User management`.
- Keep a Quick Tour action when the module has spotlight/tutorial data.
- Primary Add button linked to `${FeatureHref}/add`.
- Add buttons must use the shared module primary button styling so they follow
  the active Settings accent color. Prefer `moduleHeaderActionClassNames.primary`
  or an equivalent `bg-skyblue` token-based class instead of hardcoded blues.
- If the prompt does not specify header actions, default to the standard module
  header actions that apply to the feature: Quick Tour, Import, Export, and Add.
- Keep Import and Export actions in the header for data-heavy modules when the
  feature supports or is expected to support file workflows.
- Header action order should generally be: Quick Tour, Import, Export, Add.
- Name the primary action for the feature, such as Add User or Add Account.

`FeatureTable.tsx` owns rendering:

- Use the shared `ModuleTable` from `app/src/ui/shared/module-table/ModuleTable`
  as the default data-table shell for module list pages.
- Build table instances with TanStack Table in the feature hook. The hook owns
  column definitions, sorting, pagination state, filtering state, derived
  options, and handlers that reset pagination when filters/search change.
- Keep table column metadata in feature constants when reused by the hook and
  row renderer. Use `meta.className` for width, alignment, and sticky column
  classes consumed by `ModuleTableHeader`.
- Keep row rendering in a feature row component such as `FeatureTableRow`.
  Pass `renderRow` to `ModuleTable` and keep row actions in a small
  `FeatureRecordActions` component when they are reused or non-trivial.
- Put search/filter controls above `ModuleTable`, usually in
  `FeatureTableFilters`, and keep the controls wired to the feature hook.
- Table filters should sit at the top of the table container. Include search
  when records have names/codes/emails, include relevant select filters, and
  include a Reset button that clears all filters and returns pagination to page
  1.
- Use `paginationStorageKey` constants when pagination should persist per
  feature. Do not hard-code storage keys inline.
- Use `ModuleTable` loading, empty state, pagination, min width, and max height
  props instead of rebuilding table chrome.
- Use `AppSkeleton` and `AppSkeletonCard` from
  `app/src/ui/shared/AppSkeleton.tsx` for loading placeholders outside the
  shared table, such as headers, cards, detail fields, and filter panels while
  data is fetching.
- Keep actions as icon buttons with accessible labels.
- If the prompt does not specify row actions, default the action column to the
  module's allowed CRUD actions. Row actions usually include view/edit/delete
  for full CRUD modules, or edit/delete when there is no separate view route.
- If the feature has an Active/Inactive status, prefer a status toggle action
  over delete. Use `Set as Inactive` for active records and `Set as Active`
  for inactive records.
- Center action cells. Keep text-heavy identity fields left aligned.
- Use project theme tokens and semantic shared classes for table styling.
  Do not add hardcoded light backgrounds to sticky headers or sticky action
  cells without a matching dark-mode-safe class in `app/globals.css`.

## Shared ModuleTable Pattern

`app/src/ui/shared/module-table/` is the standard data-table template for
module pages.

Use this structure for table-based modules:

```txt
app/src/constants/modules/<feature>/
  FeatureConstants.ts       # hrefs, labels, table columns, storage keys

app/src/hooks/modules/<domain>/<feature>/
  useFeature.ts             # TanStack table state, filters, mutations

app/src/ui/modules/<domain>/<feature>/
  FeatureTable.tsx          # filter composition + ModuleTable
  FeatureTableFilters.tsx   # search/select/reset controls
  FeatureTableRow.tsx       # row cells only
  FeatureRecordActions.tsx  # view/edit/delete/status icon actions
```

`ModuleTable` should receive:

- `table` from the feature hook.
- `renderRow={({ id, original }) => <FeatureTableRow key={id} ... />}`.
- `paginationStorageKey` from constants when persistent pagination is desired.
- `minWidthClassName` when the table has many columns.
- `emptyTitle`, `emptyDescription`, and `emptyIcon` for feature-specific empty
  states.
- `isLoading` when feature data is still fetching. `ModuleTable` owns row-level
  skeleton rows; use `AppSkeleton` for surrounding non-table loading UI.

`FeatureTableFilters` should include:

- A search field when the feature has searchable identity fields.
- Select filters for common dimensions such as status, role/type, department,
  account type, or statement section.
- A Reset button that clears search and filters and resets pagination.

Reference implementations:

- Users: best overall reference for page composition, header description,
  Quick Tour/Add actions, filters with Reset, `ModuleTable`, centered row
  actions, and `UserListTableRow` for a normal flat user table.
- Chart of Accounts: filters/tabs + `ModuleTable` + `ChartsOfAccountsTableRow`
  for header Quick Tour/Import/Export/Add Account actions, hierarchical rows,
  expansion state, and sticky actions.

Use card/list layouts instead of `ModuleTable` only when records are naturally
card-like and low-density, such as current User Management Department and User
Role lists. If those features need sorting, pagination, dense comparison, or
column scanning, refactor them toward `ModuleTable`.

## CRUD Action Page Pattern

`Action.tsx` handles add/edit/view orchestration:

- Prefer moving action-page orchestration into `useFeatureAction.ts` when the
  feature has add/edit/view routes. The UI `Action.tsx` should mostly call the
  hook, handle the missing-record branch, and render `FeatureActionHeader`,
  `FeatureDetailsFields`, and status/delete confirmation dialogs.
- Detect mode from pathname:
  - `/add` means `add`
  - `/edit/[recordId]` means `edit`
  - `/view/[recordId]` means `view`
- Read `recordId` only for edit/view.
- Build initial form values from data helpers.
- Keep validation, field updates, submit handling, status/delete confirmation
  state, parent/lookup options, readonly state, mutation pending state, and
  navigation in `useFeatureAction.ts`.
- Make view mode readonly.
- If edit/view record is missing, render `FeatureNotFound`.
- Track edit origin explicitly instead of relying on `router.back()`. A direct
  list-to-edit flow should have list origin, while a view-to-edit flow should
  preserve view origin with a safe in-app marker such as `?from=view`.
- After successful add, navigate back to `FeatureHref`.
- After successful edit, navigate to the record view page when edit was opened
  from view, otherwise navigate back to `FeatureHref`.
- After successful status changes, keep the record available and update the
  displayed status. Navigate only when the feature flow explicitly requires it.
- After successful delete, navigate back to `FeatureHref`. Prefer status
  toggling instead of delete when records should remain auditable.

`FeatureActionHeader.tsx` owns:

- Mode-aware heading/actions.
- Header eyebrow/context should show the parent area with the icon first, then
  the parent label text, matching the list header convention.
- Back/cancel navigation.
- When edit mode was opened from the list, Cancel/Close should return to
  `FeatureHref`.
- When edit mode was opened from a view page, Cancel/Close should return to
  `${FeatureHref}/view/${record.id}` so list -> view -> edit can go back to
  view.
- View mode actions should include Back, Edit, and a status action when the
  feature has status toggling. Use `Set as Inactive` for active records and
  `Set as Active` for inactive records.
- Edit mode actions should include the same status action when the feature has
  status toggling, Close, and Save.
- Close in edit mode should return to the record view page when edit was opened
  from view, otherwise return to `FeatureHref`.
- Save in edit mode should return to the record view page when edit was opened
  from view, otherwise return to `FeatureHref`.
- Delete is optional and should only appear on edit/view when the feature
  requires delete from the action page.

`FeatureDetailsFields.tsx` owns:

- Field layout and inputs.
- Error display.
- Disabled/readonly behavior.
- No business logic beyond calling provided handlers.

## CRUD Data, Types, Constants, Services

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
- For cached/mock CRUD modules, expose a selector-friendly feature store hook
  such as `useFeatureStore(selector?)` backed by TanStack Query and mutations.
  Keep cache update helpers inside this hook and mutate query data through
  `queryClient.setQueryData`.

`useFeatureAction.ts`:

- Route-aware action-page hook for add/edit/view forms.
- Reads pathname/params/router.
- Gets records and mutations from `useFeature.ts`.
- Resolves `mode`, `record`, `isReadonly`, initial form values, lookup options,
  validation errors, delete dialog state, and pending mutation state.
- Exposes UI event handlers such as `onInputChange`, `onSubmit`,
  `onConfirmDelete`, and `setIsDeleteOpen`.
- Uses pure data helpers from `FeatureData.ts` for validation and record/form
  mapping.

Responsibility Center is the reference implementation for the split hook
pattern:

```txt
useResponsibilityCenter.ts        # query-backed store and mutations
useResponsibilityCenterAction.ts  # add/edit/view orchestration
ResponsibilityCenterAction.tsx    # thin UI shell around the action hook
```

## User Management Refactor Notes

User Type and User Group currently use a flatter component structure that
mirrors the Branch Management concepts with different names:

```txt
BranchManagementMain      -> UserTypePage / UserGroupPage
BranchManagementHeader    -> UserTypeHeader / UserGroupHeader
BranchManagementTable     -> UserTypeList / UserGroupList
BranchManagementAction    -> UserTypeFormPage / UserGroupFormPage
BranchActionHeader        -> UserTypeFormHeader / UserGroupFormHeader
BranchDetailsFields       -> UserTypeForm / UserGroupForm
BranchNotFound            -> UserTypeNotFound / UserGroupNotFound
```

When refactoring User Management:

1. Keep route shape consistent: `add/page.tsx`, `edit/[recordId]`,
   `view/[recordId]`.
2. Replace all `/add/new` links with `/add`.
3. Move Users route imports to the newer `ui/Main` pattern.
4. Create `ui/Action.tsx` for Users if add/edit/view should match Branch
   Management.
5. Move User Type and User Group components into a `ui/` folder.
6. Rename User Type/User Group page components to match the Branch pattern:
   `Main`, `Action`, `Header`, `Table` or `List`, `ActionHeader`,
   `DetailsFields`, `NotFound`.
7. Replace `window.confirm` with shared `AppConfirmDialog`.
8. Split `useUserManagement.ts` only when submodules need independent query
   state or the file becomes too large.
9. Keep Users as the table reference for User Management. It should use
   `ModuleTable`, feature table filters, a feature hook that owns TanStack
   state, constants for table columns and pagination storage keys, and a
   dedicated row/action renderer.
10. Department and User Role may stay as card/list layouts while they remain
    simple. If they gain table behavior, migrate them to the same
    `ModuleTable` pattern instead of hand-rolling a second table.

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

## CRUD Validation Checklist

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

# Naming

Use PascalCase as the default naming standard for shared project files under `app/src`.

Use PascalCase for TypeScript files that export components, schemas, actions, shared types, constants, or reusable modules.

Examples:

- `AuthSchemas.ts`
- `AuthTypes.ts`
- `AuthActions.ts`
- `OtpData.ts`
- `LoginForm.tsx`
- `AuthShell.tsx`

Only use lowercase route-group folder names where required by Next.js, for example `(auth)` and `(onboarding)`.

Hooks should keep the React hook convention:

- `useLoginForm.ts`
- `useSignUpForm.ts`
- `useForgotPasswordForm.ts`
- `useOtpForm.ts`
- `useAppStore.ts`

# Logic Placement

Keep logic out of UI components as much as possible.

- Put client interaction logic, state orchestration, derived state, side effects, and flow control in hooks.
- Keep UI components focused on rendering, props, and event wiring.
- Put validation schemas, form defaults, static data, and pure data helpers in `data`.
- Put TypeScript-only shared types in `types`.
- Put runtime constants in `constants`.
- Put API wrappers, server actions, and business operations in `services`.
- If component logic grows beyond small field-local state, move it into a feature hook or shared hook.
- If a service file gets too large, split it by feature flow or domain responsibility instead of keeping all operations in one file.

# Shared Frontend Stack

The frontend now includes shared boilerplate for:

- `axios`
  - use for reusable API clients and request wrappers
  - shared base client belongs in `app/src/services/shared/ApiClient.ts`
- `@tanstack/react-query`
  - use for cached server state such as session, profile, and company data
  - shared query client setup belongs in `app/src/services/shared/QueryClient.ts`
  - shared provider belongs in `app/src/ui/shared/AppProviders.tsx`
- `zustand`
  - use for lightweight client state such as access token, active company, and UI state
  - shared stores should live under `app/src/hooks/shared/`

Current shared boilerplate:

```txt
app/src/services/shared/ApiClient.ts
app/src/services/shared/QueryClient.ts
app/src/hooks/shared/useAppStore.ts
app/src/ui/shared/AppProviders.tsx
```

# Auth

Auth routes currently use:

```txt
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/otp/page.tsx
```

Auth validation should use Zod schemas from `app/src/data/auth/AuthSchemas.ts` or the matching `app/src/data/modules/...` feature folder when auth is organized as a module.

Auth form server actions should return a typed `AuthActionState` from `app/src/types/...`.

Client form components should use `useActionState` through hooks in `app/src/hooks/auth`.

Auth runtime constants should live in `app/src/constants/...`. Static auth data and pure helpers should live in `app/src/data/...`.

Auth may continue to use feature-specific service modules, but shared API and cache infrastructure should build on the shared Axios and TanStack Query boilerplate.

# Styling

Global Tailwind color tokens are defined in `app/globals.css`.

Use these project colors:

- `darknavy`: `#212738`
- `coralpink`: `#f97068`
- `citron`: `#d1d646`
- `offwhite`: `#ecf2ef`
- `skyblue`: `#57c4e5`

Prefer project tokens like `text-darknavy`, `bg-offwhite`, `bg-coralpink`, `bg-citron`, and `bg-skyblue` over ad hoc hex values.
