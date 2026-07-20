# Stock Adjustment

Stock Adjustment records approved changes to warehouse or location stock balances.

## Scope

- UI shell only.
- Future backend should create auditable adjustment documents.

## Recommended Fields

- Adjustment Number
- Warehouse
- Location
- Item
- Quantity Change
- Reason
- Status

## Key Rules

- Adjustments must be warehouse-scoped.
- Location is required when the warehouse uses location tracking.
- Adjustments should require reason and audit trail.
