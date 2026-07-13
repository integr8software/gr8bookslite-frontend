# Party Management Frontend and Backend Integration

## Purpose

This document defines the integration contract for the Party Management frontend module at `app/(modules)/maintenance/party-management` and the backend `party-maintenance` module used for persistent party records.

Party Management is the shared master file for customers, vendors, and employees used by sales, purchasing, cash receipt, cash disbursement, payroll-linked, tax, and reporting workflows.

## Current State

### Frontend

The frontend route already exists:

- `app/(modules)/maintenance/party-management/page.tsx`
- `app/(modules)/maintenance/party-management/add/page.tsx`
- `app/(modules)/maintenance/party-management/edit/[recordId]/page.tsx`
- `app/(modules)/maintenance/party-management/view/[recordId]/page.tsx`

The feature UI, state, validation, import parsing, and table behavior are implemented under:

- `app/src/ui/modules/maintenance/party-management`
- `app/src/hooks/modules/maintenance/party-management`
- `app/src/types/modules/maintenance/party-management/PartyManagementTypes.ts`
- `app/src/data/modules/maintenance/party-management/PartyManagementData.ts`
- `app/src/validations/modules/maintenance/party-management/PartyManagementValidation.ts`
- `app/src/services/modules/maintenance/party-management/PartyManagementApi.ts`

`PartyManagementApi.ts` now uses the shared `ApiClient` against the backend `party-maintenance` route. The table still keeps the local page helper for client-side table state compatibility, but add, update, import, and list hydration are backend-backed.

### Backend

The backend implements Party Management under:

- `src/modules/maintenance/party-maintenance`
- `prisma/schema.prisma`
- `prisma/migrations/20260710110000_add_party_management`

Related implemented maintenance modules to mirror:

- `src/modules/maintenance/term-maintenance`
- `src/modules/maintenance/discount-maintenance`

Those modules use:

- NestJS controller/service/module structure.
- `JwtAuthGuard`.
- `@CurrentUser()` company context.
- Versioned routes under `/api/v1/maintenance/...`.
- Prisma models scoped by `companyId`.
- DTO validation with `class-validator`.
- Response mappers that serialize IDs as strings.
- List/create/update/import endpoint pattern.

## Recommended Backend Route Contract

Use a backend module named `party-maintenance` to stay consistent with `term-maintenance` and `discount-maintenance`.

Base path:

```text
/api/v1/maintenance/party-maintenance
```

Frontend constant:

```ts
export const PartyManagementApiPath = "/maintenance/party-maintenance";
```

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/maintenance/party-maintenance` | List parties for the active company with filters, sorting, pagination, statistics, and permissions. |
| `GET` | `/maintenance/party-maintenance/:id` | Fetch one party record. |
| `POST` | `/maintenance/party-maintenance` | Create one party. |
| `PATCH` | `/maintenance/party-maintenance/:id` | Update one party, including status changes. |
| `POST` | `/maintenance/party-maintenance/import` | Bulk import valid party rows. |

## Frontend Query Contract

The current frontend table state maps to these backend query parameters:

| Frontend field | Backend query param | Values |
| --- | --- | --- |
| `query` | `query` | Free-text search against display name, party code, email, TIN, contact number, and address. |
| `classification` | `classification` | `INDIVIDUAL`, `NON_INDIVIDUAL`, or omitted for all. |
| `partyType` | `partyType` | `VENDOR`, `CUSTOMER`, `EMPLOYEE`, or omitted for all. |
| `status` | `status` | `ACTIVE`, `INACTIVE`, or omitted for all. |
| `pageIndex` | `page` | Convert to 1-based page before sending. |
| `pageSize` | `pageSize` | Current table page size. |
| `sort.id` | `sortBy` | `name`, `classification`, `partyTypes`, `address`, `status`, `partyCodeNo`. |
| `sort.desc` | `sortDirection` | `asc` or `desc`. |

Recommended list response:

```ts
type ApiPartyListResponse = {
  parties: ApiParty[];
  totalRows: number;
  statistics: {
    activeParties: number;
    inactiveParties: number;
    individualParties: number;
    nonIndividualParties: number;
    multiTypeParties: number;
    totalParties: number;
  };
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canCancel: boolean;
    canUncancel: boolean;
    canExport: boolean;
  };
};
```

## Data Model

Add Prisma enums:

```prisma
enum PartyClassification {
  INDIVIDUAL
  NON_INDIVIDUAL
}

