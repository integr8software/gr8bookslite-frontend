# Sales Order Module

## Scope

The Sales Order module is available at `/sales/sales-order`. It follows the Sales Quotation header, party fields, item-entry grid, totals, and printable-document conventions so users can create a sales order manually or from an approved quotation.

## Routes

- `/sales/sales-order`: Sales Order landing page
- `/sales/sales-order/add`: create a Sales Order
- `/sales/sales-order/edit/[recordId]`: edit a Sales Order
- `/sales/sales-order/view/[recordId]`: view a Sales Order

## Copy From Sales Quotation

- The add and edit pages display a **Copy From** button. Its menu contains **Sales Quotation**.
- The picker lists only Sales Quotations whose status is `Open` or `Approved`.
- Selecting a quotation copies its party, header, item lines, totals inputs, and remarks to the Sales Order.
- The source quotation number is shown in the read-only **Reference No** field above the Sales Order details.
- The Sales Order keeps its own transaction number; copying a quotation never changes the Sales Quotation record.

## Local Data And Backend Integration

Sales Orders are temporarily stored in browser local storage under `gr8books.salesOrders`. Sales Quotations remain the source records under `gr8books.salesQuotations`.

When the backend contract is added, the sales domain must own quotation eligibility, customer/item pricing, document numbering, tenant and branch permissions, and the immutable quotation-to-order reference. Replace local-storage reads with tenant-scoped query keys and API services using the shared `ApiClient`; do not trust quotation status or reference numbers supplied only by the browser.
