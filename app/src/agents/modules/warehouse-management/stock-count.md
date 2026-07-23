# Stock Count

Stock Count records physical counts by warehouse and storage location.

## Scope

- UI shell only under Warehouse Operations.
- Existing Inventory Count can remain as a broader inventory document; this module is the warehouse/location-scoped operational view.

## Recommended Fields

- Count Number
- Warehouse
- Location Scope
- Item Lines
- System Quantity
- Counted Quantity
- Variance

## Key Rules

- Count scope must be warehouse-specific.
- Location-level counts require storage tracking.
- Variances should require review or approval before adjustment.
