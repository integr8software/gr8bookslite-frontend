# Service Quotation Module Guide

Use this guide when implementing **Service Quotation**. It is a separate Sales transaction module that follows the existing Sales Quotation workflow and presentation, but quotes maintained services rather than inventory items.

Read before implementation:

- `gr8bookslite-frontend/AGENTS.md`
- `gr8bookslite-frontend/FRONTEND_MAP.md`
- `gr8bookslite-backend/docs/agents/ARCHITECTURE_MODULARITY_GUIDE.md`
- `gr8bookslite-backend/docs/agents/BACKEND_INTEGRATION_GUIDE.md`
- `app/src/agents/modules/sales/sales-quotation.md`
- `app/src/agents/modules/financial-maintenance/ServicesMaintenanceAgent.md`
- `app/(modules)/sales/sales-quotation/`

## Purpose

Service Quotation prepares customer quotations for services. It must match the list, add, edit, view, print-preview, PDF, approval, tax, totals, and local draft behavior of Sales Quotation, with service lines in place of item lines.

This is not a rename or replacement of Sales Quotation. Keep the existing item-based quotation module intact because it continues to serve inventory-item sales.

## Canonical Module Identity

| Area | Value |
| --- | --- |
| Display label | `Service Quotation` |
| Feature slug | `sales-quotation-services` |
| Route | `/sales/sales-quotation-services` |
| Backend path | `/api/v1/sales/sales-quotation-services` |
| Recommended module code | `SQS` |
| Sidebar key | `sales-sales-quotation-services` |
| Local-storage key while unwired | `gr8books.salesQuotationServices` |

Use `SQS` only if it is not already reserved in the backend module catalog. If the platform uses a different stable code, use that code consistently in the frontend route map, permissions, backend catalog, transaction numbering, and form-signatory configuration.

## Routes

```text
app/(modules)/sales/sales-quotation-services/
  page.tsx
  add/page.tsx
  edit/[recordId]/page.tsx
  view/[recordId]/page.tsx
```

Keep all route files thin. They should import the matching feature list or form page from `app/src/ui/modules/sales/sales-quotation-services/`.

## Reuse Boundaries

Use the existing Sales Quotation module as the closest implementation reference. Reuse shared module components and extract genuinely common quotation-only code only when both modules need it. Do not change the existing Sales Quotation types or silently add service behavior to its item-line model.

The new feature owns its own:

- constants, types, data mappers/local storage, hooks, validation, service/query keys, and UI components;
- quotation document-number sequence and print/PDF labels;
- service-line validation and service option loading.

Use Services Maintenance as the source of selectable services. Normal selection must show active services only. The backend must resolve the service's revenue account; the quotation frontend must not recreate revenue-account logic or generated account titles.

## Frontend File Layout

Mirror the Sales Quotation structure with service-specific names:

```text
app/src/ui/modules/sales/sales-quotation-services/
  SalesQuotationServicesListPage.tsx
  SalesQuotationServicesFormPage.tsx
  SalesQuotationServicesDetailsForm.tsx
  SalesQuotationServicesPartyFields.tsx
  SalesQuotationServicesEntries.tsx
  SalesQuotationServicesEntryColumns.tsx
  SalesQuotationServicesFormControls.tsx
  SalesQuotationServicesTableRow.tsx
  SalesQuotationServicesPreviewDrawer.tsx
  SalesQuotationServicesPrintPreview.tsx
  SalesQuotationServicesPdf.ts
  index.ts

app/src/hooks/modules/sales/sales-quotation-services/
  useSalesQuotationServices.ts
  useSalesQuotationServicesListPage.ts
  useSalesQuotationServicesFormPage.ts

app/src/data/modules/sales/sales-quotation-services/
  SalesQuotationServicesData.ts

app/src/types/modules/sales/sales-quotation-services/
  SalesQuotationServicesTypes.ts

app/src/constants/modules/sales/sales-quotation-services/
  SalesQuotationServicesConstants.ts

app/src/validations/modules/sales/sales-quotation-services/
  SalesQuotationServicesValidation.ts

app/src/services/modules/sales/sales-quotation-services/
  SalesQuotationServicesApi.ts
  SalesQuotationServicesQueryKeys.ts
  SalesQuotationServicesAuditLog.ts
```

Keep form state, row mutations, derived totals, routing, and submit behavior in hooks. Keep Zod schemas and validation helpers in `validations`. Use `ModuleDataEntry` for the editable service grid and shared module/table UI for the list page.

## Document Header and Workflow

Keep the existing Sales Quotation header fields and behavior, including customer/party details, quotation number, date, status, currency, exchange rate, project, remarks, department, company print header, prepared-by/approved-by signatories, preview, and PDF output.

Change every customer-facing and accessible label from `Sales Quotation` to `Service Quotation` where it identifies this document. The printable document title should be `SERVICE QUOTATION`.

Use the same statuses as Sales Quotation unless the backend contract establishes a shared transaction status enum:

```text
Draft | Open | Approved | Closed | Cancelled
```

## Service Lines

Rename the line collection from `items` to `services` throughout the new module: types, form values, validation paths, local storage, grid title, empty-row copy, print/PDF output, totals, and API DTOs.

Each line should use this frontend shape:

```ts
type SalesQuotationServiceLine = {
  id: string;
  serviceId: string;
  serviceName: string;
  description: string;
  quantity: number;
  unit: string;
  serviceRate: number;
  vatAmount: number;
  ewtAmount: number;
  discountAmount: number;
  vatable: "True" | "False";
  vatInclusive: "True" | "False";
  vatType: string;
  responsibilityCenter: string;
};
```

