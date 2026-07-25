# Payment Type Frontend Backend Integration

This document describes the `Maintenance > Financial Management > Payment Type` backend integration. The module follows the same process used by Term Management, with default payment type records owned by backend per-company seeding.

## References

- Frontend route: `gr8bookslite-frontend/app/(modules)/financial-maintenance/payment-type/page.tsx`
- Frontend data: `gr8bookslite-frontend/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData.ts`
- Frontend hook/service: `gr8bookslite-frontend/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType.ts`, `gr8bookslite-frontend/app/src/services/modules/financial-maintenance/payment-type/PaymentTypeService.ts`
- Term Management frontend API pattern: `gr8bookslite-frontend/app/src/services/modules/financial-maintenance/term-management/TermManagementApi.ts`
- Term Management backend pattern: `gr8bookslite-backend/src/modules/maintenance/term-management`
- Frontend rules: `gr8bookslite-frontend/AGENTS.md`, `gr8bookslite-frontend/FRONTEND_MAP.md`
- Backend modularity rules: `gr8bookslite-backend/docs/agents/ARCHITECTURE_MODULARITY_GUIDE.md`

## Current State

The route is thin and already follows the frontend structure rules:

```txt
app/(modules)/financial-maintenance/payment-type/page.tsx
app/src/ui/modules/financial-maintenance/payment-type/
app/src/hooks/modules/financial-maintenance/payment-type/
app/src/services/modules/financial-maintenance/payment-type/
app/src/data/modules/financial-maintenance/payment-type/
app/src/types/modules/financial-maintenance/payment-type/
app/src/validations/modules/financial-maintenance/payment-type/
```

`PaymentTypeService.ts` is API-backed through `ApiClient` like Term Management. The former frontend sample records now belong to backend company default seed data only.

Default payment types seeded per company:

| Payment Type | Classification | Status | Description |
| --- | --- | --- | --- |
| Cash | Cash | Active | Cash payment without additional bank details. |
| Check | With Bank | Active | Bank-issued check payment requiring bank and check details. |
| Bank Transfer within Company | Bank Transfer | Active | Transfer between bank accounts within the same company. |
| Bank Transfer for Another Company | Bank Transfer | Active | Transfer from a company bank account to another company. |
| Debit Memo | Debit | Active | Debit memo payment requiring bank and debit memo details. |
| Manager's Check | Multiple Check | Active | Bank-issued manager's check payment. |
| InstaPay | Online Payment | Active | Real-time bank transfer through InstaPay. |
| PesoNet | Online Payment | Active | Electronic fund transfer through PesoNet. |
| eWallet | Online Payment | Active | Digital wallet payment through an eWallet provider. |

## Backend Target

Create a backend module parallel to `src/modules/maintenance/term-management`:

```txt
gr8bookslite-backend/src/modules/maintenance/payment-types/
  payment-types.module.ts
  payment-types.controller.ts
  payment-types.service.ts
  default-payment-types.ts
  dto/
    create-payment-type.dto.ts
    update-payment-type.dto.ts
    get-payment-type-list-query.dto.ts
    import-payment-types.dto.ts
```

Register `PaymentTypesModule` in `gr8bookslite-backend/src/app.module.ts`.

### Prisma Model

Add a company-scoped model similar to `Term`:

```prisma
model PaymentType {
  id              BigInt                    @id @default(autoincrement())
  companyId       Int                       @map("company_id")
  name            String                    @db.VarChar(150)
  description     String?                   @db.VarChar(500)
  classification  PaymentTypeClassification
  status          PaymentTypeStatus         @default(ACTIVE)
  createdByUserId Int?                      @map("created_by_user_id")
  updatedByUserId Int?                      @map("updated_by_user_id")
  deletedAt       DateTime?                 @map("deleted_at")
  createdAt       DateTime                  @default(now()) @map("created_at")
  updatedAt       DateTime                  @updatedAt @map("updated_at")
  company         Company                   @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@unique([companyId, name], map: "payment_types_company_name_key")
  @@index([companyId], map: "payment_types_company_id_idx")
  @@index([companyId, status], map: "payment_types_company_status_idx")
  @@index([companyId, classification], map: "payment_types_company_classification_idx")
  @@map("payment_types")
}

enum PaymentTypeClassification {
  CASH
  WITH_BANK
  BANK_TRANSFER
  ONLINE_PAYMENT
  MULTIPLE_CHECK
  DEBIT
}

enum PaymentTypeStatus {
  ACTIVE
  INACTIVE
}
```

