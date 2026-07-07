# Default Account Module Guide

Use this guide when working on the Default Account maintenance feature and when wiring its generated accounts into transaction modules.

## Purpose

The Default Account module lets users maintain reusable account templates. When a template is saved, the backend automatically creates the required Chart of Accounts posting account or accounts.

The frontend should treat these records as selectable business templates. Posting must always use the backend-resolved Chart of Accounts IDs, not the template description text.

## Account Types

| Type | UI label | Generated accounts |
|---|---|---:|
| `EXPENSE` | Expense Type | 1 expense account |
| `COLLECTION` | Collection Type | 1 revenue account |
| `FIXED_ASSET` | Fixed Asset Type | 1 asset account, 1 accumulated depreciation account, 1 depreciation expense account |

## Suggested Frontend Folders

- `app/(modules)/maintenance/default-account/page.tsx`
  Thin Next.js route that renders the list page.

- `app/src/ui/modules/maintenance/default-account/`
  Page, table, form/dialog, filters, generated-account preview, and confirmation components.

- `app/src/hooks/modules/maintenance/default-account/`
  React Query integration, list state, search/filter state, form state, save/delete/status behavior.

- `app/src/services/modules/maintenance/default-account/`
  API calls and response mappers for `/api/v1/maintenance/default-accounts`.

- `app/src/constants/modules/maintenance/default-account/`
  Labels, route href, account type options, status options, table columns, and form field definitions.

- `app/src/types/modules/maintenance/default-account/`
  TypeScript-only shapes for records, filters, forms, generated accounts, and API responses.

## Frontend Behavior

The UI should follow the same structure and interaction style as Bank Masterfile:

- List
- Search
- Add
- Edit
- Delete or inactivate
- View generated Chart of Accounts links
- Prevent duplicate descriptions through backend validation and show the returned error
- Keep `type` locked after create

Suggested form fields:

- Type
- Description
- Status

Suggested generated-account display:

- Account role
- Account code
- Account title
- Parent account
- Status

## Backend Contract

Recommended endpoints:

```text
GET    /api/v1/maintenance/default-accounts
GET    /api/v1/maintenance/default-accounts/:id
POST   /api/v1/maintenance/default-accounts
PATCH  /api/v1/maintenance/default-accounts/:id
DELETE /api/v1/maintenance/default-accounts/:id
PATCH  /api/v1/maintenance/default-accounts/:id/status
```

Recommended create request:

```ts
type CreateDefaultAccountRequest = {
  type: 'EXPENSE' | 'COLLECTION' | 'FIXED_ASSET';
  description: string;
  status?: 'ACTIVE' | 'INACTIVE';
};
```

Recommended response:

```ts
type DefaultAccountResponse = {
  id: string;
  type: 'EXPENSE' | 'COLLECTION' | 'FIXED_ASSET';
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  generatedAccounts: Array<{
    role: 'EXPENSE' | 'REVENUE' | 'FIXED_ASSET' | 'ACCUMULATED_DEPRECIATION' | 'DEPRECIATION_EXPENSE';
    chartAccountId: string;
    accountCode: string;
    accountTitle: string;
  }>;
  dateCreated: string;
  dateModified?: string;
};
```

## Generated COA Rules

Expense Type:

```text
Expenses
  {description}
```

Use `expense_coa_id` as the generated posting account.

Collection Type:

```text
Revenue
  {description}
```

Use `revenue_coa_id` as the generated posting account.

Fixed Asset Type:

```text
Assets
  {description}
    {description}
    Accumulated Depreciation - {description}

Depreciation Expense - Property, Plant and Equipment
  Depreciation Expense - {description}
```

Use:

- `asset_coa_id` for asset purchase debit lines.
- `accumulated_depreciation_coa_id` for depreciation credit lines.
- `expense_coa_id` for depreciation expense debit lines.

## Transaction Module Usage

Transaction modules may use Default Account records as selectable templates for resolving posting accounts. The transaction module still decides whether the resolved account is used on the debit side, credit side, or as part of a multi-line accounting entry.

Default Account should not force transaction behavior. It only provides generated Chart of Accounts links that other modules can use.

Recommended account resolution:

| Template type | Generated account normally used for |
|---|---|
| `EXPENSE` | Expense debit lines, expense reversals, or configured transaction lines |
| `COLLECTION` | Revenue credit lines, revenue reversals, or configured transaction lines |
| `FIXED_ASSET` | Asset debit lines, accumulated depreciation credit lines, depreciation expense debit lines |

For modules with different account setup rules, use the module's account setup first. Default Account should be a helper source, not the only source of truth.

Recommended setup priority:

1. Module-specific account setup, if selected or required.
2. Default Account Template generated COA, if the transaction line is tied to a template.
3. Manual COA selection, only if allowed by permissions.
4. Backend validation error if no valid account can be resolved.

Suggested transaction setup shape:

```ts
type TransactionAccountSetup = {
  setupCode: string;
  label: string;
  defaultAccountTemplateId?: string;
  debitChartAccountId?: string;
  creditChartAccountId?: string;
  allowManualAccountOverride?: boolean;
};
```

Recommended transaction line behavior:

1. User selects the transaction's account setup, line type, or purpose.
2. Frontend filters Default Account options by the allowed template types for that context.
3. Backend resolves the final debit and/or credit COA account from setup, template, or permitted manual selection.
4. Frontend displays the resolved COA code and title returned by the backend.
5. Transaction detail stores both the template reference, when used, and the final resolved COA IDs.

Suggested transaction detail fields:

| Field | Required | Purpose |
|---|---:|---|
| `account_setup_id` | No | Selected module-specific setup, if any |
| `default_account_template_id` | No | Selected Default Account Template, if any |
| `debit_chart_account_id` | Depends on transaction | Final debit COA used for posting |
| `credit_chart_account_id` | Depends on transaction | Final credit COA used for posting |

Validation rules:

- Only show Default Account types allowed by the transaction context.
- Validate that resolved COA accounts are active, posting accounts, and belong to the same company.
- Keep resolved COA IDs on posted transactions for historical accuracy.
- Do not recalculate posted accounts when the Default Account description or setup label changes later.

## Important UI Rule

Default Account descriptions are user-facing labels. Transaction modules must post using resolved Chart of Accounts IDs:

- `debit_chart_account_id`
- `credit_chart_account_id`

This keeps posted transactions correct even if the Default Account description is renamed later.