Service-line grid requirements:

- Set the grid title to `Services` and the empty row label to `sales quotation service line`.
- Replace Item Code, Barcode, Item Name, Item Category, and Item Price with Service, Description, Unit, and Service Rate.
- The Service field must be an accessible dropdown/search control backed by active Services Maintenance records. Selecting a service fills `serviceId`, `serviceName`, and its maintained description when available.
- `serviceRate` is the quoted rate and is editable. Services Maintenance currently owns service/account setup, not a default selling-price contract; do not invent or persist a master price until that contract exists.
- Retain quantity, unit, gross amount, VAT amount, EWT, discount, net amount, VATable, VAT Inc., VAT Type, and Responsibility Center. Quantity and unit support hours, sessions, trips, or other service measures.
- Preserve the existing row operations: add, insert, duplicate, move, remove, clear, export affordances, readonly mode, column visibility, and total footer.
- Do not expose inventory-only fields such as item code, barcode, item category, stock availability, item cost, or inventory UOM options.

Amount calculations remain the Sales Quotation calculation pattern:

```text
gross = quantity × serviceRate
VAT   = gross × 12% when vatable
net   = gross + VAT − EWT − discount
```

If VAT-inclusive pricing receives distinct accounting requirements, implement that as a backend-approved rule and update the shared contract; do not create a conflicting frontend-only calculation.

## Validation

Define Zod validation in `SalesQuotationServicesValidation.ts`.

- Require the Sales Quotation header fields required by the existing module.
- Require at least one valid service line.
- Require a selected `serviceId`, service name, unit, positive quantity, and non-negative service rate for each completed line.
- Require non-negative VAT, EWT, and discount amounts.
- Validate VATable and VAT-inclusive values against the shared boolean options.
- Preserve existing image-size validation for the company logo and signatures.
- The backend remains authoritative for service availability, tenant ownership, document numbering, price policy, tax treatment, status transitions, permissions, and audit history.

## Local Data Before API Wiring

Until the backend endpoint exists, use a separate local-storage key:

```text
gr8books.salesQuotationServices
```

Seed records, blank-line defaults, ID creation, normalization, totals, and document-number helpers must be feature-local under `data/modules/sales/sales-quotation-services`. Do not share browser storage with item-based Sales Quotation.

Once the API is available, remove the local-storage CRUD fallback rather than allowing it to silently diverge from server records.

## Backend Integration Contract

Create the backend feature in the existing Sales domain. Controllers stay thin; DTOs validate input; services own tenant checks, permissions, status transitions, document numbering, service lookup, tax/total rules, persistence, and audit behavior; mappers return stable response shapes.

Recommended endpoints:

```text
GET    /api/v1/sales/sales-quotation-services
GET    /api/v1/sales/sales-quotation-services/:id
POST   /api/v1/sales/sales-quotation-services
PATCH  /api/v1/sales/sales-quotation-services/:id
GET    /api/v1/sales/sales-quotation-services/service-options
```

`service-options` must be tenant-scoped and return active Services Maintenance records suitable for quotation selection. It should include the stable service ID, name, optional description, and backend-resolved revenue-account reference needed for future posting, without making the frontend rebuild accounting rules.

Frontend API calls belong in `SalesQuotationServicesApi.ts` and must use the shared `ApiClient`. Query keys must include active company, branch/unit when applicable, filters, pagination, sorting, and record ID. Invalidate the tenant-scoped list/detail queries after creates or updates.

## Navigation and Catalog Updates

When implementing the runtime module, add the new Sales navigation link immediately below Sales Quotation.

In `app/src/data/shared/modules/ModuleCatalogData.ts`:

```ts
SQS: "/sales/sales-quotation-services",
```

Add helper text for both canonical and compatibility keys:

```ts
"sales-sales-quotation-services": "Prepare customer quotations for services.",
"sales-quotation-services": "Prepare customer quotations for services.",
```

Place the catalog item directly above Service Invoice:

```ts
moduleItem("sales-sales-quotation", "Sales Quotation", "SQ", "sales"),
moduleItem(
  "sales-sales-quotation-services",
  "Service Quotation",
  "SQS",
  "sales",
),
```

Also update the sidebar icon mapping, auth/sidebar navigation adapter compatibility mapping where backend payloads can use legacy keys, and any module-code allowlists or caches. Add the platform module, permissions, and sidebar template in backend provisioning so a clean deployment exposes the module; do not rely on a manual seed command.

## Verification Checklist

- Confirm all list, add, edit, view, print-preview, and PDF paths work under `/sales/sales-quotation-services`.
- Confirm the Sales sidebar shows **Service Quotation** directly above **Service Invoice**.
- Confirm existing Sales Quotation behavior and routes remain unchanged.
- Confirm only active Services Maintenance records appear in normal service selection.
- Confirm selecting a service populates service data without displaying inventory-only columns.
- Confirm totals, VAT, EWT, discount, and net amount match the service-line calculations.
- Confirm readonly view blocks all header and row edits.
- Confirm service quotation local storage does not affect `gr8books.salesQuotations` before API wiring.
- Run `npm run lint` and `npm run build` in `gr8bookslite-frontend`.
- When the backend is added, run its typecheck, test, migration, provisioning, and tenant-isolation checks required by the current branch.
