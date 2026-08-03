# Warehouse Management Functional Specification

## Document Purpose

This document is the product and UI implementation reference for Warehouse Management. It defines the current module structure, business boundaries, UI expectations, and data ownership.

## Definition

Warehouse Management controls the places where company inventory is received, stored, counted, moved, picked, and released.

The module answers four questions:

1. Which warehouses can the company use?
2. Where inside a warehouse can an item be placed?
3. What quantity is currently stored and available?
4. What controlled transaction changes the stock or its location?

Warehouse Management is the stock-location authority. It is not the authority for vehicle condition, trip routing, driver assignment, or fleet maintenance.

## Goals

- Maintain company warehouse records and branch availability.
- Restrict users to warehouses and warehouse actions they are allowed to use.
- Model warehouse storage inside each warehouse with a usable layout UI.
- Show stock balances and availability by warehouse and location.
- Support transfers, counts, adjustments, and inventory visibility.
- Provide an auditable history of inventory movement.
- Hand prepared outbound loads to Delivery Vehicle Management without duplicating inventory records.

## Module Structure

```text
Warehouse Management
|-- Warehouses
|-- Warehouse Access
|-- Warehouse Storage
|-- Warehouse Inventory Stock
`-- Warehouse Inventory Transfer
```

## Current Implementation State

| Module | Current intent |
| --- | --- |
| Warehouses | Keep existing warehouse master behavior. |
| Warehouse Access | Keep existing warehouse user access behavior. |
| Warehouse Storage | Consolidates warehouse storage, storage layout, item-location setup, capacity and storage rules, and location availability. |
| Warehouse Inventory Stock | Consolidates stock by warehouse, stock by location, stock movement history, item availability, stock count, and warehouse stock adjustments. |
| Warehouse Inventory Transfer | Consolidates warehouse transfer and location transfer. |

Do not recreate route, UI, data, hook, type, service, validation, or constants folders for the merged child concepts.

## Core Terminology

| Term | Definition |
| --- | --- |
| Warehouse | A company-controlled physical or logical inventory facility. |
| Branch availability | The branches allowed to transact with a warehouse. This is not user permission. |
| Warehouse access | A user's permission to view or perform specific actions in a warehouse. |
| Storage location | A stock-bearing or operational place inside one warehouse, such as a zone, aisle, rack, shelf, bin, receiving area, or dispatch area. |
| Location hierarchy | Parent-child structure used to organize locations inside one warehouse. |
| Available | Quantity that may be promised or picked, generally `on hand - reserved - blocked - quality hold`. |
| Putaway | Movement from a receiving area to a final storage location. |
| Picking | Removal of stock from storage to satisfy an approved outbound demand. |
| Posting | Finalizing a transaction so it updates inventory ledger and balances. |

## Module Requirements

### Warehouses (`WM`)

Maintain warehouse code, name, address, manager, contact, description, branch availability, status, and audit fields. A warehouse can be available to all branches, specific branches, or all except selected branches.

### Warehouse Access (`WA`)

Grant company users access to one or more warehouses and specific warehouse actions. Transaction APIs must enforce access rules; hiding UI actions is not sufficient.

### Warehouse Storage (`WS`)

Maintain the warehouse storage experience as one screen. It owns location code, name, type, parent location, purpose, capacity, rules, status, and location availability.

The UI should support a visual location field similar to the reference layout: a navigator on the left, an interactive warehouse location grid in the middle, and selected location details on the right. Clicking a location must surface availability, capacity use, parent path, purpose, and actions to view or edit the location.

Rules:

- A location belongs to exactly one warehouse.
- Location code is unique by warehouse.
- Parent and child locations must belong to the same warehouse.
- Capacity and availability are part of the storage record experience.
- Editable views must have one selected warehouse. `All Warehouses` is read-only.
- Stock-bearing child locations cannot be removed when they contain quantity or are referenced by an open document.

### Warehouse Inventory Stock (`WSI`)

List stock by warehouse and location at the same time. This module also owns stock movement history, item availability, stock count, and Warehouse Stock Adjustments.

Rules:

- Stock by warehouse and stock by location are read-only balance views.
- Stock movement history is immutable and must link to source documents when permission allows.
- Item availability answers where an item is usable and how much may be promised or picked.
- Stock count records physical count results and variances.
- Warehouse Stock Adjustments are controlled increases or decreases with reason, approval, and audit data.
- Posted adjustments are reversed by another document, not edited in place.

### Warehouse Inventory Transfer (`WT`)

Move inventory between warehouses and locations. This module replaces separate warehouse transfer and location transfer pages.

Rules:

- Source and destination warehouse/location choices must be valid for the user.
- Source and destination locations must differ when a location transfer is performed.
- Posting must be idempotent and must never reduce or increase stock twice.
- Transfers may be linked to delivery vehicle trips, but the transfer remains the inventory document.

## Data Ownership

| Record | Owned by | Important relationships |
| --- | --- | --- |
| Warehouse | Warehouse Management | Company, branches, access, locations, inventory documents |
| Warehouse access | Warehouse Management | Company, warehouse, user |
| Storage location | Warehouse Management | Warehouse, parent location, capacity, availability |
| Stock balance | Inventory ledger/query layer | Warehouse, location, item, lot/serial |
| Warehouse operation | Warehouse Management | Source document, warehouses, locations, item lines, audit trail |
| Load plan | Delivery Vehicle Management | Outbound demand, warehouse staging/pick records, vehicle type |
| Delivery trip | Delivery Vehicle Management | Origin warehouse, load plan, vehicle, driver, delivery documents |

## Boundary Rules

- Warehouse Management owns stock quantity and stock movements.
- Delivery Vehicle Management owns vehicle capacity, assignment, trip, and transport events.
- A warehouse release and a vehicle dispatch are separate events.
- Only one configured event posts an outbound inventory issue.
- Trip cancellation after warehouse release requires an exception workflow: return to staging, reassign the load, or reverse the issue as applicable.
