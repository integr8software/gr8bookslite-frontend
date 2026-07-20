# Capacity & Storage Rules

Capacity & Storage Rules maintains limits and restrictions for locations inside a selected warehouse.

## Scope

- UI shell only.
- Future backend should support rules at warehouse, zone, rack, and bin levels.

## Recommended Fields

- Warehouse
- Location
- Maximum Weight
- Weight Unit
- Maximum Volume
- Volume Unit
- Maximum Pallets
- Warning Threshold
- Mixed Items Allowed
- Storage Restriction

## Key Rules

- Lower-level rules may override warehouse defaults.
- Capacity configuration is not the same as current stock occupancy.
- Occupancy should be calculated from stock balances and capacity limits.
