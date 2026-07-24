# Warehouse Management Functional Specification

## Document Purpose

This document is the product and UI implementation reference for Warehouse Management. It defines the module's purpose, terminology, child modules, workflows, business rules, data ownership, integrations, and relationship with Delivery Vehicle Management.

This is a planning document only. UI or backend implementation must begin only after this document has been reviewed and approved.

## Definition

Warehouse Management controls the places where company inventory is received, stored, counted, moved, picked, and released.

The module answers four different questions:

1. **Warehouse master:** Which warehouses can the company use?
2. **Warehouse storage:** Where inside a warehouse can an item be placed?
3. **Warehouse inventory:** What quantity is currently stored and available?
4. **Warehouse operations:** What controlled transaction changes the stock or its location?

Warehouse Management is the stock-location authority. It is not the authority for vehicle condition, trip routing, driver assignment, or fleet maintenance.

## Goals

- Maintain company warehouse records and their branch availability.
- Restrict users to warehouses and warehouse actions they are allowed to use.
- Model storage locations inside each warehouse.
- Show stock balances and availability by warehouse and location.
- Support receiving, putaway, transfers, picking, dispatch staging, counts, and adjustments.
- Provide a complete, auditable history of inventory movement.
- Hand prepared outbound loads to Delivery Vehicle Management without duplicating inventory records.

## Out of Scope

- Item definitions, units of measure, and item pricing; these belong to Item Management.
- Purchase and sales document approval; these belong to Purchasing and Sales.
- Vehicle registration, capacity, availability, drivers, trips, fuel, inspections, and repairs; these belong to Delivery Vehicle Management.
- General accounting entries; these belong to the applicable transaction and accounting modules.
- Real-time GPS tracking.

## Core Terminology

| Term | Definition |
| --- | --- |
| Warehouse | A company-controlled physical or logical inventory facility. |
| Branch availability | The branches allowed to transact with a warehouse. This is not user permission. |
| Warehouse access | A user's permission to view or perform specific actions in a warehouse. |
| Storage location | A stock-bearing or operational place inside one warehouse, such as a zone, aisle, rack, shelf, bin, receiving area, or dispatch area. |
| Location hierarchy | Parent-child structure used to organize locations inside one warehouse. |
| On hand | Quantity physically recorded in inventory. |
| Reserved | Quantity committed to a demand document and not available for another demand. |
| Blocked | Quantity or location prevented from normal use. |
| Quality hold | Quantity awaiting inspection or disposition. |
| Available | Quantity that may be promised or picked. Proposed formula: `on hand - reserved - blocked - quality hold`. |
| Putaway | Movement from a receiving area to a final storage location. |
| Picking | Removal of stock from storage to satisfy an approved outbound demand. |
| Dispatch staging | A warehouse location where picked stock waits for loading or release. |
| Posting | Finalizing a transaction so it updates the inventory ledger and balances. |

## Module Structure

```text
Warehouse Management
|-- Warehouses
|-- Warehouse Access
|-- Warehouse Storage
|   |-- Storage Locations
|   |-- Storage Layout
|   |-- Item Location Setup
|   |-- Capacity & Storage Rules
|   |-- Location Availability
|   `-- Location Templates
|-- Warehouse Inventory
|   |-- Stock by Warehouse
|   |-- Stock by Location
|   |-- Stock Movement History
|   `-- Item Availability
`-- Warehouse Operations
    |-- Warehouse Transfer
    |-- Location Transfer
    |-- Receiving & Putaway
    |-- Picking & Dispatch
    |-- Stock Count
    `-- Stock Adjustment
```

## Current Implementation State

The status below records the state at the time this specification was written. It is not the desired final state.

