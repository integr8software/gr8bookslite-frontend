# Charts of Accounts Module Guide

Use this guide when working on the Charts of Accounts feature.

## Main Folders

- `app/src/ui/modules/financial-maintenance/charts-of-accounts/`
  React components for the screen.

- `app/src/hooks/modules/financial-maintenance/charts-of-accounts/`
  React state, drawer logic, filters, sorting, pagination, and save/delete flow.

- `app/src/data/modules/financial-maintenance/charts-of-accounts/`
  Default form values, account mappers, and pure tree helpers.

- `app/src/services/modules/financial-maintenance/charts-of-accounts/`
  Backend API calls, response mappers, and React Query keys for the live Chart of Accounts module.

- `app/src/constants/modules/financial-maintenance/charts-of-accounts/`
  Runtime values such as hrefs, nav labels, dropdown options, table columns, field definitions, and copy.

- `app/src/types/modules/financial-maintenance/charts-of-accounts/`
  TypeScript-only types for accounts, filters, form values, drawer modes, tabs, and sort keys.

## UI Files

- `ChartsOfAccountsListPage.tsx`
  Main page composer. Calls `useChartsOfAccounts()` and connects the header, filters, table, and drawer.

- `ChartsOfAccountsHeader.tsx`
  Top page section with title, helper text, Import, Export, and Add Account button.

- `ChartsOfAccountsFilters.tsx`
  Nav tabs, search input, and filter dropdowns.

- `ChartsOfAccountsTable.tsx`
  Table shell, sortable header, body switching, and pagination wiring.

- `ChartsOfAccountsTableRow.tsx`
  One account row with account details, expand control, badges, edit, and delete actions.

- `ChartsOfAccountsTableState.tsx`
  Table support states: pagination footer, loading skeleton rows, and empty row.

- `ChartsOfAccountsDrawer.tsx`
  Slide-in drawer. Owns drawer-local form state, active drawer tab, submit handling, and drawer layout.

- `ChartsOfAccountsForm.tsx`
  Form switchboard. Shows Account Information or Bank Details fields.

- `ChartsOfAccountsAccountFields.tsx`
  Account Information form fields.

- `ChartsOfAccountsBankFields.tsx`
  Bank Details form fields. Used when the account category is `Cash in Bank`.

- `ChartsOfAccountsControls.tsx`
  Shared small UI controls for this module, such as `Card`, `Button`, `Input`, `Select`, `Field`, `Badge`, `TypeBadge`, `Tabs`, and `joinClasses`.

## Hook

- `useChartsOfAccounts.ts`
  Owns feature behavior:
  - backend Chart of Accounts tree query
  - expanded tree ids
  - active nav
  - search and filters
  - sorting
  - pagination
  - loading and mutation state
  - drawer open/close state
  - selected drawer account
  - backend save and deactivate handlers

The drawer is controlled here through `drawerAccount`, `isDrawerOpen`, `openAddDrawer`, `openEditDrawer`, and `closeDrawer`.

## Data Files

- `ChartsOfAccountsData.ts`
  Friendly entry point that re-exports the smaller data files.

- `ChartsOfAccountsDefaults.ts`
  Empty/default form values such as `EmptyBankDetails` and `EmptyAccountFormValues`.

- `ChartsOfAccountsMappers.ts`
  Pure conversion helpers such as `accountToFormValues()`.

- `ChartsOfAccountsTree.ts`
  Pure tree helpers such as `flattenAccounts()`, `isSpecificAccount()`, and `moveOrReorderAccount()`.

## Services

- `ChartsOfAccountsApi.ts`
  Calls `/api/v1/maintenance/chart-of-accounts`, maps backend enum/field names to the existing UI model, and sends create/update/deactivate requests. The backend owns account code generation.

- `ChartsOfAccountsQueryKeys.ts`
  React Query keys for the COA tree.

## Constants

- `ChartsOfAccountsConstants.ts`
  Runtime values used by the app:
  - `ChartsOfAccountsHref`
  - account type options
  - status options
  - normal balance options
  - account category options
  - statement sections
  - `ChartsOfAccountsNavs`
  - drawer tabs
  - bank field definitions
  - table columns
  - badge variant classes

Use constants for values React renders or JavaScript reads at runtime.

## Types

- `ChartsOfAccountsTypes.ts`
  TypeScript-only rules and shapes:
  - `AccountType`
  - `NormalBalance`
  - `AccountStatus`
  - `StatementGroup`
  - `AccountCategory`
  - `BankDetails`
  - `BankDetailsKey`
  - `ChartAccount`
  - `ChartAccountFormValues`
  - `FlattenedChartAccount`
  - `FilterValue`
  - `ChartsOfAccountsDrawerMode`
  - `ChartsOfAccountsFormTab`
  - `AccountSortKey`
  - `SortDirection`

Use types to describe what values are allowed. Types do not exist at runtime after TypeScript compiles.

## Simple Rule

- Data: records, defaults, and pure data helpers.
- Hooks: React state and behavior.
- Constants: runtime values that do not change.
- Types: TypeScript-only shapes and allowed values.
