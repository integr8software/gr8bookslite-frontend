# Picking & Dispatch

Picking & Dispatch picks stock from warehouse locations and prepares it for dispatch.

## Scope

- UI shell only.
- Future backend should connect to sales, delivery, issue, and dispatch workflows.

## Recommended Fields

- Pick Document
- Warehouse
- Picking Location
- Dispatch Area
- Items
- Status

## Key Rules

- Pick suggestions may come from Primary Picking Location and availability.
- Dispatch should not allow unavailable or blocked stock.
- Posting should move or issue stock according to the final workflow.