| Area | Current state | Intended state |
| --- | --- | --- |
| Warehouses | List and form UI are connected to a warehouse API. | Retain and align with this specification. |
| Warehouse Access | List, directory, create, update, and revoke flows are connected to an API. | Retain and enforce access in every warehouse query and operation. |
| Storage Locations | UI uses generated/demo warehouse storage data even though backend storage scaffolding exists. | Use persisted, warehouse-scoped locations. |
| Warehouse Transfer | UI derives sample transfer data from warehouse records. | Use a persistent transfer document and movement posting. |
| Warehouse Stock Inquiry | Derived/demo inquiry. | Consolidate its product purpose under Item Availability. |
| Remaining Storage, Inventory, and Operations pages | Planning shells. | Implement in the sequence described below. |

## Child Module Requirements

### 1. Warehouses (`WM`)

**Use:** Maintain the warehouse master record.

Recommended fields:

- Warehouse ID
- Code
- Name
- Address
- Manager
- Contact number
- Description
- Branch availability mode
- Included or excluded branches
- Status
- Created/updated audit fields

Rules:

- Code and name are unique within a company.
- A warehouse can be available to all branches, specific branches, or all except selected branches.
- Branch availability controls organizational use; Warehouse Access controls individual user actions. Both checks apply.
- Inactive warehouses remain visible in historical records but cannot be selected for new transactions.
- A warehouse cannot be deactivated while it has an active operation that would become invalid unless the user resolves or cancels that operation.
- A location being blocked or under maintenance must not automatically inactivate its warehouse.

### 2. Warehouse Access (`WA`)

**Use:** Grant a company user access to one or more warehouses and specify allowed actions.

Recommended access levels:

- Viewer
- Picker
- Manager

Supported permissions:

- View Stock
- Receive Stock
- Issue Stock
- Transfer Stock
- Adjust Stock
- Manage Locations
- View History

Rules:

- One assignment is unique by company, warehouse, and user.
- Branch eligibility does not automatically grant warehouse access.
- Company administrators may use the existing administrative bypass policy.
- Transaction APIs must enforce the permission; hiding a UI action is not sufficient security.
- Revoked or inactive access remains auditable.

### 3. Storage Locations (`WS`)

**Use:** Maintain physical and operational locations inside a selected warehouse.

Recommended fields:

- Warehouse
- Location code
- Location name
- Location type
- Parent location
- Purpose
- Barcode
- Sequence or pick priority
- Status

Suggested location types:

- Zone
- Aisle
- Rack
- Shelf
- Bin
- Floor
- Receiving
- Dispatch Staging
- Returns
- Damaged Goods
- Quality Hold

Rules:

- A location belongs to exactly one warehouse.
- Location code is unique by warehouse.
- Parent and child locations must belong to the same warehouse.
- Stock-bearing child locations cannot be removed when they contain quantity or are referenced by an open document.
- Editable views must have one selected warehouse. `All Warehouses` is read-only.

### 4. Storage Layout (`WLY`)

**Use:** Visualize one warehouse's location hierarchy, capacity, occupancy, and availability.

Required views:

- Hierarchy/tree
- Rack or grid
- Location details

Later enhancement:

- Configurable warehouse map

Rules:

- Occupancy is calculated from inventory and capacity; it is not a manually selected status.
- Availability and occupancy must be displayed as separate values.

### 5. Item Location Setup (`WILS`)

**Use:** Define preferred locations for an item in each warehouse.

Assignment types:

- Default Receiving
- Default Putaway
- Primary Picking
- Reserve
- Returns
- Damaged Goods
- Quality Hold
- Dispatch Staging, when item-specific staging is needed

Rules:

- Assignments are specific to an item and warehouse.
- A primary picking assignment should be unique per item and warehouse.
- Multiple reserve locations may be allowed.
- Defaults suggest a location; they do not bypass availability, capacity, or restriction checks.

### 6. Capacity & Storage Rules (`WCSR`)

**Use:** Define what a warehouse or location can safely store.

Recommended fields:

- Warehouse and optional location
- Maximum weight and unit
- Maximum volume and unit
- Maximum pallet or unit count
- Warning threshold
- Mixed items allowed
- Hazardous, temperature, category, or handling restrictions
- Override permission and reason

Rules:

- More specific location rules override warehouse defaults.
- The system warns before the limit and blocks over-capacity use unless an authorized override is permitted.
- Current occupancy is calculated; configured capacity is maintained here.