Use a migration for the model and enums. Do not edit applied migrations.

### Default Seeder

Create `default-payment-types.ts` beside the payment-types service. Treat the former frontend sample rows as backend defaults seeded per company.

Seeder behavior should match `seedCompanyTermManagementDefaults`:

- Accept a Prisma transaction client or `PrismaService`.
- Count active, non-deleted payment types for the company.
- If any exist, do nothing.
- If none exist, create the default rows with `createdByUserId: null`.
- Use `skipDuplicates: true`.

Call `seedDefaultPaymentTypesForCompany` anywhere Term Management seeding is called:

- `src/modules/workspace/companies/workspace-companies.service.ts`
- `src/modules/onboarding/onboarding.service.ts`

### API Endpoints

Use the same controller style as Terms:

```txt
GET   /api/v1/maintenance/financial-management/payment-types
GET   /api/v1/maintenance/financial-management/payment-types/:id
POST  /api/v1/maintenance/financial-management/payment-types
PATCH /api/v1/maintenance/financial-management/payment-types/:id
POST  /api/v1/maintenance/financial-management/payment-types/import
```

The frontend follows the Term Management feature shape: list, create, update, view, activate/deactivate, refresh, column visibility, export, and import.

### Request DTOs

`CreatePaymentTypeDto`:

- `name`: string, required, max 150.
- `description`: string, optional, max 500.
- `classification`: enum `PaymentTypeClassification`, required.
- `status`: enum `PaymentTypeStatus`, optional.

`UpdatePaymentTypeDto` should extend `PartialType(CreatePaymentTypeDto)`.

`GetPaymentTypeListQueryDto`:

- `search`: optional string, max 120.
- `classification`: optional enum.
- `status`: optional enum.
- `page`: optional int, min 1.
- `limit`: optional int, min 1, max 500.
- `sortBy`: one of `name`, `classification`, `status`, `createdAt`, `updatedAt`.
- `sortDirection`: `asc` or `desc`.

`ImportPaymentTypesDto`:

- `paymentTypes`: array of payment type rows, required.
- Each row uses the same user-facing values as the create form: `name`, `description`, `classification`, and `status`.

### Service Rules

Mirror `TermManagementService`:

- Resolve `companyId` from the current authenticated user.
- Verify active company membership.
- Require module permissions for view, create, update, export, and import.
- Enforce unique payment type name per company, case-insensitive, excluding soft-deleted rows.
- Return stable response objects instead of raw Prisma models.
- Map `createdByUserId: null` to `System Generated`.
- Use soft-delete awareness through `deletedAt: null`.

Use a payment-type permission code assigned for the module. If the module catalog already defines a code, use that exact code. If not, add one consistently with Term Management's `TM` pattern.

## Frontend Target

Replace `PaymentTypeService.ts` with an API-backed service or rename it to `PaymentTypeApi.ts` to match Term Management. Keep query keys beside it.

Recommended frontend service response types:

```ts
export type PaymentTypePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type PaymentTypeStatistics = {
  totalPaymentTypes: number;
  activePaymentTypes: number;
  inactivePaymentTypes: number;
  cashPaymentTypes: number;
  withBankPaymentTypes: number;
  bankTransferPaymentTypes: number;
  onlinePaymentTypes: number;
  multipleCheckPaymentTypes: number;
  debitPaymentTypes: number;
};

export type PaymentTypeListResponse = {
  paymentTypes: PaymentTypeRecord[];
  statistics: PaymentTypeStatistics;
  permissions: PaymentTypePermissions;
};
```

Expected frontend API enum mapping:

| Frontend | Backend |
| --- | --- |
| `Cash` | `CASH` |
| `With Bank` | `WITH_BANK` |
| `Bank Transfer` | `BANK_TRANSFER` |
| `Online Payment` | `ONLINE_PAYMENT` |
| `Multiple Check` | `MULTIPLE_CHECK` |
| `Debit` | `DEBIT` |
| `Active` | `ACTIVE` |
| `Inactive` | `INACTIVE` |

`PaymentTypeRecord.paymentType` should map to backend `name`.

### Hook Changes

`usePaymentType.ts` follows the `useTermManagement.ts` API-backed pattern:

