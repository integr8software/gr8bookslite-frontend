# Branch Management and User Management Coding Structure

This document analyzes the current CRUD structure used by Branch Management and
User Management. Use it as a reference when refactoring modules toward one
consistent CRUD pattern.

## Route Structure

Both modules use the App Router under `app/(modules)/system-administration`.
Route files are thin and mostly import the real UI from `app/src/ui/...`.

Preferred CRUD route shape:

```txt
app/(modules)/system-administration/<feature>/
  page.tsx
  add/page.tsx
  edit/[recordId]/page.tsx
  view/[recordId]/page.tsx
```

The add route should always be `add/page.tsx`. Do not use
`add/[recordId]/page.tsx` and do not link to `/add/new`.

## Branch Management Structure

Branch Management is the cleaner reference implementation.

```txt
app/(modules)/system-administration/branch-management/
  page.tsx
  add/page.tsx
  edit/[recordId]/page.tsx
  view/[recordId]/page.tsx

app/src/ui/modules/system-administration/branch-management/ui/
  Main.tsx
  Action.tsx
  BranchManagementHeader.tsx
  BranchManagementTable.tsx
  BranchActionHeader.tsx
  BranchDetailsFields.tsx
  BranchNotFound.tsx

app/src/data/modules/system-administration/branch-management/
  BranchManagementData.ts

app/src/hooks/modules/system-administration/branch-management/
  useBranchManagement.ts

app/src/services/modules/system-administration/branch-management/
  BranchManagementQueryKeys.ts

app/src/types/modules/branch-manager/
  BranchActionTypes.ts

app/src/constants/modules/branch-manager/
  BranchManagementConstants.ts
```

### Branch Management Flow

`Main.tsx`:

- Reads branch state from `useBranchManagementStore`.
- Owns list-page composition.
- Renders `BranchManagementHeader`.
- Renders `BranchManagementTable`.
- Wires delete behavior into the table.

`BranchManagementHeader.tsx`:

- Renders title, description, and Add Branch action.
- Uses `BranchManagementHref`.
- Add link should point to `${BranchManagementHref}/add`.

`BranchManagementTable.tsx`:

- Receives branch records and delete callback as props.
- Renders responsive rows.
- Keeps row actions local.
- Links to:
  - `${BranchManagementHref}/view/${branch.id}`
  - `${BranchManagementHref}/edit/${branch.id}`

`Action.tsx`:

- Handles add/edit/view mode from pathname.
- Uses `useParams` only for edit/view record lookup.
- Builds form values using helpers from `BranchManagementData.ts`.
- Keeps view mode readonly.
- Renders `BranchNotFound` when edit/view record is missing.
- Navigates back to `BranchManagementHref` after save/delete.

`BranchManagementData.ts`:

- Owns initial form values.
- Owns pure create/update mapping helpers.
- Owns branch-specific helper logic, such as main branch TIN options.

`useBranchManagement.ts`:

- Uses TanStack Query for branch data.
- Uses mutations for add, update, and delete.
- Updates cached query data through `queryClient.setQueryData`.

## User Management Structure

User Management currently has two patterns.

### Shared User Management Store Pattern

The shared user management files are:

```txt
app/src/data/modules/system-administration/user-management/
  UserManagementData.ts
  user-list/UserListData.ts

app/src/hooks/modules/system-administration/user-management/
  useUserManagement.ts
  user-list/useUserList.ts

app/src/services/modules/system-administration/user-management/
  UserManagementQueryKeys.ts
  user-list/UserListQueryKeys.ts

app/src/types/modules/user-management/
  UserManagementTypes.ts
  UserListTypes.ts

app/src/constants/modules/user-management/
  UserManagementConstants.ts
  UserListConstants.ts
```

`UserManagementData.ts` currently contains records, form values, initial data,
and create/update helpers for:

- User List
- User Type
- User Group

`useUserManagement.ts` is a single store hook for all three areas:

- users
- userTypes
- userGroups
- add/update/delete mutations for each

This is workable, but the hook is broader than Branch Management. If each
submodule grows, split it into feature-specific hooks and data files.

### User Type and User Group Pattern

User Type and User Group use a flatter component structure:

```txt
app/src/ui/modules/system-administration/user-management/user-type/
  UserTypePage.tsx
  UserTypeHeader.tsx
  UserTypeList.tsx
  UserTypeRecordActions.tsx
  UserTypeFormPage.tsx
  UserTypeFormHeader.tsx
  UserTypeForm.tsx
  UserTypeNotFound.tsx

app/src/ui/modules/system-administration/user-management/user-group/
  UserGroupPage.tsx
  UserGroupHeader.tsx
  UserGroupList.tsx
  UserGroupRecordActions.tsx
  UserGroupFormPage.tsx
  UserGroupFormHeader.tsx
  UserGroupForm.tsx
  UserGroupNotFound.tsx
```

This mirrors the Branch Management concepts, but names differ:

```txt
BranchManagementMain      -> UserTypePage / UserGroupPage
BranchManagementHeader    -> UserTypeHeader / UserGroupHeader
BranchManagementTable     -> UserTypeList / UserGroupList
BranchManagementAction    -> UserTypeFormPage / UserGroupFormPage
BranchActionHeader        -> UserTypeFormHeader / UserGroupFormHeader
BranchDetailsFields       -> UserTypeForm / UserGroupForm
BranchNotFound            -> UserTypeNotFound / UserGroupNotFound
```

Important cleanup target:

- User Type and User Group list pages still build Add links as `/add/new`.
- They should use `/add`.

### User List Pattern

User List currently has both an older flat implementation and a newer `ui`
implementation.

Older route-linked files:

```txt
app/src/ui/modules/system-administration/user-management/user-list/
  UserListPage.tsx
  UserListHeader.tsx
  UserListTable.tsx
  UserListRecordActions.tsx
  UserListFormPage.tsx
  UserListFormHeader.tsx
  UserListForm.tsx
  UserListNotFound.tsx
```

Newer table-focused files:

```txt
app/src/ui/modules/system-administration/user-management/user-list/
  Main.tsx
  ui/Main.tsx
  ui/UserListTable.tsx
```

Current route files import the older flat `UserListPage` and
`UserListFormPage`. If the goal is to follow Branch Management, route files
should point to the newer `ui/Main` and a future `ui/Action`.

## Recommended Unified Pattern

Use Branch Management as the standard for all CRUD modules:

```txt
app/src/ui/modules/<domain>/<feature>/ui/
  Main.tsx
  Action.tsx
  FeatureHeader.tsx
  FeatureTable.tsx
  FeatureActionHeader.tsx
  FeatureDetailsFields.tsx
  FeatureNotFound.tsx
```

Use this naming responsibility:

- `Main.tsx`: list page composition.
- `Action.tsx`: add/edit/view state and submit orchestration.
- `FeatureHeader.tsx`: list page title and Add button.
- `FeatureTable.tsx`: table/list rendering and row actions.
- `FeatureActionHeader.tsx`: action page title and save/delete/cancel actions.
- `FeatureDetailsFields.tsx`: form field rendering.
- `FeatureNotFound.tsx`: missing record state.

## Recommended Data Pattern

For small related setup modules, a shared data file is acceptable. For larger
modules, prefer one data file per feature.

Preferred per-feature layout:

```txt
app/src/data/modules/system-administration/user-management/user-type/
  UserTypeData.ts

app/src/hooks/modules/system-administration/user-management/user-type/
  useUserType.ts

app/src/services/modules/system-administration/user-management/user-type/
  UserTypeQueryKeys.ts

app/src/types/modules/user-management/
  UserTypeTypes.ts

app/src/constants/modules/user-management/
  UserTypeConstants.ts
```

Keep pure helpers in data files:

- initial form values
- mock records
- form-to-record mappers
- record-to-form mappers
- pure validation helpers when reusable

Keep state and side effects in hooks:

- TanStack Query calls
- mutations
- cache updates
- table state
- filter state
- selected rows

## Recommended Refactor Order

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

## Validation Checklist

After changing CRUD structure, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Search for old add route links:

```bash
rg '/add/new|add/\[recordId\]|add\\\[recordId\\\]' 'app/(modules)' app/src -g '*.tsx' -g '*.ts'
```

Expected result: no matches for add routes.