### 7. Location Availability (`WLA`)

**Use:** Control whether a location may participate in warehouse operations.

Statuses:

- Available
- Reserved
- Blocked
- Under Maintenance
- Quality Hold
- Inactive

Recommended fields:

- Warehouse and location
- Status
- Reason
- Effective date/time
- Expected available date/time
- Changed by

Rules:

- Availability is an operational control, not an occupancy indicator.
- Unavailable locations are excluded from normal receiving, putaway, transfer, and picking choices.
- Existing stock in a blocked location remains visible and requires an authorized recovery workflow.

### 8. Location Templates (`WLT`)

**Use:** Create reusable location structures for new or existing warehouses.

Actions:

- Generate locations from a template.
- Copy a warehouse structure.
- Copy selected zones.
- Auto-generate location codes.
- Apply default capacity and storage rules.

Rules:

- Templates do not hold stock.
- Generated locations must be previewed and validated before saving.
- Generation creates real locations under only one selected warehouse.

### 9. Stock by Warehouse (`WSBW`)

**Use:** Show item balances summarized by warehouse.

Columns:

- Warehouse
- Item
- On hand
- Reserved
- Blocked
- Quality hold
- Available
- Optional inventory value

This is a read-only view and may use `All Warehouses`.

### 10. Stock by Location (`WSBL`)

**Use:** Show balances at storage-location level.

Columns:

- Warehouse
- Location
- Item
- Lot, batch, or serial when applicable
- On hand
- Reserved
- Available
- Location availability
- Capacity/occupancy indicator

This is read-only. Location availability and calculated occupancy must not be combined into one status.

### 11. Stock Movement History (`WSMH`)

**Use:** Provide the immutable, read-only audit trail of posted inventory movements.

Filters and columns:

- Movement date/time
- Item
- Quantity and unit
- Source warehouse/location
- Destination warehouse/location
- Document type and number
- Movement direction
- Posted by

Every row must link to its source document when the user has permission.

### 12. Item Availability (`WIA`)

**Use:** Answer where an item is available and how much can be promised or picked.

The final UI should absorb the business purpose of the older Warehouse Stock Inquiry screen so there is one canonical stock-availability inquiry.

This is read-only and may use `All Warehouses`.

### 13. Warehouse Transfer (`WT`)

**Use:** Move stock between different warehouses.

Recommended header fields:

- Transfer number
- Transfer date
- Source warehouse
- Destination warehouse
- Requested by
- Reference and remarks
- Status

Recommended line fields:

- Item
- Source location
- Destination location, when known
- Requested quantity
- Issued quantity
- Received quantity
- Unit
- Lot, batch, or serial

Suggested statuses:

- Draft
- Submitted
- Approved
- In Transit
- Partially Received
- Received
- Cancelled

Rules:

- Source and destination warehouses must differ.
- Source issue and destination receipt must be auditable separately.
- A transfer vehicle or trip can be linked, but the warehouse transfer remains the inventory document.
- Posting must be idempotent and must never reduce or increase stock twice.

### 14. Location Transfer (`WLOCT`)

**Use:** Move stock between locations inside the same warehouse.

Suggested statuses:

- Draft
- Posted
- Cancelled

Rules:

- Source and destination locations must differ and belong to the selected warehouse.
- Posting changes location balances but not the warehouse total.
- The source must have sufficient available stock.

### 15. Receiving & Putaway (`WRP`)

**Use:** Receive inbound stock and place it into final storage.

Inputs may originate from:

- Purchase receiving or receiving report
- Goods receipt
- Warehouse transfer receipt
- Customer return
- Authorized direct receipt

Suggested workflow:

`Expected -> Receiving -> Received -> Putaway In Progress -> Completed`

Rules:

- Receiving may first place stock in a receiving location.
- Putaway uses item defaults, availability, capacity, and storage restrictions to suggest destinations.
- Receipt and putaway may be separate movements.
- The source transaction remains the commercial or inventory document of record.

