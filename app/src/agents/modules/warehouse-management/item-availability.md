# Item Availability

Item Availability shows available stock across warehouses and locations.

## Scope

- UI shell only.
- Replaces the product-facing purpose of Warehouse Stock Inquiry in the new structure.

## Recommended Columns

- Item
- Warehouse
- Location
- Quantity On Hand
- Reserved Quantity
- Blocked Quantity
- Quality Hold Quantity
- Available Quantity

## Key Rules

- This view may support `All Warehouses`.
- It should be read-only.
- Availability must account for reservations, blocked locations, and quality hold stock.
