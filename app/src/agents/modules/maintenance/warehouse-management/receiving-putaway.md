# Receiving & Putaway

Receiving & Putaway receives stock into a warehouse and assigns final storage locations.

## Scope

- UI shell only.
- Future backend should connect to purchase receiving, goods receipt, or direct receiving flows.

## Recommended Fields

- Receiving Document
- Warehouse
- Receiving Location
- Putaway Location
- Items
- Status

## Key Rules

- Receiving may land in a default receiving location first.
- Putaway moves received stock into final picking or reserve locations.
- Default putaway rules may come from Item Location Setup.
