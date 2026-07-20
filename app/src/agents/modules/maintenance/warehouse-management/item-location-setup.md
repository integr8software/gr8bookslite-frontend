# Item Location Setup

Item Location Setup defines where each item is stored inside each warehouse.

## Scope

- UI shell only.
- Future backend should persist item-location assignments by warehouse and assignment type.

## Recommended Assignments

- Default Receiving Location
- Default Putaway Location
- Primary Picking Location
- Reserve Location
- Returns Location
- Damaged Goods Location
- Quality Hold Location

## Key Rules

- Assignment must be warehouse-specific because items may be stocked in one warehouse but not another.
- Primary picking location should usually be unique by `warehouseId + itemId + assignmentType`.
- Reserve locations may allow multiple locations per item and warehouse.
