# Stock by Location

Stock by Location shows current stock balances by warehouse storage location.

## Scope

- UI shell only.
- Future backend should aggregate balances by `warehouseId + locationId + itemId`.

## Recommended Columns

- Warehouse
- Location Code
- Location Name
- Item
- Lot or Serial
- Quantity On Hand
- Reserved Quantity
- Available Quantity

## Key Rules

- A warehouse selector should drive the main working context.
- `All Warehouses` may be available as read-only summary.
- Location availability and stock occupancy should be visually distinct.
