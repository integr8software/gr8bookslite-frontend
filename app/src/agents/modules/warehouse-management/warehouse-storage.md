# Warehouse Storage

Warehouse Storage is the sidebar group for configuration modules that define where inventory can be stored.

## Child Modules

- Storage Locations
- Storage Layout
- Item Location Setup
- Capacity & Storage Rules
- Location Availability

## Key Rules

- Every child module must require or inherit a selected warehouse.
- Editable screens must not mix locations from multiple warehouses.
- `All Warehouses` is read-only and should be used only for summaries or comparisons.
- The existing `WS` module code is reserved for Storage Locations.

## Data Boundary

Warehouse Storage configures possible storage. It should not be the authority for current stock quantities; stock quantity belongs to Warehouse Inventory and movement documents.
