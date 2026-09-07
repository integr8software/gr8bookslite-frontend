# Shared Frontend Lookup Services

## Purpose

Maintenance lookup data is shared application data. Frontend transaction modules should not duplicate lookup code or keep mock dropdown rows for parties, chart accounts, responsibility centers, tax codes, tax default accounts, payment terms, services, warehouses, units, or similar maintenance-owned records.

Use shared frontend services and shared hooks when the same selector appears in more than one module. Keep module-specific services only for data that is truly owned by that transaction workflow.

## Ownership Rules

| Data need | Frontend owner | Backend owner | Notes |
| --- | --- | --- | --- |
| Party selector and party tax defaults | `app/src/services/modules/maintenance/party-management` or shared lookup wrapper | Party Maintenance lookup API | Party tax default helpers belong in `app/src/data/shared/tax`, not inside a transaction module. |
| Tax codes, rates, ATC display codes | `app/src/services/shared/tax` | Tax API | Use generated Orval clients through shared tax services. |
| Tax default account titles and codes | `app/src/services/shared/tax` | Tax default-account API | Use `GET /api/v1/tax/default-account-options`; do not hardcode VAT/EWT account titles in UI constants. |
| Posting chart account selector | shared maintenance account service | Chart of Accounts lookup API | Use posting-account option endpoints. |
| Responsibility center selector | shared maintenance responsibility-center service | Responsibility Center lookup API | Reuse the shared option service and preserve existing selected values when editing old records. |
| Terms, payment types, discounts, units, warehouses, services | shared maintenance option services | Maintenance lookup APIs | Prefer existing `GET /options` APIs and Orval-generated clients. |
| Transaction number suggestion | transaction module service | Transaction module API | This remains transaction-owned because the numbering series and branch context are workflow-specific. |
| Workflow-specific eligible balances or document copy sources | transaction module service | Transaction module API | Use transaction endpoints when eligibility depends on status, branch, workflow rules, or prior documents. |

## Shared Tax Helpers

Party tax default resolution is shared under:

```text
app/src/data/shared/tax/PartyTaxDefaultsData.ts
```

This helper resolves:

- `defaultPurchaseInputVatTaxSourceKey` to the selectable VAT code.
- `defaultPurchaseEwtTaxSourceKey` to the selectable EWT/ATC code.
- party VAT/EWT defaults into dropdown values without hardcoding module-specific tax rows.

Do not place shared party tax helpers under `app/src/data/modules/<domain>`. If another module needs sales defaults, add shared helpers in `app/src/data/shared/tax` and keep the field names aligned with the Party Maintenance API.

## Shared Service Pattern

Create or reuse shared services before adding module-local lookup code:

```text
app/src/services/shared/<domain>/<Name>Api.ts
app/src/hooks/shared/<domain>/use<Name>Options.ts
app/src/data/shared/<domain>/<Name>Data.ts
app/src/types/shared/<domain>/<Name>Types.ts
```

For transaction detail forms that need parties, posting accounts, responsibility centers, and project-style responsibility centers, use:

```text
app/src/hooks/shared/maintenance/useMaintenanceDetailsLookups.ts
```

This hook owns the repeated React Query loading and edit/view preservation behavior for shared maintenance dropdowns. Domain-specific hooks such as `useCashDisbursementDetailsLookups` should only pass the domain query segment and remain thin compatibility wrappers.

Use module-local services only as thin wrappers when the UI needs a module-specific name but the source is shared:

```ts
export async function fetchPettyCashFundAccountOptions() {
  return fetchMaintenancePostingAccountOptions();
}
```

The wrapper must not add mock fallback rows.

## Do Not Hardcode

Do not add constants like these to frontend modules:

```ts
export const InputVatAccountCode = "...";
export const InputVatAccountName = "Input VAT";
export const ExpandedWithholdingTaxAccountCode = "...";
export const ExpandedWithholdingTaxAccountName = "Expanded Withholding Tax";
```

Generated accounting entries should receive account code and account title from the API-backed tax default account options. If the backend cannot resolve a company mapping, leave the generated account fields blank or show an explicit unresolved state. Do not guess a chart account by account name.

## Lookup Implementation Checklist

Before shipping a transaction module:

1. Search for existing shared services and hooks before creating a module-local lookup.
2. Use generated Orval functions at the service boundary.
3. Keep response shaping in shared services or shared data helpers, not repeated inside each page.
4. Preserve current record values as extra dropdown options for edit/view mode, but do not use static mock fallback rows.
5. Use tenant-scoped React Query keys from the shared service or hook.
6. Distinguish shared lookup failures from transaction save failures in UI state.
7. Run `rg` for hardcoded account codes, tax code arrays, and mock lookup names in the target module.

## Related Backend Documentation

- `gr8bookslite-backend/docs/modules/maintenance/maintenance-reusable-lookup-apis.md`
- `gr8bookslite-backend/docs/modules/tax/tax-default-account-api.md`
- `gr8bookslite-backend/docs/modules/tax/TAX_DOCUMENTATION.md`
