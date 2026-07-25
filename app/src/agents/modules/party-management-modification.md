# Party Management Modification Plan

## Scope

Modify Party Management to support members, honorifics, VAT Tax Maintenance, reusable drawer-based add flows, and easier address entry across Home, Billing, and Delivery addresses.

Latest update:

- `Employee` and `Member` both support Gender, Civil Status, and Nationality.
- `Member` has a Member Registration Date.
- Member Registration Date defaults to the current date when the party type includes `Member`.
- Member Registration Date must be saved as `NULL` when the party is not a `Member`.

## Current References

- Frontend route: `gr8bookslite-frontend/app/(modules)/maintenance/party-management/`
- Party UI: `gr8bookslite-frontend/app/src/ui/modules/maintenance/party-management/`
- Party constants/types/data:
  - `gr8bookslite-frontend/app/src/constants/modules/maintenance/party-management/PartyManagementConstants.ts`
  - `gr8bookslite-frontend/app/src/types/modules/maintenance/party-management/PartyManagementTypes.ts`
  - `gr8bookslite-frontend/app/src/data/modules/maintenance/party-management/PartyManagementData.ts`
- Backend party module: `gr8bookslite-backend/src/modules/maintenance/party-maintenance/`
- Prisma schema: `gr8bookslite-backend/prisma/schema.prisma`
- Module/subscription catalog seeds:
  - `gr8bookslite-backend/prisma/seeds/moduleCatalog.ts`
  - `gr8bookslite-backend/prisma/seeds/moduleSystemCatalog.ts`
  - `gr8bookslite-backend/prisma/seeds/seedSubscriptionPlans.ts`
- COA default seed:
  - `gr8bookslite-backend/src/modules/maintenance/chart-of-accounts/seed/chart-of-accounts.seed.ts`
  - `gr8bookslite-backend/src/modules/maintenance/chart-of-accounts/seed/chart-of-accounts-defaults.seed.ts`
- Advanced dropdown: `gr8bookslite-frontend/app/src/ui/shared/advanced-dropdown/`
- Drawer base: `gr8bookslite-frontend/app/src/ui/shared/module/ModuleDrawer.tsx`
- Existing party drawer: `gr8bookslite-frontend/app/src/ui/modules/maintenance/party-management/PartyManagementDrawer.tsx`
- Disbursement voucher add-from-input reference: `gr8bookslite-frontend/app/(modules)/cash-disbursement/disbursement-voucher/`

## Requirements

### 1. Add Party Type: Member

Add `Member` as a party type alongside:

- `Vendor`
- `Customer`
- `Employee`
- `Member`

Member rules:

- Member has Home Address.
- Member supports Gender, Civil Status, and Nationality.
- Nationality defaults to `Filipino`.
- Member has Member Registration Date.
- Member Registration Date defaults to today's date when `Member` is selected.
- Member Registration Date is `NULL` when `Member` is removed or not selected.
- Member should be available for `Individual` parties.
- Confirm whether `Member` should be allowed for `Non-Individual`; default implementation should keep it individual-only unless business rules say otherwise.

Implementation notes:

- Add backend enum value in Prisma `PartyType`.
- Add DTO validation/mapping support.
- Update frontend `PartyType`, `ApiPartyType`, constants, mapping, import normalization, validation, filters, table display, and mock data.
- Update address role logic so `Member` behaves like `Employee` for Home Address:
  - `PartyAddressContainer.tsx`
  - `getPartyAddressRoles` in `PartyManagementData.ts`
  - backend `validateAddresses`.

### 2. Add Party Personal Fields

Add these fields for individual parties where the party type includes `Employee` or `Member`:

- `honorific`
- `gender`
- `civilStatus`
- `nationality`
- `memberRegistrationDate` for `Member` only

Defaults:

- `nationality`: `Filipino`
- `memberRegistrationDate`: today's date when party type includes `Member`; otherwise `NULL`

Honorific dropdown options from the provided screenshot:

- `Mr.` with description `Mister`
- `Mrs.` with description `Missus`
- `Ms.`
- `Miss`
- `Mx.` with description `Mix`
- `Sir`
- `Madam`
- `Ma'am`
- `Dr.` with description `Doctor`
- `Prof.` with description `Professor`
- `Engr.` with description `Engineer`
- `Atty.` with description `Attorney`
- `Capt.` with description `Captain`
- `Hon.` with description `Honorable`
- `Rev.` with description `Reverend`
- `Fr.` with description `Father`
- `Pastor`

Suggested Gender defaults/options:

- `Male`
- `Female`
- `Prefer not to say`

Suggested Civil Status defaults/options:

- `Single`
- `Married`
- `Widowed`
- `Separated`