enum PartyType {
  VENDOR
  CUSTOMER
  EMPLOYEE
}

enum PartyStatus {
  ACTIVE
  INACTIVE
}

enum PartyVatRegistrationType {
  VAT_REGISTERED
  ZERO_RATED
  NON_VAT
  EXEMPT
  CAPITAL_GOODS
  OTHER_THAN_CAPITAL_GOODS
  SERVICES
}
```

Recommended Prisma models:

```prisma
model Party {
  id                       BigInt              @id @default(autoincrement())
  companyId                Int                 @map("company_id")
  partyCodeNo              String              @map("party_code_no") @db.VarChar(80)
  classification           PartyClassification
  partyTypes               PartyType[]         @map("party_types")
  status                   PartyStatus         @default(ACTIVE)
  partyName                String?             @map("party_name") @db.VarChar(255)
  tradeName                String?             @map("trade_name") @db.VarChar(255)
  firstName                String?             @map("first_name") @db.VarChar(120)
  middleName               String?             @map("middle_name") @db.VarChar(120)
  lastName                 String?             @map("last_name") @db.VarChar(120)
  suffixName               String?             @map("suffix_name") @db.VarChar(40)
  defaultReceivableAccount String?             @map("default_receivable_account") @db.VarChar(80)
  customerAdvanceAccount   String?             @map("customer_advance_account") @db.VarChar(80)
  defaultPayableAccount    String?             @map("default_payable_account") @db.VarChar(80)
  vendorAdvanceAccount     String?             @map("vendor_advance_account") @db.VarChar(80)
  employeeAdvanceAccount   String?             @map("employee_advance_account") @db.VarChar(80)
  employeePayableAccount   String?             @map("employee_payable_account") @db.VarChar(80)
  termId                   BigInt?             @map("term_id")
  tin                      String?             @db.VarChar(20)
  vatRegistrationType      PartyVatRegistrationType? @map("vat_registration_type")
  atcCode                  String?             @map("atc_code") @db.VarChar(40)
  email                    String?             @db.VarChar(255)
  contactNo                String?             @map("contact_no") @db.VarChar(40)
  createdByUserId          Int?                @map("created_by_user_id")
  updatedByUserId          Int?                @map("updated_by_user_id")
  createdAt                DateTime            @default(now()) @map("created_at")
  updatedAt                DateTime            @updatedAt @map("updated_at")
  company                  Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  addresses                PartyAddress[]

  @@unique([companyId, partyCodeNo], map: "parties_company_code_key")
  @@index([companyId, status], map: "parties_company_status_idx")
  @@index([companyId, classification], map: "parties_company_classification_idx")
  @@map("parties")
}

