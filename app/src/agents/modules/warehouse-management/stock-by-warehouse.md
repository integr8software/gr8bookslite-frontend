# Stock by Warehouse

Stock by Warehouse summarizes item stock by warehouse.

## Scope

- UI shell only.
- Future backend should aggregate stock by accessible warehouse.

## Recommended Columns

- Warehouse
- Item
- Quantity On Hand
- Reserved Quantity
- Available Quantity
- Inventory Value

## Key Rules

- This view may support `All Warehouses`.
- It should remain read-only.
- It should not show bin-level details by default.
