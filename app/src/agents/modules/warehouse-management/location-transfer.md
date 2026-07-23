# Location Transfer

Location Transfer moves stock between locations inside the same warehouse.

## Scope

- UI shell only.
- Future backend should post location-level movements without changing warehouse-level totals.

## Recommended Fields

- Transfer Number
- Warehouse
- Source Location
- Destination Location
- Items
- Status

## Key Rules

- Source and destination locations must belong to the selected warehouse.
- Location transfer changes stock location, not total warehouse stock.
- Blocked or unavailable locations should not be selectable for normal transfer.
