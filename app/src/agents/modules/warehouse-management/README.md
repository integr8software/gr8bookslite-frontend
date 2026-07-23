# Warehouse Management Module Plan

Warehouse Management belongs under Accounting and Inventory. It is the parent area for warehouse master data, warehouse access, warehouse-scoped storage configuration, warehouse inventory visibility, and warehouse operations.

## Sidebar Structure

```text
Warehouse Management
├── Warehouses
├── Warehouse Access
├── Warehouse Storage
│   ├── Storage Locations
│   ├── Storage Layout
│   ├── Item Location Setup
│   ├── Capacity & Storage Rules
│   ├── Location Availability
│   └── Location Templates
├── Warehouse Inventory
│   ├── Stock by Warehouse
│   ├── Stock by Location
│   ├── Stock Movement History
│   └── Item Availability
└── Warehouse Operations
    ├── Warehouse Transfer
    ├── Location Transfer
    ├── Receiving & Putaway
    ├── Picking & Dispatch
    ├── Stock Count
    └── Stock Adjustment
```

## Product Rules

- Every storage module is warehouse-scoped.
- Users select a warehouse before editing locations, capacity, rules, item-location assignments, or availability.
- `All Warehouses` is allowed only for summary, inquiry, or comparison views.
- Storage locations belong to exactly one warehouse.
- Branches control access to warehouses; branches do not own bins, racks, or storage locations.
- Warehouse Storage configures where inventory can be stored.
- Warehouse Inventory shows what is currently stored.
- Warehouse Operations moves, receives, counts, dispatches, or adjusts inventory.

## Architecture Rules

- Frontend routes stay thin and import UI from `app/src/ui/modules/...`.
- UI-only modules should still have constants, routes, and agent docs so they can be wired later without duplicate module concepts.
- Backend-backed rules and persistence belong in `gr8bookslite-backend/src/modules/maintenance/...`.
- Platform module metadata belongs in `gr8bookslite-backend/prisma/seeds/moduleCatalog.ts`.
- Accounting and Inventory sidebar metadata belongs in `gr8bookslite-backend/prisma/seeds/moduleSystemCatalog.ts`.
- Keep existing backend-backed modules intact: Warehouses and Warehouse Access.
- Preserve the current `WS` module code for Storage Locations to avoid breaking existing permissions and routes.

## Current State

- Backend-backed: Warehouses, Warehouse Access.
- UI shell / planned backend: Storage Locations, Warehouse Inventory, Warehouse Operations, and the remaining child modules.
- Existing Warehouse Storage route is revised to mean Storage Locations.
