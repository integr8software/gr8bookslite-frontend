# Warehouse Access

Warehouse Access controls which users can work with a warehouse and what actions they can perform.

## Scope

- Backend-backed module.
- Controls permissions at warehouse level.
- Does not grant access to individual bins, racks, or storage locations directly.

## Key Rules

- Access is unique by `companyId + warehouseId + userId`.
- Permission sets may include view stock, receive stock, issue stock, transfer stock, adjust stock, manage locations, and view history.
- Warehouse access should respect company membership and accessible warehouses.

## Frontend Placement

- Route: `/warehouse-management/warehouse-access`
- Source: `app/src/ui/modules/warehouse-management/warehouse-access`

## Backend Placement

- Source: `src/modules/maintenance/warehouse-access`
- Prisma model: `WarehouseAccess`
