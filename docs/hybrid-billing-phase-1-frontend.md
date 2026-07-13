# Hybrid Billing Phase 1 Frontend

## Scope

Phase 1 adds the frontend user experience for hybrid billing only.

No backend billing logic, Prisma migrations, PayMongo service changes, or webhook changes are included.

## Billing Modes

The UI now separates billing into two modes:

| Mode | Behavior |
|---|---|
| `MANUAL` | Hosted checkout style payment. No saved payment method. No automatic deduction. |
| `AUTO` | Existing recurring subscription flow. Saves/uses a PayMongo card payment method and renews automatically. |

The existing auto-renewal/card path remains intact.

## Frontend Changes

### Shared UI

Added `BillingMethodSelector`.

It presents:

- Manual Payment
  - GCash
  - Maya
  - QRPh
  - Visa / Mastercard
  - BPI Direct Debit
  - UBP Direct Debit
  - no saved card
  - no automatic deduction
- Auto Renewal
  - saved payment method
  - automatic renewal
  - existing subscription setup flow

### Mock Manual Checkout

Added a mock abstraction:

```ts
CreateManualCheckout()
```

This returns a mock checkout URL and session identifiers. It is intentionally isolated in the billing service layer so Phase 2 can replace it with a real backend endpoint.

### Mock Routes

Added frontend-only routes:

| Route | Purpose |
|---|---|
| `/billing/mock-checkout` | Mock PayMongo hosted checkout screen. |
| `/billing/payment/success` | Manual payment success state. |
| `/billing/payment/failed` | Manual payment failed state. |
| `/billing/payment/pending` | Manual payment pending state. |
| `/billing/payment/cancelled` | Manual payment cancelled state. |
| `/billing/payment/expired` | Manual payment expired state. |

These routes do not call PayMongo or the backend.

## Updated Flows

### Onboarding Billing

The onboarding billing step now asks for billing method.

Manual:

```text
Select Billing Method
-> Manual Payment
-> Continue to hosted checkout
-> Mock checkout
-> Payment result screen
-> Return to onboarding review
```

Auto:

```text
Select Billing Method
-> Auto Renewal
-> Existing card form
-> Existing PayMongo payment-method flow
```

Manual onboarding finalization is UI-only in Phase 1. Backend activation remains a Phase 2 task.

### Workspace Billing and Subscription

Workspace billing now lets each company choose:

- Manual Payment
- Auto Renewal

Manual renewal opens the mock checkout flow. Auto renewal keeps the existing saved-card behavior.

### Additional Company Billing

The company creation form now includes the billing method selector.

Manual:

```text
Select plan
-> Select Manual Payment
-> Submit
-> Mock checkout
```

Auto:

```text
Select plan
-> Select Auto Renewal
-> Saved/new card setup
-> Existing company billing payload
```

## Design Decisions

1. Manual and Auto are explicit modes.

This avoids mixing one-time hosted checkout with recurring saved-card billing.

2. Manual checkout is mocked through a service boundary.

The UI calls `CreateManualCheckout()` instead of embedding mock behavior directly into components. Phase 2 can replace that function with a backend API call.

3. Existing auto renewal is not refactored.

The current card/tokenization/subscription flow remains as-is and only appears when Auto Renewal is selected.

4. Status pages are route-based.

Success, pending, failed, cancelled, and expired states are separate routes so redirect behavior can be reviewed before backend integration.

5. Additional company manual flow does not call backend yet.

Since the backend manual checkout endpoint does not exist, the frontend opens mock checkout before creating the company. Phase 2 should create the backend payment request and company provisioning sequence.

## Backend TODO for Phase 2

- Add `billingMode` and `autoRenew` persistence.
- Add a manual payment request table.
- Add backend endpoint:

```http
POST /api/v1/billing/checkout-sessions
```

- Add backend payment request status endpoint.
- Add PayMongo Checkout Session creation in `PaymongoService`.
- Add webhook support for manual checkout/payment events.
- Verify amount, currency, company, plan, and payment request metadata before activation.
- Connect onboarding manual payment to `UserOnboardingDraft`.
- Connect additional company manual payment to company provisioning.
- Connect renewal manual payment to subscription extension.
- Ensure frontend no longer uses mock checkout once backend support exists.

## Non-Goals

- No Prisma changes.
- No backend implementation.
- No webhook changes.
- No PayMongo live integration for manual checkout.
- No removal of existing auto subscription behavior.