- Use `fetchPaymentTypes` from the API service.
- Return `permissions`, `statistics`, `isRefreshing`, and `refreshPaymentTypes`.
- Use `mutateAsync` for add/update so drawer submit flows can await backend completion.
- Use `mutateAsync` for import so the import dialog can wait for backend completion and show row counts.
- Invalidate `PaymentTypeQueryKeys.all()` after create/update.
- Show status-aware toast copy for activate/deactivate.
- Grant reserved role permissions in the frontend only as a UI convenience; backend remains authoritative.

Query keys should be structured like:

```ts
export const PaymentTypeQueryKeys = {
  all: () => ["paymentTypes"],
  paymentTypes: () => ["paymentTypes", "list"],
};
```

If filters become server-driven, include filter and pagination values in the list key. If company/branch identifiers are exposed in the hook, include company scope in the key as required by the modularity guide.

### Data File State

- Keep runtime data out of the frontend.
- Keep `PaymentTypeOptions`, `PaymentTypeInitialFormValues`, import parsing helpers, and pure form mappers in `PaymentTypeData.ts`.
- Keep company default payment type records in `gr8bookslite-backend/src/modules/maintenance/payment-types/default-payment-types.ts`.

### Validation

Keep frontend validation in `PaymentTypeValidation.ts` for user experience:

- Name required.
- Description max 500.
- Classification required.
- Status required.

Backend DTO validation is still the source of truth.

## Response Shape

List response:

```json
{
  "paymentTypes": [
    {
      "id": "1",
      "name": "PesoNet",
      "description": "Electronic fund transfer through PesoNet.",
      "classification": "ONLINE_PAYMENT",
      "status": "ACTIVE",
      "createdBy": "System Generated",
      "createdAt": "2026-07-07T00:00:00.000Z",
      "updatedBy": null,
      "updatedAt": "2026-07-07T00:00:00.000Z"
    }
  ],
  "statistics": {
    "totalPaymentTypes": 9,
    "activePaymentTypes": 9,
    "inactivePaymentTypes": 0,
    "cashPaymentTypes": 1,
    "withBankPaymentTypes": 1,
    "bankTransferPaymentTypes": 2,
    "onlinePaymentTypes": 3,
    "multipleCheckPaymentTypes": 1,
    "debitPaymentTypes": 1
  },
  "pagination": {
    "page": 1,
    "limit": 500,
    "total": 9,
    "totalPages": 1
  },
  "permissions": {
    "canView": true,
    "canCreate": true,
    "canUpdate": true,
    "canExport": true,
    "canImport": true
  }
}
```

Create/update response:

```json
{
  "message": "Payment type updated successfully.",
  "paymentType": {
    "id": "7",
    "name": "PesoNet",
    "description": "Electronic fund transfer through PesoNet.",
    "classification": "ONLINE_PAYMENT",
    "status": "ACTIVE",
    "createdBy": "System Generated",
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedBy": "Jane User",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

## Implementation Checklist

1. Add Prisma `PaymentType` model and enums.
2. Generate and apply a Prisma migration.
3. Add backend payment-types module, controller, DTOs, service, and default seeder.
4. Register the module in `app.module.ts`.
5. Call the payment-type default seeder anywhere company defaults are provisioned.
6. Replace frontend mock service calls with `ApiClient` calls.
7. Add frontend API mapping between backend enums and frontend labels.
8. Update `usePaymentType.ts` to use backend query data, permissions, statistics, invalidation, and refresh state.
9. Do not use frontend initial records for React Query.
10. Apply the Term Management table format: column visibility, refresh, reset, export, import, persistent table preferences, and import template/preview flow.
11. Run backend tests or targeted service tests, then frontend lint/build.

## Verification

Backend:

```bash
npm run test -- payment-types
npm run build
```

Frontend:

```bash
npm run lint
npm run build
```

Manual QA:

- New company receives the default payment types once.
- Existing company with payment types is not reseeded.
- List loads from the API.
- Search, classification filter, status filter, and sorting still work.
- Column visibility preferences persist.
- Refresh reloads API data.
- Export downloads the filtered table rows.
- Import validates preview rows and creates valid rows through the backend.
- Create rejects duplicate names within the same company.
- Edit updates name, description, classification, and status.
- Activate/deactivate persists after refresh.
- Reserved roles can use the module; non-reserved users follow backend permissions.
