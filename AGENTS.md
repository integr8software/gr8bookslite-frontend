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

## CRUD Action Page Pattern

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
3. Move User List route imports to the newer `ui/Main` pattern.
4. Create `ui/Action.tsx` for User List if add/edit/view should match Branch
   Management.
5. Move User Type and User Group components into a `ui/` folder.
6. Rename User Type/User Group page components to match the Branch pattern:
   `Main`, `Action`, `Header`, `Table` or `List`, `ActionHeader`,
   `DetailsFields`, `NotFound`.
7. Replace `window.confirm` with shared `AppConfirmDialog`.
8. Split `useUserManagement.ts` only when submodules need independent query
   state or the file becomes too large.

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
