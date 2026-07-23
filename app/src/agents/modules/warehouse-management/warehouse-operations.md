# Warehouse Operations

Warehouse Operations is the sidebar group for modules that move, count, receive, dispatch, or adjust warehouse inventory.

## Child Modules

- Warehouse Transfer
- Location Transfer
- Receiving & Putaway
- Picking & Dispatch
- Stock Count
- Stock Adjustment

## Key Rules

- Operations create transaction documents.
- Operations should update inventory only when posted, approved, or otherwise finalized by the document workflow.
- Documents should include status, audit fields, warehouse access checks, and transaction numbering.
- Operation modules should use shared transaction data entry patterns when line items are editable.
