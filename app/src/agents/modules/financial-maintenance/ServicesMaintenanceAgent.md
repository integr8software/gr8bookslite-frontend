# Services Maintenance Module Guide

Use this guide when implementing the Services Maintenance module as a new Financial Maintenance feature. Follow the structure and conventions in:

- `gr8bookslite-frontend/AGENTS.md`
- `gr8bookslite-frontend/FRONTEND_MAP.md`
- `gr8bookslite-backend/docs/agents/ARCHITECTURE_MODULARITY_GUIDE.md`
- `gr8bookslite-frontend/app/(modules)/financial-maintenance/term-management/`
- `gr8bookslite-frontend/app/src/ui/modules/financial-maintenance/term-management/`
- `gr8bookslite-frontend/app/src/ui/modules/financial-maintenance/bank-masterfile/`

## Purpose

Services Maintenance lets users maintain sellable service records used by Sales and service-related transactions. Each service has its own accounting setup so revenue posting can resolve to either an automatically generated Chart of Accounts record or an existing active posting account.

The module belongs under Financial Maintenance and should appear after Bank Masterfile in navigation.

## Canonical Module Identity

Recommended module identity:

| Area | Value |
| --- | --- |
| Display label | `Services Maintenance` |
| Feature slug | `services-maintenance` |
| Route | `/financial-maintenance/services-maintenance` |
| Backend path | `/api/v1/maintenance/financial-management/services-maintenance` |
| Permission/module code | `SM` unless a different code is already reserved |
| Sidebar key | `financial-maintenance-services-maintenance` |
| Frontend access key | `maintenance.servicesMaintenance` |

Keep this identity synchronized in all frontend and backend catalogs. Do not create a parallel `maintenance/services` root.

## Fields

Primary fields:

| Field | Required | Notes |
| --- | ---: | --- |
| Name | Yes | Unique per active company, normalized for whitespace/case duplicate checks. |
| Description | No | Plain text, max length should match other maintenance drawers, recommended 500. |
| Status | Yes | `Active` or `Inactive`, using the shared maintenance status switch. |

Accounting Setup tab:

| Field | Required | Notes |
| --- | ---: | --- |
| Account setup mode | Yes | `Generate automatically` or `Select existing`. |
| Revenue account | Yes when selected existing | Use advanced dropdown for active revenue posting accounts. |
| Generated/selected account title | Yes | Display the resolved COA title in all modes. |

Automatic account title format:

```text
[Name]
```

For configured services, this is still where the selected existing account title is shown.

## Accounting Rules

Services Maintenance owns the service-to-revenue-account setup. Transaction modules should post using the resolved Chart of Accounts ID returned by the backend, not by rebuilding account names in the frontend.

Automatic setup:

1. Find the active company system account group under `Service Revenues`.
2. Generate the next child posting account under that group.
3. Create a Chart of Accounts record with account title matching the service name.
4. Link the service record to the generated COA ID.
5. Keep generated account status synchronized with service status.
6. When the service name changes, rename the generated account to the same name.

Select existing setup:

1. User selects an existing active posting account from `Service Revenues`.
2. Store the selected `revenueCoaId` on the service record.
3. Do not rename the selected account when the service name changes.
4. Do not deactivate the selected account when the service is inactivated.
5. Display the selected account's account title in the Accounting Setup tab and list/detail views.

Validation:

- Selected revenue account must belong to the active company.
- Selected revenue account must be active, a posting account, and under `Service Revenues`.
- Automatic generation requires the `Service Revenues` system account group to exist.
- Service names must be unique per company among non-deleted services.
- Inactive services must not be offered as normal transaction choices.

## Frontend Files

Follow the Term Management drawer/list structure, not route-heavy add/edit/view pages, unless the project has already moved Financial Maintenance modules to full-page forms by the time this is implemented.

Routes:

```text
app/(modules)/financial-maintenance/services-maintenance/page.tsx
```

Source folders:

