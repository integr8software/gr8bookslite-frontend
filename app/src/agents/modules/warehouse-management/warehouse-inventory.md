# Warehouse Inventory

Warehouse Inventory is the sidebar group for modules that show what is currently stored.

## Child Modules

- Stock by Warehouse
- Stock by Location
- Stock Movement History
- Item Availability

## Key Rules

- Inventory views may allow `All Warehouses` when the result is read-only.
- Queries must respect warehouse access.
- Stock balances should be derived from inventory transactions and movement documents.
- Warehouse Inventory should not define storage configuration.