### 16. Picking & Dispatch (`WPD`)

**Use:** Reserve, pick, stage, and release stock for an outbound demand.

Inputs may originate from:

- Pick list
- Sales order or approved delivery document
- Goods issue
- Warehouse transfer
- Material request

Suggested workflow:

`Open -> Allocated -> Picking -> Picked -> Staged -> Released -> Cancelled`

Rules:

- Picking uses available stock and excludes blocked or quality-hold quantity.
- The system may suggest primary pick locations, then reserve locations.
- Picked items move to a dispatch-staging location when location tracking is enabled.
- A staged load may be linked to a delivery load plan and trip.
- Stock is issued at one explicit business event configured for the source workflow, normally warehouse release or posting. Vehicle dispatch must not post the same issue again.

### 17. Stock Count (`WSC`)

**Use:** Record physical count results for a warehouse or selected locations.

Suggested statuses:

- Draft
- Counting
- Submitted
- Reviewed
- Posted
- Cancelled

Rules:

- Count scope is fixed after counting begins.
- The system stores system quantity, counted quantity, and variance.
- Approval or review is required before a variance creates a stock adjustment.
- Posting the resulting adjustment is the only step that changes stock.

### 18. Stock Adjustment (`WSA`)

**Use:** Record controlled increases or decreases that are not represented by a normal receipt, issue, or transfer.

Required information:

- Adjustment number and date
- Warehouse and location
- Item and quantity change
- Unit cost when valuation requires it
- Reason code and explanation
- Supporting attachment when required
- Approval and audit data

Rules:

- A reason is mandatory.
- Negative adjustments cannot make stock invalid unless the company's negative-stock policy allows it.
- Posted adjustments are reversed by another document, not edited in place.

## Shared Status Principles

- `Draft` records may be edited.
- `Submitted` records await approval or action.
- `Approved` records are authorized but have not necessarily changed inventory.
- `Posted`, `Released`, or another explicitly documented final event changes inventory.
- `Cancelled` records do not change inventory. A posted record must be reversed instead of cancelled.
- Status transitions and posting must be validated by the backend.

## Data Ownership and Relationships

| Record | Owned by | Important relationships |
| --- | --- | --- |
| Warehouse | Warehouse Management | Company, branches, access, locations, inventory documents |
| Warehouse access | Warehouse Management | Company, warehouse, user |
| Storage location | Warehouse Management | Warehouse, parent location, capacity, availability |
| Stock balance | Inventory ledger/query layer | Warehouse, location, item, lot/serial |
| Warehouse operation | Warehouse Management | Source document, warehouses, locations, item lines, audit trail |
| Load plan | Delivery Vehicle Management | Outbound demand, warehouse staging/pick records, vehicle type |
| Delivery trip | Delivery Vehicle Management | Origin warehouse, load plan, vehicle, driver, delivery documents |

## Connection to Delivery Vehicle Management

Warehouse Management and Delivery Vehicle Management meet at outbound staging and inbound/transfer transport.

### Outbound handoff

1. An approved demand document creates a picking requirement.
2. Warehouse staff allocate, pick, and stage the items.
3. Picking & Dispatch exposes the staged load's quantity, weight, volume, handling rules, origin warehouse, and readiness.
4. Delivery Vehicle Management creates or updates a load plan.
5. A compatible vehicle and delivery team are assigned.
6. Warehouse staff confirm loading and release.
7. The delivery trip is dispatched and tracked by Delivery Vehicle Management.

### Transfer handoff

1. Warehouse Transfer authorizes source-to-destination movement.
2. Source staff pick and release the transfer.
3. Delivery Vehicle Management may carry the transfer as a trip load.
4. The destination warehouse receives and puts away the stock.

### Boundary rules

- Warehouse Management owns stock quantity and stock movements.
- Delivery Vehicle Management owns vehicle capacity, assignment, trip, and transport events.
- A vehicle can be linked to an inventory document but must not become the stock ledger.
- A warehouse release and a vehicle dispatch are separate events.
- Only one configured event posts an outbound inventory issue.
- Trip cancellation after warehouse release requires an exception workflow: return to staging, reassign the load, or reverse the issue as applicable.
- Delivery completion does not automatically mean warehouse stock should be issued if it was already issued at release.

