# Workspace Billing & Transactions Mock Module

## Purpose

This frontend-only module adds a provider-neutral billing ledger for workspace owners/admins. It complements the existing `Billing & Subscription` page, which remains focused on subscription setup, company pricing, card selection, renewals, and promotions.

No backend, database, PayMongo API, or webhook changes were added.

## Route And Navigation

- Route: `/workspace/billing-and-transactions`
- Sidebar label: `Billing & Transactions`
- Sidebar access key: `workspace.billing.invoices`
- Existing sidebar architecture used: `MainWorkspaceNavigationSections`

## Sections

The page uses shared module tabs:

- `Overview`
- `Invoices`
- `Payments`
- `Subscription`

## Frontend Structure

Types:

- `app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes.ts`

Mock data and query helpers:

- `app/src/data/workspace/billing-and-transactions/WorkspaceBillingTransactionsData.ts`

Mock service boundary:

- `app/src/services/workspace/billing-and-transactions/WorkspaceBillingTransactionsApi.ts`
- `app/src/services/workspace/billing-and-transactions/WorkspaceBillingTransactionsQueryKeys.ts`

Page hook:

- `app/src/hooks/workspace/billing-and-transactions/useWorkspaceBillingTransactionsPage.ts`

UI:

- `WorkspaceBillingTransactionsPage`
- `WorkspaceBillingTransactionsTable`
- `WorkspaceBillingTransactionsTableRow`
- `WorkspaceBillingTransactionDetailDrawer`

## Model Notes

The module uses normalized frontend records, not PayMongo response shapes.

Important fields:

- `invoiceNo`
- `date`
- `description`
- `category`
- `billingMode`
- `status`
- `amount`
- `companyName`
- `billingPeriodStart`
- `billingPeriodEnd`
- `paymentMethod`
- `providerName`
- `providerReference`
- `issuedDate`
- `paidDate`

Supported billing modes:

- `AUTO`
- `MANUAL`

Supported statuses:

- `PAID`
- `OPEN`
- `PENDING`
- `FAILED`
- `CANCELED`
- `REFUNDED`

Supported categories:

- `PLAN_CHARGE`
- `RENEWAL`
- `ADDITIONAL_COMPANY`
- `ADDITIONAL_USER`
- `ADD_ON`
- `PAYMENT`
- `REFUND`

`providerName` and `providerReference` are display metadata only. UI components must not depend on PayMongo webhook event names or provider-specific response fields.

## Mock Coverage

The mock data includes:

- subscription plan charges
- renewals
- additional company payments
- additional user charges
- future add-on charges
- payments
- refunds
- failed and canceled records

## Future Backend Integration

Replace `GetWorkspaceBillingTransactions()` with a real backend API call that returns the same normalized payload shape:

```ts
type WorkspaceBillingTransactionsPayload = {
  records: WorkspaceBillingTransactionRecord[];
  subscription: WorkspaceBillingSubscriptionSnapshot;
};
```

Recommended backend mapping boundary:

Backend billing DTO / provider payload
↓
frontend service mapper
↓
`WorkspaceBillingTransactionRecord`
↓
workspace UI

Keep provider-specific logic inside the service/mapper layer. The page, table, tabs, summary cards, and drawer should remain provider-neutral.
