# Warehouse Transfer

Warehouse Transfer moves stock from one warehouse to another.

## Scope

- UI exists.
- Backend persistence still needs a full movement document model if not already implemented.

## Recommended Fields

- Transfer Number
- Source Warehouse
- Destination Warehouse
- Transfer Date
- Items
- Status

## Key Rules

- Source and destination warehouses must be different.
- User must have access to the relevant warehouse actions.
- Posting should reduce source stock and increase destination stock.