Implementation notes:

- Persist fields on `Party`.
- Include fields in create/update/list/detail/import/export flows.
- Show Gender, Civil Status, and Nationality only for `Employee` and `Member`.
- Show Member Registration Date only for `Member`.
- `Honorific` should be an advanced dropdown, not a native select or free-text field.
- Store only the honorific label value, for example `Prof.`, not `Prof. (Professor)`.
- `Gender`, `Civil Status`, and `Nationality` can be plain selects/inputs unless a shared reference table already exists.

### 3. Create Tax Maintenance For VAT Registered Types

Create a new Tax Maintenance module for VAT Registration Types.

This must be a registered module, not only a support table/API. Add it to the backend module catalog and system sidebar catalog so every subscription/system that includes maintenance modules receives it.

Recommended module catalog entry:

| Field  | Value                |
| ------ | -------------------- |
| `code` | `TXM`                |
| `name` | `Tax Maintenance`    |
| `icon` | `receipt` or `scale` |
| `type` | `Maintenance`        |

Default data from the screenshot:

| Name                     | Suggested Percentage |
| ------------------------ | -------------------: |
| VAT Registered           |                   12 |
| Zero Rated               |                    0 |
| Non-VAT                  |                    0 |
| Exempt                   |                    0 |
| Capital Goods            |                   12 |
| Other Than Capital Goods |                   12 |
| Services                 |                   12 |

Fields:

- `name`
- `percentage`
- `inputVatAccountId`
- `outputVatAccountId`
- `vatPayableAccountId`
- `deferredInputTaxAccountId`
- `deferredOutputVatAccountId`
- `status`

Behavior:

- Seed default rows per company or globally, matching the app's maintenance-data pattern.
- Tax Maintenance must use a drawer for add/edit/view.
- Include active/inactive handling if consistent with other maintenance modules.
- Prevent duplicate names per company.
- Register the module in `moduleCatalog.ts`.
- Register the module sidebar link in `moduleSystemCatalog.ts`, preferably under `financial-maintenance`.
- Because `ACCOUNTING` uses `collectModuleCodes(AccountingSidebarTemplate)`, Tax Maintenance must be added to `AccountingSidebarTemplate` so Accounting subscriptions include it.
- Because `ACCOUNTING_AND_INVENTORY` uses `ModuleCatalog.map((module) => module.code)`, adding Tax Maintenance to `ModuleCatalog` makes that system include it; still add the sidebar link so it is visible.
- `seedSubscriptionPlans.ts` assigns subscription plans by module system code (`ACCOUNTING` and `ACCOUNTING_AND_INVENTORY`), so once `TXM` is included in those module systems, all existing onboarding and additional-company subscription plans inherit it.

### 4. Tax Maintenance Account Titles / COA Seed Check

The existing COA defaults already include the key account titles needed by Tax Maintenance:

- `Input VAT`
- `Deferred Input Tax`
- `Output VAT`
- `Deferred Output VAT`
- `VAT Payable`
- `Tax Credits`
- `Taxes Payables`
- `Income Tax Payable`
- `Other Taxes Payable`
- `Bir 2307 - Creditable Withheld Taxes`
- `CWT - Witholding Tax Payable`
- `EWT - Witholding Tax Payable`
- `Final - Withholding Tax Payable`

Implementation note:

- Do not duplicate these account titles in the COA seed unless a missing title is discovered during implementation.
- Add system account group tags/mappings only if Tax Maintenance needs constrained dropdowns by role.
- If using account dropdowns, filter to active posting accounts and preselect the matching default account titles above.

### 5. Change Party VAT Registration Type To Advanced Dropdown

Replace the native `select` for `VAT Registration Type` in `PartyInformationDetailsFields.tsx` with `AppAdvancedDropdown`.

New behavior:

- Options come from Tax Maintenance instead of hard-coded `VatRegistrationTypeOptions`.
- Dropdown label is the Tax Maintenance `name`.
- Dropdown description is the percentage.
- The selected value display should not redundantly show `VAT Registration Type`.
- Example options:
  - label `VAT Registered`, description `12%`
  - label `Zero Rated`, description `0%`
  - label `Non-VAT`, description `0%`
- Store the selected Tax Maintenance id if the database relationship is changed.
- Keep backward compatibility or migration for existing `Party.vatRegistrationType` enum/string data.

Implementation options:

- Tax definitions are selected by transaction modules and are not stored as a party-level default.
- Transitional: keep existing enum/string value and resolve by name until migration is completed.

### 6. Create Reusable Drawer For Add-From-Dropdown Flows

Create a reusable drawer wrapper for maintenance add flows because Party Management and Disbursement Voucher use the input + add combination.

