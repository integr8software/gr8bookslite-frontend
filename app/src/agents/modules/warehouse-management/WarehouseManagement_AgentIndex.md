# Warehouse Management Agent Index

Each visible module has one canonical lowercase Markdown file in this directory. The file name matches the current module slug, such as `warehouse-storage.md`, `warehouse-transfer.md`, `receiving-putaway.md`, or `picking-dispatch.md`. Keep module-specific product rules, UI requirements, data ownership, and implementation guidance together in that file instead of creating a second `WarehouseManagement_*_UI_Spec.md` document.

The consolidated cross-module specification is `WarehouseManagement_Overview_UI.md`. This index and the overview are cross-module references, not additional module specifications. When adding or changing a module, update its canonical lowercase file and revise the overview only when the change affects shared Warehouse Management behavior.

Each UI specification must be implemented with the shared module components, feature hooks, constants, data mappers, services, types, and validations described in `gr8bookslite-frontend/AGENTS.md`.

Warehouse Management belongs under Accounting and Inventory. It is the parent area for warehouse master data, warehouse access, warehouse-scoped storage configuration, warehouse inventory visibility, and warehouse operations.

## Sidebar Structure

```text
Warehouse Management
|-- Warehouses
|-- Warehouse Access
|-- Warehouse Storage
|-- Warehouse Inventory Stock
|-- Receiving & Putaway
|-- Picking & Dispatch
`-- Warehouse Inventory Transfer
```

## Product Rules

- Every storage module is warehouse-scoped.
- Users select a warehouse before editing locations, capacity, rules, item-location assignments, or availability.
- `All Warehouses` is allowed only for summary, inquiry, or comparison views.
- Warehouse storage belong to exactly one warehouse.
- Branches control access to warehouses; branches do not own bins, racks, or warehouse storage.
- Warehouse Storage configures where inventory can be stored, including layout, item location setup, capacity rules, and location availability.
- Warehouse Inventory Stock shows current stock by warehouse and location, item availability, movement history, stock count, and warehouse stock adjustments.
- Warehouse Inventory Transfer moves inventory between warehouses and locations.
- Receiving & Putaway and Picking & Dispatch remain separate operational modules.

## Architecture Rules

- Frontend routes stay thin and import UI from `app/src/ui/modules/...`.
- Do not recreate folders for merged modules. Retired storage, inventory inquiry, transfer, count, and adjustment concepts belong inside their consolidated module.
- Backend-backed rules and persistence belong in `gr8bookslite-backend/src/modules/maintenance/...`.
- Platform module metadata belongs in `gr8bookslite-backend/prisma/seeds/moduleCatalog.ts`.
- Accounting and Inventory sidebar metadata belongs in `gr8bookslite-backend/prisma/seeds/moduleSystemCatalog.ts`.
- Keep existing backend-backed modules intact: Warehouses and Warehouse Access.
- Preserve the current `WS` module code for Warehouse Storage to avoid breaking existing permissions and routes.

## Current State

- Backend-backed: Warehouses, Warehouse Access.
- UI shell / planned backend: Warehouse Storage, Warehouse Inventory Stock, Receiving & Putaway, Picking & Dispatch, and Warehouse Inventory Transfer.
- Existing Warehouse Storage route is the consolidated storage experience.