## Connections to Other Modules

| Module | Connection |
| --- | --- |
| Item Management | Supplies item, unit, dimensions, weight, lot/serial, and storage/handling attributes. |
| Purchasing | Supplies inbound purchase and receiving demand. |
| Sales | Supplies approved outbound demand, customer, delivery address, and requested date. |
| Inventory | Supplies goods receipt, goods issue, material request, pick list, delivery receipt, count, and movement records. |
| Party Management | Supplies vendors, customers, carriers, drivers when represented as parties, and delivery addresses. |
| System Administration | Supplies users, roles, approvals, numbering, audit trail, and signatories. |
| Accounting | Receives valuation and posting results from finalized inventory transactions. |

## UI Principles

- Require a visible warehouse selector on warehouse-scoped screens.
- Never mix editable records from multiple warehouses in the same form.
- Allow `All Warehouses` only for read-only inquiry, summary, and comparison views.
- Use standard module headers, statistic cards, tables, filters, pagination, drawers/forms, confirmation dialogs, and data-entry grids.
- Show status, document number, warehouse context, and audit details consistently.
- Keep unavailable choices visible with an explanation when that helps the user understand why they cannot be selected.
- Provide direct links between an operation, its source document, its stock movements, and its related delivery trip.
- Make loading, empty, error, permission-denied, and no-warehouse-selected states explicit.

## Security, Audit, and Validation

- Scope all data by active company.
- Apply branch availability and warehouse access independently.
- Validate referenced warehouses, locations, users, items, and documents on the backend.
- Record creator, updater, approver, poster, status-change history, and timestamps.
- Require a reason for overrides, blocking, adjustments, cancellations, and reversals.
- Preserve posted-document history.
- Prevent duplicate submission/posting through idempotency or equivalent transaction controls.
- Exports must apply the same company and warehouse access filters as the screen.

## Proposed Implementation Order

1. Confirm terminology, statuses, and the inventory posting event.
2. Reconcile the old Warehouse Stock Inquiry with Item Availability.
3. Finish persistent Storage Locations and the warehouse selector/context.
4. Implement Stock by Warehouse, Stock by Location, and Movement History from the inventory ledger.
5. Implement Item Location Setup, availability, capacity, and layout.
6. Implement Receiving & Putaway and Picking & Dispatch.
7. Implement transfers, counts, and adjustments.
8. Connect staged outbound loads and transfer loads to Delivery Vehicle Management.

## UI Acceptance Criteria

- Every sidebar entry has a purposeful list, inquiry, workspace, or form screen.
- Warehouse-scoped screens clearly show the selected warehouse.
- Users see only warehouses and actions allowed by company, branch availability, and warehouse access.
- Read-only inventory totals reconcile across warehouse, location, and movement-history views.
- Posted operations produce exactly one set of stock movements.
- Source documents, operation documents, movements, and delivery trips are traceable through links.
- Unavailable stock and locations cannot be used without an authorized, audited exception.
- UI behavior is responsive and includes loading, empty, error, permission, and confirmation states.

## Decisions to Confirm Before UI Implementation

1. At which event is outbound stock issued: `Released from Warehouse`, `Vehicle Dispatched`, or another existing document posting event? Recommended: use the existing source-document posting rule, with Warehouse Release as the operational handoff, and never post again at vehicle dispatch.
2. Should warehouse transfers support partial issue and partial receipt? Recommended: yes.
3. Should negative stock ever be allowed? Recommended: company policy, default off.
4. Is lot, batch, serial, and expiry tracking required in the first UI version? Recommended: show when the item requires it.
5. Should Storage Layout begin with hierarchy/tree only or include a rack/grid editor immediately? Recommended: hierarchy/tree first.
6. Should the old Warehouse Stock Inquiry route redirect to Item Availability after consolidation? Recommended: yes.
