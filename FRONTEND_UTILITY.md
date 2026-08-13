# Gr8Books Neo Frontend Utility Map

Last updated: 2026-08-12

Use this file before adding a shared helper. The app already has focused
utilities in `app/src/utils/`; import from these files before creating a new
utility so the frontend does not accumulate duplicate formatting,
normalization, parsing, or row-ordering helpers.

Utilities must stay framework-independent and side-effect-free. They should not
read React state, call APIs, access browser storage, own validation rules, or
contain feature-specific business workflows.

## Import Pattern

Use the `@/` alias:

```ts
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDateTime } from "@/app/src/utils/date.util";
import { normalizeWhitespace } from "@/app/src/utils/string.util";
```

## Existing Utilities

### `accounts.util.ts`

Import from `@/app/src/utils/accounts.util`.

- `AccountLevelLabels`: labels for account hierarchy levels.
- `getAccountLevelLabel(accountLevel)`: returns the display label for a known
  account level, or the original value/empty string when unknown.

Use this for chart-of-account level display text.

### `currency.util.ts`

Import from `@/app/src/utils/currency.util`.

- `formatCurrency(value, currencyCode = "PHP")`: formats a number using
  `Intl.NumberFormat` and caches formatters by currency code.

Use this for currency display instead of creating local peso, amount, or
currency formatter functions.

### `date.util.ts`

Import from `@/app/src/utils/date.util`.

- `todayDateValue()`: returns today as `YYYY-MM-DD`.
- `parseIsoDate(value)`: parses a strict `YYYY-MM-DD` string and returns
  `Date | null`.
- `coerceDate(value)`: converts a `Date` or ISO date string to a start-of-day
  `Date | null`.
- `toIsoDate(date)`: formats a `Date` as `YYYY-MM-DD`.
- `startOfDay(date)`: returns the date at local start of day.
- `startOfWeek(date)`: returns the week start.
- `endOfWeek(date)`: returns the week end.
- `startOfMonth(date)`: returns the first day of the month.
- `endOfMonth(date)`: returns the last day of the month.
- `startOfYear(date)`: returns the first day of the year.
- `endOfYear(date)`: returns the last day of the year.
- `addDays(date, days)`: returns a local date moved by day count.
- `addMonths(date, months)`: returns the first day of a shifted month.
- `formatDateTime(value, options)`: formats a date/time for display with
  configurable empty, invalid, and locale values.

Use this for date parsing, date range boundaries, ISO date inputs, and display
date/time formatting.

### `file.util.ts`

Import from `@/app/src/utils/file.util`.

- `formatFileSize(bytes)`: formats bytes as `B`, `KB`, or `MB`.

Use this for file attachment sizes and upload previews.

### `module-import.util.ts`

Import from `@/app/src/utils/module-import.util`.

- `getModuleImportOptionValue(value, options)`: finds the canonical option
  value when an import cell matches an allowed option case-insensitively.
- `isModuleImportOptionValue(value, options)`: checks whether an import value
  matches an allowed option.
- `reorderModuleImportRows(rows, sourceRowId, targetRowId, position)`: returns
  rows reordered before or after a target row.

Use this for import dialogs, imported option normalization, and drag/reorder
behavior in module import flows.

### `number.util.ts`

Import from `@/app/src/utils/number.util`.

- `formatExchangeRateInput(value)`: normalizes exchange-rate input by removing
  commas and invalid characters while preserving a single decimal value.
- `parseAmount(value)`: parses a comma-formatted amount string into
  `number | null`.

Use this for numeric amount parsing and exchange-rate input cleanup.

### `percentage.util.ts`

Import from `@/app/src/utils/percentage.util`.

- `formatPercentage(value)`: formats a numeric value with `%`.
- `formatPartOfTotalPercentage(value, total)`: formats a value as a percentage
  of a total.

Use this for percentage labels, report summaries, and share-of-total metrics.

### `status.util.ts`

Import from `@/app/src/utils/status.util`.

- `MaintenanceActiveStatusSwitchOption`: standard active option.
- `MaintenanceInactiveStatusSwitchOption`: standard inactive option.
- `isActiveStatus(status)`: case-insensitive active status check.

Use this for existing active/inactive status behavior. Do not add a second
active-status helper in a feature.

### `string.util.ts`

Import from `@/app/src/utils/string.util`.

- `normalizeLowercaseText(value)`: trims and lowercases text.
- `normalizeLowercaseWhitespace(value)`: trims, collapses whitespace, and
  lowercases text.
- `normalizeUppercaseText(value)`: trims and uppercases text.
- `normalizeCodeWithHyphens(value, options)`: trims, replaces whitespace with
  hyphens, and uppercases by default or lowercases when requested.
- `normalizeWhitespace(value)`: trims and collapses whitespace.
- `cleanOptional(value)`: returns trimmed text or `undefined`.
- `toOptionalNumber(value)`: returns a number for non-empty text or
  `undefined`.

Use this for text normalization, code normalization, optional string cleanup,
and simple optional numeric conversion.

## Before Adding A Utility

- Search `app/src/utils/` first.
- Import an existing helper when it already covers the behavior.
- Add a new utility only when the behavior is generic and reused across
  unrelated modules.
- Keep feature-specific helpers in that feature's `data`, `services`,
  `validations`, `hooks`, or local UI folder when they are not reusable.
- Do not create catch-all files such as `helpers.ts`.
