# Warehouse Inventory

## Definition and Use

Warehouse Inventory is the read-only visibility group for current balances, availability, and posted movement history.

## Child Modules

- Stock by Warehouse (`WSBW`)
- Stock by Location (`WSBL`)
- Stock Movement History (`WSMH`)
- Item Availability (`WIA`)

## Data Authority

Warehouse Inventory does not maintain stock manually. It reads balances derived from posted inventory documents and the inventory movement ledger.

## Shared Rules

- All queries are scoped by active company and Warehouse Access.
- All Warehouses is permitted for read-only summaries and comparisons.
- On-hand, reserved, blocked, quality-hold, and available quantities remain separate.
- Filters and exports must use the same access conditions.
- Summary totals must reconcile with location details and movement history.

## Connections

Warehouse Storage defines possible locations. Warehouse Operations and Inventory transactions create movements. Item Management supplies item/UOM details.

## UI Requirements

- Shared warehouse/item/date filters where appropriate.
- Direct drill-down from summary to location and movement records.
- Clear last-updated, loading, empty, error, and permission states.

## Acceptance

A permitted user can trace a displayed balance from warehouse summary to location detail and its posted movement history.


## Detailed UI Implementation Contract

This section is the build contract for the UI. It must be implemented with the shared module patterns in `app/src/ui/shared/module/` and the feature separation rules in `AGENTS.md`.

### Screen composition

- Render a shared `ModuleHeader` with the module title, one-sentence purpose, breadcrumb/context, and the primary action only when the user has create/execute permission.
- Render `ModuleStatisticCards` for the counts listed in this document. Cards must be derived from the same filtered dataset/query as the table and must not use hard-coded demo totals.
- Place scope selectors before the table/form: active company is implicit, warehouse/branch/date/time context is explicit where required.
- Use `ModuleTable` for dense lists. Keep filters, columns, sorting, pagination keys, hrefs, and option lists in feature constants; keep table state and query orchestration in hooks.
- Use drawers or the standard add/edit/view routes for records. Keep route files thin and render the feature UI from `app/src/ui/modules/...`.

### List and workspace behavior

- Provide search, the documented filters, sortable columns, pagination, column visibility where useful, and export only when the permission response allows it.
- Preserve filter and pagination state per company/module using a feature-specific storage key; clear or revalidate it when company context changes.
- Use stable row keys from persisted IDs. Do not use array indexes for records that can be inserted, removed, or reordered.
- Keep row actions in a feature action component. Disable actions with an explanatory tooltip when a status, permission, availability, or warehouse context prevents them.
- Show a detail drawer or linked view for the complete record, related documents, status history, and audit fields without duplicating editable state in the table.

### Create, edit, and view behavior

- Create forms start with documented defaults and an empty state; edit forms load the persisted record before enabling fields; view forms are read-only and show the same field labels and calculated values.
- Mark required fields with `*`, use real labels, and display field-level errors next to the invalid control. Use advanced dropdowns for searchable company, branch, warehouse, user, item, location, vehicle, document, and party references.
- Keep form state, dirty state, submit orchestration, and navigation in a feature hook. Keep Zod schemas and cross-field rules in `app/src/validations/...`; keep pure defaults/mappers in `app/src/data/...`.
- Disable submit while a mutation is pending, prevent duplicate submission, preserve entered values on validation/API failure, and invalidate the feature query after a successful save.
- Confirm destructive or irreversible actions with an App Dialog. Ask for a reason for blocking, adjustment, cancellation, override, incident closure, or other action identified by the module rules.

### Validation and permissions

- Enforce company scope, branch availability, warehouse access, status transitions, uniqueness, references, quantities, dates, capacity, and conflicts in the UI for immediate feedback and again on the backend as the source of truth.
- Do not show inactive, blocked, retired, expired, or incompatible options as valid choices. If historical records display one, mark it clearly and explain why it cannot be selected.
- Map backend validation errors to the relevant field or line and show a non-field error summary for conflicts that involve multiple records.
- Hide or disable create, edit, post, approve, dispatch, revoke, export, and status actions according to returned permissions; never rely on the UI alone for authorization.

### Loading, empty, error, and accessibility states

- Provide skeleton/loading states for the header, statistics, filters, table, and detail panels; do not flash an empty state while a query is loading.
- Provide a useful empty state with the next action, a filtered-empty state with a clear-filters action, an API error state with retry, and a permission-denied state with no mutation controls.
- Keep keyboard focus in dialogs, announce async success/error feedback, use semantic headings/table headers, and do not communicate status by color alone.
- Display dates/times in the user's timezone while preserving precise backend timestamps; display units and number precision consistently with the company settings.

### Data and integration behavior

- Read from the feature service/API through query keys that include company and scope context. Runtime screens must not use mock/demo data after the module is connected.
- Link related warehouse, inventory, sales, purchasing, party, vehicle, trip, inspection, incident, and maintenance records rather than copying their authoritative fields into a second editable record.
- Invalidate related query keys after mutations and show the returned persisted record, not the optimistic draft, as the source of the success state.
- Keep an audit panel for creator, updater, approver/poster, status changes, timestamps, and reasons. Posted/final records are immutable in the UI and use reversal/exception actions where defined.

### UI verification checklist

- Verify desktop, tablet, and narrow mobile layouts at the actual route.
- Verify loading, empty, filtered-empty, API error, permission-denied, inactive/blocked, and mutation-pending states.
- Verify keyboard navigation, focus management, labels, table semantics, and non-color status cues.
- Verify refresh/relogin persistence, company switching, access filtering, duplicate-submit protection, status transitions, and direct links to related records.
- Verify that every displayed total, status, availability result, and capacity result comes from the documented data rules and reconciles with its related detail view.
