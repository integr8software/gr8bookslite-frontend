# Storage Locations

Storage Locations maintains the physical locations inside a selected warehouse.

## Scope

- UI shell exists through the current Warehouse Storage route.
- Future backend should persist storage locations with a required `warehouseId`.

## Recommended Fields

- Warehouse
- Location Code
- Location Name
- Location Type
- Parent Location
- Purpose
- Status

## Key Rules

- Location code is unique by `warehouseId + locationCode`.
- The same location code may exist in different warehouses.
- Parent location must belong to the same warehouse.
- Location status should represent operational use, not calculated occupancy.

## Frontend Placement

- Route: `/maintenance/warehouse-storage`
- Module code: `WS`