model PartyAddress {
  id                    BigInt   @id @default(autoincrement())
  partyId               BigInt   @map("party_id")
  addressName           String   @map("address_name") @db.VarChar(120)
  addressLine1          String   @map("address_line_1") @db.VarChar(255)
  addressLine2          String   @map("address_line_2") @db.VarChar(255)
  barangay              String?  @db.VarChar(120)
  barangayCode          String?  @map("barangay_code") @db.VarChar(30)
  cityMunicipality      String?  @map("city_municipality") @db.VarChar(120)
  cityMunicipalityCode  String?  @map("city_municipality_code") @db.VarChar(30)
  province              String?  @db.VarChar(120)
  provinceCode          String?  @map("province_code") @db.VarChar(30)
  region                String?  @db.VarChar(120)
  regionCode            String?  @map("region_code") @db.VarChar(30)
  isBilling             Boolean  @default(false) @map("is_billing")
  isBuilding            Boolean  @default(false) @map("is_building")
  isDefault             Boolean  @default(false) @map("is_default")
  isDelivery            Boolean  @default(false) @map("is_delivery")
  isForeign             Boolean  @default(false) @map("is_foreign")
  isHome                Boolean  @default(false) @map("is_home")
  party                 Party    @relation(fields: [partyId], references: [id], onDelete: Cascade)

  @@index([partyId], map: "party_addresses_party_id_idx")
  @@map("party_addresses")
}
```

Also add `parties Party[]` to `Company`.

Accounting account fields reference company-scoped `ChartAccount` rows with nullable `BigInt` foreign keys. The frontend fetches the active company COA tree and submits `ChartAccount.id` values, not static account-code placeholders.

## API Payload Mapping

Frontend form values are normalized by `createPartySubmitPayload(values)`. Use that as the source of truth for the request payload when replacing local mutations.

Frontend display values to backend enum values:

| Frontend | Backend |
| --- | --- |
| `Individual` | `INDIVIDUAL` |
| `Non-Individual` | `NON_INDIVIDUAL` |
| `Vendor` | `VENDOR` |
| `Customer` | `CUSTOMER` |
| `Employee` | `EMPLOYEE` |
| `Active` | `ACTIVE` |
| `Inactive` | `INACTIVE` |
| `VAT Registered` | `VAT_REGISTERED` |
| `Zero Rated` | `ZERO_RATED` |
| `Non-VAT` | `NON_VAT` |
| `Other Than Capital Goods` | `OTHER_THAN_CAPITAL_GOODS` |

Create/update request:

```ts
type ApiPartyVatRegistrationType =
  | "VAT_REGISTERED"
  | "ZERO_RATED"
  | "NON_VAT"
  | "EXEMPT"
  | "CAPITAL_GOODS"
  | "OTHER_THAN_CAPITAL_GOODS"
  | "SERVICES";

type ApiPartyAddressPayload = {
  addressName: string;
  addressLine1: string;
  addressLine2: string;
  barangay?: string | null;
  barangayCode?: string | null;
  cityMunicipality?: string | null;
  cityMunicipalityCode?: string | null;
  province?: string | null;
  provinceCode?: string | null;
  region?: string | null;
  regionCode?: string | null;
  isBilling: boolean;
  isBuilding?: boolean;
  isDefault: boolean;
  isDelivery: boolean;
  isForeign?: boolean;
  isHome?: boolean;
};

type ApiPartyPayload = {
  branchUnitId?: number;
  partyCodeNo: string;
  classification: "INDIVIDUAL" | "NON_INDIVIDUAL";
  partyTypes: Array<"VENDOR" | "CUSTOMER" | "EMPLOYEE">;
  status?: "ACTIVE" | "INACTIVE";
  partyName?: string | null;
  tradeName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffixName?: string | null;
  addresses: ApiPartyAddressPayload[];
  defaultReceivableAccount?: string;
  customerAdvanceAccount?: string;
  defaultPayableAccount?: string;
  vendorAdvanceAccount?: string;
  employeeAdvanceAccount?: string;
  employeePayableAccount?: string;
  termId?: string | null;
  tin?: string | null;
  vatRegistrationType?: ApiPartyVatRegistrationType | null;
  atcCode?: string | null;
  email?: string | null;
  contactNo?: string | null;
};
```

Response record:

```ts
type ApiParty = ApiPartyPayload & {
  id: string;
  termName?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};