```text
app/src/ui/modules/financial-maintenance/services-maintenance/
  ServicesMaintenanceListPage.tsx
  ServicesMaintenanceHeader.tsx
  ServicesMaintenanceStatisticCards.tsx
  ServicesMaintenanceTable.tsx
  ServicesMaintenanceTableRow.tsx
  ServicesMaintenanceTableFilters.tsx
  ServicesMaintenanceDrawer.tsx
  ServicesMaintenanceFields.tsx
  ServicesMaintenanceAccountingSetupTab.tsx

app/src/hooks/modules/financial-maintenance/services-maintenance/
  useServicesMaintenance.ts
  useServicesMaintenanceListPage.ts
  useServicesMaintenanceFormPage.ts
  useServicesMaintenanceTable.ts

app/src/services/modules/financial-maintenance/services-maintenance/
  ServicesMaintenanceApi.ts
  ServicesMaintenanceQueryKeys.ts

app/src/data/modules/financial-maintenance/services-maintenance/
  ServicesMaintenanceData.ts

app/src/types/modules/financial-maintenance/services-maintenance/
  ServicesMaintenanceTypes.ts

app/src/constants/modules/financial-maintenance/services-maintenance/
  ServicesMaintenanceConstants.ts

app/src/validations/modules/financial-maintenance/services-maintenance/
  ServicesMaintenanceValidation.ts
```

The route file should stay thin:

```tsx
import { ServicesMaintenanceListPage } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceListPage";

export default function Page() {
  return <ServicesMaintenanceListPage />;
}
```

## Frontend UI Behavior

List page:

- Use the same overall composition as `TermManagementListPage`.
- Include `ModuleHeader`-style actions through the existing maintenance header pattern.
- Include statistic cards for total, active, inactive, automatically generated, and configured existing-account services.
- Use shared module table chrome and TanStack table state from hooks.
- Default status filter should align with the nearest financial maintenance module pattern.

Drawer:

- Use add, edit, and view modes.
- Use tabs for `Details` and `Accounting Setup`.
- Details tab contains Name, Description, and Status.
- Accounting Setup tab contains the setup mode selector and account dropdown/preview.
- Disable all inputs in view mode.
- Lock generated account code/title fields as readonly display fields.

Advanced dropdown:

- Use `app/src/ui/shared/advanced-dropdown/`.
- Prefer `ChartAccountDropdown` when selecting an existing COA record because it already wraps `AppAdvancedDropdown` for account title/code display.
- Add an `addAction` labeled `Add Account Title`.
- The add action should open or navigate to Chart of Accounts creation with the parent context set to `Service Revenues` when that flow exists.
- If the direct add flow is not available yet, wire the action to the nearest existing Chart of Accounts add affordance and document the limitation in code comments sparingly.

Suggested dropdown behavior:

```tsx
<ChartAccountDropdown
  accounts={serviceRevenueAccountOptions}
  addAction={{
    label: "Add Account Title",
    onClick: openAddServiceRevenueAccount,
  }}
  disabled={isReadonly || values.accountSetupMode === "AUTO"}
  placeholder="--Select Revenue Account--"
  searchPlaceholder="Search account title or code"
  showSelectedDetails
  value={values.revenueCoaId}
  valueField="id"
  onChange={onRevenueAccountChange}
/>
```

## Frontend Catalog Updates

Update these when implementing:

- `app/src/data/shared/modules/ModuleCatalogData.ts`
  - Add `SM: "/financial-maintenance/services-maintenance"` to `MODULE_ROUTE_MAP`.
  - Add helper text for `maintenance-services-maintenance`.
  - Insert `Services Maintenance` after `Bank Masterfile` in `MainModuleCatalogSections`.
- `app/src/ui/shared/main-layout/sidebar/SidebarIcons.tsx`
  - Add icon mapping for `maintenance-services-maintenance`.
- `app/src/services/auth/AuthContextCache.ts`
  - Add the services maintenance slug if the cache has an explicit maintenance module list.
