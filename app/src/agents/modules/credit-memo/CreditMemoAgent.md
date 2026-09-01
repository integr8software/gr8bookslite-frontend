# Credit Memo Frontend Module Specification

Create a new frontend module for Credit Memo using the existing Accounts Payable Voucher UI as the main reference.

The Credit Memo module must look and behave like Accounts Payable Voucher, but it must remove payable-specific fields and sections that are not needed for credit memo accounting entries.

## Primary Reference

Use this module as the UI and implementation reference:

```text
app/(modules)/accounts-payable/accounts-payable-voucher/
app/src/ui/modules/accounts-payable/accounts-payable-voucher/
app/src/hooks/modules/accounts-payable/accounts-payable-voucher/
app/src/data/modules/accounts-payable/accounts-payable-voucher/
app/src/constants/modules/accounts-payable/accounts-payable-voucher/
app/src/types/modules/accounts-payable/accounts-payable-voucher/
app/src/validations/modules/accounts-payable/accounts-payable-voucher/
app/src/services/modules/accounts-payable/accounts-payable-voucher/
```

Reuse the Accounts Payable Voucher layout, styling, spacing, form controls, table styling, validation style, dialogs, buttons, loading states, error handling, and responsive behavior.

Do not redesign the page. Credit Memo should feel like the same screen pattern with fewer fields.

## Fields And Sections To Remove

The Credit Memo frontend must not include these Accounts Payable fields or sections:

```text
Terms of Payment
Due Date
Default Payable Account
Payable Details
```

These must be removed from:

- Page UI
- Tabs
- Form state
- Default values
- Validation schema
- Save/post payload
- API request models
- Mock data
- Labels
- Modals
- Table sections
- Header components

Do not hide them using CSS. They should not be rendered or included unless a shared internal component requires a value, and that exception must be documented in code.

## Recommended Route And Module Structure

Follow the same folder pattern as Accounts Payable Voucher:

```text
app/(modules)/sales/credit-memo/
app/src/ui/modules/sales/credit-memo/
app/src/hooks/modules/sales/credit-memo/
app/src/data/modules/sales/credit-memo/
app/src/constants/modules/sales/credit-memo/
app/src/types/modules/sales/credit-memo/
app/src/validations/modules/sales/credit-memo/
app/src/services/modules/sales/credit-memo/
```

Use the existing project naming conventions if another Credit Memo route or module category already exists.

## Page Behavior

Credit Memo should support the same high-level page behavior as Accounts Payable Voucher:

- List page
- Add page
- Edit page
- View page
- Search and filters where applicable
- View/edit/delete row actions
- Save/Post/Cancel buttons
- Confirmation dialogs
- Success and error notifications
- Loading and saving states
- Form validation messages
- Cancel/back navigation

Only include filters and actions that make sense for Credit Memo and are supported by existing patterns.

## Header Fields

Reuse the Accounts Payable Voucher header layout, but include only Credit Memo-relevant fields.

Expected header fields may include:

- Transaction Number
- Document Date or Transaction Date
- Party Code
- Party Name / Vendor / Payee
- Currency
- Exchange Rate, if the Accounts Payable pattern requires it
- Amount, if needed for accounting total validation
- Remarks
- Read-only Status
- Reference No., if supported by the existing transaction pattern

Do not include:

```text
Terms of Payment
Due Date
Default Payable Account
Payable Details
```

Also avoid Accounts Payable-only concepts such as payable type or credit account unless the existing backend contract explicitly requires them for Credit Memo.

## Detail Area

Credit Memo should focus on accounting entries.

Use one transaction-detail tab:

```text
Accounting Entries
```

Do not include:

```text
Payable Details
Terms of Payment
Expense Details
Other payable-specific tabs
```

If the Accounts Payable Voucher implementation has separate Expense Details and Accounting Entries grids, reuse only the Accounting Entries behavior for Credit Memo.

## Accounting Entries Grid

Reuse the Accounts Payable Voucher Accounting Entries grid or shared `ModuleDataEntry` pattern.

The grid should support:

- Add row
- Edit row
- Delete row
- Account Code
- Account Title / Account Name
- Particulars
- Debit
- Credit
- VAT Type, if already part of the reusable accounting grid
- ATC Code, if already part of the reusable accounting grid
- Party Code, if already part of the reusable accounting grid
- Party Name, if already part of the reusable accounting grid
- Responsibility Center, if already part of the reusable accounting grid
- Ref No., if already part of the reusable accounting grid

Keep column IDs, labels, protected columns, widths, and row actions in constants following the Accounts Payable Voucher pattern.

## Validation Rules

Reuse Accounts Payable Voucher accounting-entry validation where possible.

At minimum:

- Require at least two accounting entry rows.
- Require account code and account title for accounting rows.
- Require either debit or credit per row.
- Do not allow both debit and credit on the same row.
- Total Debit must equal Total Credit.
- Accounting variance must be zero before save/post.
- Exchange rate must be greater than zero if currency/exchange rate is included.
- Header amount must match accounting totals only if the Credit Memo header includes amount.

Do not validate removed fields:

```text
Terms of Payment
Due Date
Default Payable Account
Payable Details
```

## Payload Shape

Prepare a Credit Memo payload with only header values and accounting entries.

Conceptual example:

```json
{
  "header": {
    "transactionNumber": "...",
    "transactionDate": "...",
    "partyCode": "...",
    "partyName": "...",
    "currency": "...",
    "exchangeRate": 1,
    "amount": 0,
    "referenceNo": "...",
    "remarks": "...",
    "status": "Draft"
  },
  "accountingEntries": [
    {
      "accountCode": "...",
      "accountTitle": "...",
      "particulars": "...",
      "debit": 0,
      "credit": 0,
      "partyCode": "...",
      "partyName": "...",
      "responsibilityCenter": "...",
      "refNo": "..."
    }
  ]
}
```

The payload must not include:

```text
termsOfPayment
dueDate
defaultPayableAccount
payableDetails
```

Do not invent backend endpoints or fields. If the backend contract is not available, keep API helpers documented as future integration points.

## Component Reuse Checklist

Before creating new components, inspect and reuse existing pieces from:

- Accounts Payable Voucher form shell
- Accounts Payable Voucher Accounting Entries table
- Shared `ModuleDataEntry`
- Transaction header controls
- Account selection
- Party selection
- Date picker
- Currency and exchange-rate controls
- Remarks input
- Confirmation dialogs
- Save/Post/Cancel buttons
- Validation utilities
- Toast or notification helpers

Create Credit Memo-specific wrappers or configuration only when a reusable Accounts Payable component includes payable-only fields.

## Expected Layout

```text
+------------------------------------------------+
|                  CREDIT MEMO                   |
+------------------------------------------------+
| Transaction Information                        |
|                                                |
| Transaction No. : [              ]             |
| Date            : [              ]             |
| Party/Vendor    : [              ]             |
| Reference No.   : [              ]             |
| Remarks         : [                      ]     |
| Status          : [ Draft        ]             |
+------------------------------------------------+
| [ Accounting Entries ]                         |
+------------------------------------------------+
| Account Code | Account Title | Debit | Credit  |
|              |               |       |         |
|              |               |       |         |
+------------------------------------------------+
| Total Debit  : __________                      |
| Total Credit : __________                      |
| Variance     : __________                      |
+------------------------------------------------+
|                          [Cancel] [Save/Post]  |
+------------------------------------------------+
```

## Implementation Rules

1. Inspect the Accounts Payable Voucher frontend before implementation.
2. Reuse Accounts Payable Voucher UI patterns wherever possible.
3. Remove Terms of Payment, Due Date, Default Payable Account, and Payable Details completely.
4. Keep Credit Memo focused on accounting entries.
5. Follow the existing routing, folder, service, validation, hook, data, constants, and type patterns.
6. Avoid duplicated components when configuration or wrappers can reuse existing components safely.
7. Do not change Accounts Payable Voucher behavior unless a shared bug fix is intentionally required.
8. Do not invent backend contracts. Document missing endpoints clearly.
9. Keep validation consistent with existing balanced-accounting behavior.
10. Make the final module feel like Accounts Payable Voucher with payable-specific details removed.
