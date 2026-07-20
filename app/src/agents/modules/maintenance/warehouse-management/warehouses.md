# Warehouses

Warehouses maintains the warehouse master records for a company.

## Scope

- Backend-backed module.
- Owns warehouse code, name, address, manager, contact details, status, branch availability mode, and branch links.
- Storage locations, stock balances, and bin-level rules do not belong directly in this module.

## Key Rules

- Warehouse code is unique by `companyId + code`.
- Warehouse name is unique by `companyId + name`.
- A warehouse may be owned by one branch, shared with selected branches, or shared with all branches.
- A blocked location must not automatically make the warehouse inactive.

## Frontend Placement

- Route: `/maintenance/warehouses`
- Source: `app/src/ui/modules/maintenance/warehouses`

## Backend Placement

- Source: `src/modules/maintenance/warehouse-maintenance`
- Prisma model: `Warehouse`