- `app/src/data/shared/main-layout/sidebar/UserModuleNavigationAdapter.ts`
  - Add a compatibility mapping if backend/sidebar payloads may use stale or alternate service keys.
- `FRONTEND_MAP.md`
  - Add the new route and helper notes after implementation.

## Backend Files

Create a backend module under maintenance:

```text
src/modules/maintenance/services-maintenance/
  services-maintenance.module.ts
  services-maintenance.controller.ts
  services-maintenance.service.ts
  dto/
    create-service-maintenance.dto.ts
    update-service-maintenance.dto.ts
    update-service-maintenance-status.dto.ts
    get-service-maintenance-list-query.dto.ts
  mappers/
    service-maintenance.mapper.ts
  prisma/
    service-maintenance.include.ts
  types/
    service-maintenance.type.ts
  utils/
    service-maintenance-data.util.ts
    service-maintenance-account.util.ts
```

Register the module in `src/app.module.ts`.

Recommended controller path:

```ts
@Controller({
  path: "maintenance/financial-management/services-maintenance",
  version: "1",
})
```

Recommended endpoints:

```text
GET    /api/v1/maintenance/financial-management/services-maintenance
GET    /api/v1/maintenance/financial-management/services-maintenance/:id
POST   /api/v1/maintenance/financial-management/services-maintenance
PATCH  /api/v1/maintenance/financial-management/services-maintenance/:id
PATCH  /api/v1/maintenance/financial-management/services-maintenance/:id/status
GET    /api/v1/maintenance/financial-management/services-maintenance/account-options
GET    /api/v1/maintenance/financial-management/services-maintenance/next-account-code
```

`account-options` should return active selectable posting accounts under `Service Revenues` for the dropdown.

## Backend Contract

Recommended create/update request:

```ts
type SaveServiceMaintenanceRequest = {
  serviceName: string;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  accountSetupMode: "AUTO" | "EXISTING";
  revenueCoaId?: string | null;
};
```

Recommended response:

```ts
type ServiceMaintenanceResponse = {
  id: string;
  serviceName: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  accountSetupMode: "AUTO" | "EXISTING";
  revenueCoaId: string;
  revenueAccountCode: string;
  revenueAccountTitle: string;
  isGeneratedRevenueAccount: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};
```

Recommended list response:

```ts
type ServiceMaintenanceListResponse = {
  services: ServiceMaintenanceResponse[];
  statistics: {
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
    automaticServices: number;
    configuredServices: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canExport: boolean;
    canImport: boolean;
  };
};
```

## Prisma Model Direction

Add a company-owned model similar to other maintenance master data. Exact naming can follow existing Prisma naming conventions at implementation time.

Suggested shape:

```prisma
model ServiceMaintenance {
  id                        BigInt             @id @default(autoincrement())
  companyId                 Int                @map("company_id")
  company                   Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  revenueCoaId              BigInt             @map("revenue_coa_id")
  revenueCoa                ChartAccount       @relation(fields: [revenueCoaId], references: [id])
  serviceName               String             @map("service_name") @db.VarChar(150)
  description               String?            @db.VarChar(500)
  accountSetupMode          ServiceAccountSetupMode @default(AUTO) @map("account_setup_mode")
  isGeneratedRevenueAccount Boolean            @default(true) @map("is_generated_revenue_account")
  status                    ChartAccountStatus @default(ACTIVE)
  createdByUserId           Int?               @map("created_by_user_id")
  updatedByUserId           Int?               @map("updated_by_user_id")
  createdAt                 DateTime           @default(now()) @map("created_at")
  updatedAt                 DateTime           @updatedAt @map("updated_at")
  deletedAt                 DateTime?          @map("deleted_at")

  @@unique([companyId, serviceName], map: "services_maintenance_company_service_name_unique")
  @@index([companyId], map: "services_maintenance_company_id_idx")
  @@index([companyId, status], map: "services_maintenance_company_status_idx")
  @@index([revenueCoaId], map: "services_maintenance_revenue_coa_id_idx")
  @@map("services_maintenance")
}

enum ServiceAccountSetupMode {
  AUTO
  EXISTING
}
```

