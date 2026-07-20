# Location Templates

Location Templates defines reusable storage layouts that can generate real storage locations for a selected warehouse.

## Scope

- UI shell only.
- Templates are not stock-bearing records.

## Supported Actions

- Generate locations for a new warehouse
- Copy the structure of an existing warehouse
- Copy selected zones
- Generate location codes automatically
- Apply default capacity and storage rules

## Key Rules

- Template output must create real Storage Location records under one warehouse.
- Generated location codes must still pass `warehouseId + locationCode` uniqueness.
- Users should be able to review generated locations before saving.
