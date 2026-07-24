# Sales Quotation Module

## Scope

The Sales Quotation module provides a local, client-side sales quotation workflow at `/sales/sales-quotation`. It mirrors the Purchase Request interaction pattern while using sales terms and item prices.

## Routes

- `/sales/sales-quotation`: quotation list
- `/sales/sales-quotation/add`: create a quotation
- `/sales/sales-quotation/edit/[recordId]`: edit a quotation
- `/sales/sales-quotation/view/[recordId]`: read-only quotation view

## Data Model

- Party fields use `partyCode` and `partyName`, replacing the purchasing `vceCode` and `vceName` fields.
- Item lines use `itemPrice`, replacing purchasing item cost.
- Entries follow the Purchase Order item structure: UOM precedes quantity, and item price follows quantity. Freight cost, expiration date, budget code, and PRQ quantity are not used.
- VAT is calculated at 12% for VATable lines. EWT and discount use decimal amounts; gross, VAT, EWT, discount, and net totals are shown below the grid.
- Current records are intentionally stored in browser local storage under `gr8books.salesQuotations` until the backend endpoint is available.

## Backend Integration

When API support is introduced, keep sales quotation business rules in the backend sales module. Use tenant-scoped query keys, replace local storage records with API responses, and invalidate quotation queries after mutations. The backend remains authoritative for validation, permissions, document numbering, prices, and audit history.