Recommended abstraction:

- Keep `ModuleDrawer` as the low-level shell.
- Create a higher-level reusable drawer component for form maintenance flows, for example:
  - `app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer.tsx` already exists and should be evaluated first.
  - If insufficient, extend it rather than creating a duplicate pattern.

Reusable drawer should support:

- `title`
- `description`
- `isOpen`
- `isPending`
- `onClose`
- `onSubmit`
- `primaryActionLabel`
- `secondaryActionLabel`
- `maxWidthClassName`
- form content children

Use cases:

- Party add drawer from transaction dropdowns.
- Tax Maintenance add/edit/view drawer.
- Future add-from-dropdown maintenance values.

### 7. Disabled View Shows Full Address

When the party form is in disabled/view mode:

- Full Address must still be visible for Home, Billing, and Delivery addresses.
- If `AppAddressAutocomplete` hides or clears the visible text while disabled, render a read-only input/text display using the formatted full address.
- Full Address should combine address lines and location fields consistently.

Suggested display format:

`Unit/Building, Street/Subdivision, Barangay, City/Municipality, Province`

### 8. Easier Address Fill-Up For Home, Billing, Delivery

Home Address, Billing Address, and Delivery Address should all use the same easy fill-up behavior as the current Address section.

Required behavior:

- Each address section has `Full Address` autocomplete/search.
- Selecting a result fills:
  - Province
  - City/Municipality
  - Barangay
  - Street/Subdivision/Village
  - Unit/Block/Lot/Building
- Manual edits remain possible after autocomplete selection.
- Each section updates only its own address record.

Current status:

- `PartyAddressContainer.tsx` already renders `AppAddressAutocomplete` per visible section.
- Verify disabled/view display and address-id propagation for all roles after adding `Member`.

## Backend Checklist

- Add Prisma fields/enums/tables/migration:
  - `PartyType.MEMBER`
  - `Party.honorific`
  - `Party.gender`
  - `Party.civilStatus`
  - `Party.nationality`
  - `Party.memberRegistrationDate`
  - `TaxMaintenance` or equivalent VAT type table
- Update generated Prisma client.
- Update party DTOs, validation, service normalization, mapper, import handling, and tests.
- Normalize Gender, Civil Status, and Nationality for `Employee` and `Member`; clear them for other party types.
- Normalize Member Registration Date to today's date for `Member` when blank; clear it to `NULL` for non-Member parties.
- Create Tax Maintenance controller/service/module/DTOs.
- Seed default Tax Maintenance rows.
- Register Tax Maintenance as module code `TXM` in `moduleCatalog.ts` and add it to the Financial Maintenance sidebar in `moduleSystemCatalog.ts` so every subscription plan using `ACCOUNTING` or `ACCOUNTING_AND_INVENTORY` includes it.
- Verify COA default account titles exist before assigning default account ids.

## Frontend Checklist

- Update party constants/types/data/mappers/API transforms.
- Add form fields for honorific, gender, civil status, nationality.
- Add Member Registration Date field shown only when party type includes `Member`.
- Show Gender, Civil Status, and Nationality for `Employee` and `Member`.
- Default Nationality to `Filipino` for `Employee` and `Member`.
- Default Member Registration Date to today's date when `Member` is selected; clear it when `Member` is removed.
- Add Member party type and home-address role behavior.
- Replace VAT Registration Type select with `AppAdvancedDropdown`.
- Configure VAT Registration Type option label as name and description as percentage.
- Configure Honorific with advanced-dropdown label/description instead of parenthesized text.
- Add Tax Maintenance service/types/hooks/UI route.
- Add Tax Maintenance drawer using reusable drawer pattern.
- Ensure view mode shows Full Address for all visible address sections.
- Update import template, preview, validation, and export columns if the new fields are importable/exportable.

## Verification Checklist

- Add individual member with Home Address and default nationality `Filipino`.
- Add individual employee and verify Gender, Civil Status, and Nationality are available.
- Add member and verify Member Registration Date defaults to today's date.
- Remove Member from a party and verify Member Registration Date is saved as `NULL`.
- Add party with multiple types, including Customer + Member, and verify Home, Billing, and Delivery sections render correctly.
- View a disabled party record and verify Full Address is visible.
- Create/edit/view Tax Maintenance through drawer.
- Verify VAT Registration Type dropdown uses `AppAdvancedDropdown` and displays name as label and percentage as description.
- Verify Honorific dropdown stores labels without parenthesized descriptions.
- Verify seeded Tax Maintenance defaults appear without manual entry.
- Verify default Tax Maintenance accounts resolve to existing COA default account titles.
- Run frontend build/typecheck and backend tests after implementation.