If the project prefers a shorter model name such as `Service`, ensure it does not conflict with Nest service class naming or existing sales service invoice terminology.

## Service Revenues COA Seed

The backend must have a system account group for `Service Revenues`.

Update the Chart of Accounts system group tags and defaults near:

- `src/modules/maintenance/chart-of-accounts/utils/system-account-groups.util.ts`
- `src/modules/maintenance/chart-of-accounts/seed/chart-of-accounts-defaults.seed.ts`
- `src/modules/maintenance/chart-of-accounts/seed/chart-of-accounts-system-groups.seed.ts`

Suggested system tag:

```ts
serviceRevenues: "Service Revenues",
servicesMaintenanceRevenueParent: "Services Maintenance Revenue Parent",
```

Suggested group definition:

```ts
servicesMaintenance: {
  serviceRevenueParent: {
    accountGroupIncludes: SystemAccountGroupTags.servicesMaintenanceRevenueParent,
    requiredLevel: ChartAccountLevel.SUB2,
    accountType: ChartAccountType.REVENUE,
    accountNature: AccountNature.CREDIT,
  },
}
```

The exact account level should match the existing COA default hierarchy. The important rule is that generated service revenue accounts become posting accounts underneath `Service Revenues`.

## Backend Permission And Provisioning Updates

Because this adds platform module metadata, wire it through provisioning:

- `prisma/seeds/moduleCatalog.ts`
  - Add code `SM`, name `Services Maintenance`, icon such as `receipt` or `settings`, type `Maintenance`.
- `prisma/seeds/moduleSystemCatalog.ts`
  - Insert `link('financial-maintenance-services-maintenance', 'SM', '<icon>')` after Bank Masterfile.
- `prisma/provisioning/provisioning.runner.ts`
  - Ensure module catalog/module system seeding already includes the updated catalogs.
- Permission checks in backend service should use `SM:${PermissionAction.*}`.
- Reserved company/admin roles should retain full access, matching Bank Masterfile and Term Management.

If the module creates company-owned defaults, wire them through `prisma/company-bootstrap/company-bootstrap.registry.ts`. If it only creates records on user action, no default service records are required.

## Transaction Module Usage

Sales and service transaction modules should consume Services Maintenance records as service options, especially Service Invoice.

Rules for transaction modules:

- Show active services only for normal selection.
- Store the selected service ID and backend-resolved revenue COA ID on transaction lines when posting requires historical accuracy.
- Do not rebuild generated account titles in transaction posting logic.
- Do not recalculate posted revenue accounts if the service is renamed later.
- If a selected service uses an existing configured account, post to that existing account.

## Import Scope

Initial implementation may skip import if not requested, but if import is added, match the Term Management and Bank Masterfile import dialog patterns:

- Keep parsing/defaults in `data`.
- Keep validation in `validations`.
- Keep dialog orchestration in hooks.
- Do duplicate checks before calling the API.
- Let backend remain the authority for account generation and duplicate enforcement.

## Verification Checklist

Frontend:

- `npm run lint`
- `npm run build`
- Search for route/code omissions:

```bash
rg "services-maintenance|Services Maintenance|SM|maintenance.servicesMaintenance" app/src 'app/(modules)'
```

Backend:

- `npm run typecheck`
- `npm test -- --runInBand`
- Run Prisma migration/provision checks required by the current branch workflow.
- Verify a clean company can resolve the `Service Revenues` parent before creating an automatic service account.

Behavior:

- Create active service with automatic account and confirm the generated title matches the service name.
- Create active service with selected existing revenue account and confirm the service displays that account title.
- Rename an automatic service and confirm generated COA title changes.
- Rename a configured service and confirm selected existing COA title does not change.
- Inactivate automatic service and confirm generated COA is inactivated.
- Inactivate configured service and confirm selected existing COA remains unchanged.
- Confirm Services Maintenance appears after Bank Masterfile in frontend and provisioned backend sidebar templates.