```

Frontend `PartyInformationRecord.address` should be mapped from the default backend address:

```ts
address = addresses.find((address) => address.isDefault) ?? addresses[0]
```

## Backend Validation Rules

Mirror the frontend Zod schema in backend DTO/service validation:

- `partyCodeNo` is required and unique per company.
- `classification` is required.
- `partyTypes` must contain at least one type.
- `Non-Individual` requires `partyName`.
- `Individual` requires `firstName` and `lastName`.
- `Employee` is only allowed for `Individual`.
- Exactly one default address is required.
- Customer or vendor parties require one billing address.
- Customer parties require one delivery address.
- Employee parties require one home address.
- Only one billing, delivery, or home address can be selected.
- Non-foreign addresses require address line 1, address line 2, region code, province code, city/municipality code, and barangay code.
- Foreign addresses require address line 1.
- `tin`, when provided, must match `000-000-000-000`.
- `email`, when provided, must be a valid email.
- `contactNo`, when provided, must match `+63 000 000 0000`.
- Role-specific accounting accounts are required:
  - Customer: `defaultReceivableAccount`, `customerAdvanceAccount`
  - Vendor: `defaultPayableAccount`, `vendorAdvanceAccount`
  - Employee: `employeeAdvanceAccount`, `employeePayableAccount`

## Party Code Numbering

Party Code follows the Transaction Number Setup record for module code `PM`.

- Manual mode: the Party Code field is editable in add flows and the backend requires a submitted `partyCodeNo`.
- Auto mode: the Party Code field is read-only in add flows and shows the next formatted PM number preview from Transaction Number Setup.
- Auto mode backend behavior: create and import generate the authoritative code inside a Prisma transaction using the active company and selected branch, incrementing that branch's `TransactionNumberSequence.currentNumber`.
- Import in auto mode does not require uploaded party codes; import in manual mode still requires unique uploaded party codes.

The reusable backend helper lives at `src/modules/system-administration/transaction-number-sequences/transaction-number-sequence.helper.ts` and exposes branch-aware lookup/generation for transaction numbers.

## Permissions

Use the same permission model as other maintenance modules:

- `VIEW`: list and read.
- `CREATE`: create and import.
- `UPDATE`: edit details and status.
- `CANCEL`: set active party to inactive, if inactive is treated as cancellation.
- `UNCANCEL`: reactivate inactive party.
- `EXPORT`: allow frontend export actions.

The Party Management module code is already seeded as `PM`; permission resolution should target the seeded Party Management module.

## Import Integration

The frontend import dialog currently parses `.xlsx`, `.csv`, `.tsv`, and pasted tabular data locally, then calls `addRecords`.

When the backend is available:

1. Keep local parsing and preview validation for fast user feedback.
2. Convert selected preview rows to `ApiPartyPayload[]`.
3. Call `POST /maintenance/party-maintenance/import` with `{ parties }`.
4. Backend should reject duplicate codes/names within the upload and existing company records.
5. Backend should return persisted `ApiParty[]` so frontend IDs and audit timestamps come from the database.

Recommended import response:

```ts
type ApiPartyImportResponse = {
  message: string;
  parties: ApiParty[];
};
```

## Frontend Migration Steps

1. Add API response/payload types to `PartyManagementTypes.ts`.
2. Replace the local-only `PartyManagementApi.ts` with real `ApiClient` calls:
   - `fetchParties(query)`
   - `fetchParty(id)`
   - `createParty(values)`
   - `updateParty(record)`
   - `importParties(records)`
3. Add mapper functions:
   - `mapApiParty`
   - `toApiPartyPayload`
   - enum mappers for classification, party type, status, and VAT registration type.
4. Update `usePartyManagementStore`:
   - `records` query should call `fetchParties` or be split into list/detail queries.
   - `addRecord` should call `createParty`.
   - `updateRecord` should call `updateParty`.
   - `addRecords` should call `importParties`.
   - Invalidate `PartyManagementQueryKeys.all()` on successful mutations.
5. Move list filtering, sorting, and pagination to the backend once `GET /maintenance/party-maintenance` accepts query params.
6. Preserve frontend validation before submit; backend remains the final source of truth.
7. Keep `PartyInformationInitialRecords` only as fixture/story/demo data or remove it from runtime once backend integration is complete.

## Backend Implementation Checklist

- Add Prisma enums and models for `Party` and `PartyAddress`.
- Add migration and update generated Prisma client.
- Add `PartyMaintenanceModule`, controller, service, DTOs, mapper, include/type helpers, and tests.
- Register the module in `AppModule`.
- Implement list statistics and permission response.
- Implement duplicate checks for company-scoped `partyCodeNo` and display name.
- Implement create/update address replacement transactionally.
- Implement import transaction with duplicate detection.
- Add Swagger decorators and response descriptions.
- Add service tests for validation, permissions, duplicate handling, status changes, and import.
- Regenerate OpenAPI/client artifacts if the project workflow requires it.

## Integration Acceptance Criteria

- Party list loads from the backend for the active company.
- Search, filters, sort, and pagination return backend-backed results.
- Add, edit, status toggle, and import persist after refresh and relogin.
- Individual and non-individual display names match current frontend behavior.
- Address role rules match current form validation.
- Party records remain company-scoped and inaccessible across company contexts.
- Permission-denied users receive backend `403` responses and frontend actions are hidden or disabled according to returned permissions.
- Import returns persisted database IDs and audit timestamps.
