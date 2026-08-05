# Frontend PR Quality QA Analysis

Use this checklist before finishing frontend module work and frontend-side integration work. The internal PR quality report is stricter than ESLint and flags broad patterns that may indicate misplaced code, repeated business literals, mixed responsibilities, API calls in the wrong layer, or missing async UI states.

Use the project Prettier configuration when reviewing formatting. The expected `printWidth` is `140`, so short prop lists, object entries, options, and simple arrays can stay on one readable line when Prettier keeps them there. Do not split code only to make files look taller, and do not target 1000 lines per page or per component. Prefer smaller files because responsibilities are cleanly separated, not because a line-count quota was reached.

Keep module references generic, but make each code issue specific:

- Use generic ownership paths such as `app/src/ui/modules/<domain>/<feature>/...`, `app/src/hooks/modules/<domain>/<feature>/...`, and `app/src/types/modules/<domain>/<feature>/...`.
- Do not write a module-specific fix as the rule unless the error is truly unique to that module.
- Do name the exact file, reported error, code signal, and concrete fix.
- Prefer "move this API call from this UI file into a service and expose it through this hook" over "clean up the module".

## Warning Types

### Hook Or Server State Is In The Wrong Place

Checkings:
Review hook and server-state code for naming, placement, and ownership. Any custom hook should use the `use...` naming pattern, live in a shared or module-specific hooks folder, and keep server-state work out of UI components. API requests should flow through the service layer and be exposed to the UI through a feature hook that uses the expected TanStack Query pattern. Keep hook functions readable: group state, derived values, callbacks, effects, and returned values in a predictable order, and extract dense business logic into data, validation, or service helpers when it stops being easy to scan.

How to qualify:

- Keep reusable hooks in `app/src/hooks/...`.
- Keep feature hooks in `app/src/hooks/modules/<domain>/<feature>/...`.
- Name hook files and exported hook functions with the `useFeatureThing` pattern, such as `useExampleListPage` or `useExampleFormPage`.
- Keep UI components focused on rendering and local interaction state.
- Put server state in a feature hook that calls a service function.
- Use `useQuery`, `useMutation`, or another TanStack Query API for request state unless a documented exception exists.
- Keep hook returns structured and intentional; avoid returning large ungrouped bags of unrelated values.
- Prefer readable helper names over compressed inline logic inside hooks.

Specific error examples:

- Error: `"ExampleList" calls React hooks but its name does not start with "use".`
  Fix: rename the hook to `useExampleList`.
- Error: `fetch() was found directly inside a UI file.`
  Fix: move the request to `app/src/services/modules/<domain>/<feature>/...Api.ts`, then call that service from `app/src/hooks/modules/<domain>/<feature>/use...ts`.
- Error: `A hook performs an API request without a recognized TanStack Query hook.`
  Fix: wrap the request with `useQuery` or `useMutation` and return `data`, loading, error, and mutation state to the UI.

### Reusable Type May Be In The Wrong Location

Checkings:
Review reusable type declarations for ownership, source of truth, and safety. Record, form, table, drawer, and filter shapes should live in the feature types layer when they are reused. API request and response shapes should come from generated types, temporary schema-gap types should carry a clear removal reference, and `any` should be replaced with a safer generated, shared, or frontend-specific type.

How to qualify:

- Keep record, form, table, drawer, and filter prop types in `app/src/types/modules/<domain>/<feature>/...Types.ts`.
- Component-only props may stay local when they are not reused outside that component.
- Avoid reusable business names like `details` for copy constants if a clearer copy key works.
- In validation messages and other user-facing strings, avoid wording that can look like a TypeScript declaration to the scanner, such as `<business noun> type must ...`. Prefer clearer field wording like `<business noun> name must ...` when the rule is validating a name field.
- Use generated API types from `app/src/generated/...` for backend DTOs.
- If the backend schema is incomplete, keep a temporary frontend type only with a removal reference.
- Replace `any` with `unknown`, a generated DTO, or a clear frontend view model.

Specific error examples:

- Error: `"CreateExampleRequestDto" looks like an API request or response DTO declared manually.`
  Fix: import the generated Orval request type or update the backend OpenAPI schema.
- Error: `"ExampleRecord" is declared outside a shared or module-specific types folder.`
  Fix: move reusable record/form/table types to `app/src/types/modules/<domain>/<feature>/...Types.ts`.
- Error: `The file introduces an explicit any type.`
  Fix: replace `any` with the exact generated DTO, frontend form value type, or `unknown` plus narrowing.

### Repeated Literal May Need A Shared Constant

Checkings:
Review repeated business literals and operational keys for shared ownership. Module labels, route strings, statuses, permissions, query keys, storage keys, table labels, placeholders, and action descriptions should be named once in the appropriate constants file when they are reused across data, validation, hooks, or UI.

How to qualify:

- Move repeated feature literals into `app/src/constants/modules/<domain>/<feature>/...Constants.ts`.
- Use named constants for repeated account titles, statuses, module labels, table labels, placeholders, and action descriptions.
- Keep one-off UI-only text local if it is truly component-specific.
- Reuse route and module values from the existing module catalog when available.
- Reuse status options and defaults in schemas, initial values, table filters, and mock factories.

Specific error examples:

- Error: `The literal "Active" appears multiple times and may need a shared constant.`
  Fix: define feature status options and a default status constant in `...Constants.ts`.
- Error: `A hardcoded storage key was detected.`
  Fix: export a named storage key from the feature constants file and reuse it wherever local storage is accessed.

### Hardcoded Status Value Detected

Checkings:
Review status handling for raw strings embedded in data, validation, filters, initial values, or UI logic. Status options and defaults should be defined once in the feature constants file and reused anywhere the module needs the same status vocabulary.

How to qualify:

- Define status options in the feature constants file.
- Use a named default status constant for initial values and mock factories.
- Reuse status options in Zod schemas instead of repeating enum strings.

### UI Component May Contain Mixed Responsibilities

Checkings:
Review UI components for presentation focus, naming, size, and reuse. Components should use PascalCase filenames, avoid growing into large all-in-one files, and keep reusable copy, static business data, shared types, API calls, validation rules, and state orchestration in their proper feature layers. When a component name already exists elsewhere, confirm whether the existing shared or module component should be reused instead.

How to qualify:

- Keep UI files mostly presentational.
- Move static option descriptions, placeholders, and business labels into constants.
- Move state orchestration to hooks.
- Move mock records and mappers to data files.
- Move validation rules to validations files.
- Keep reusable UI primitives in `app/src/ui/shared/...`.
- Use PascalCase filenames for React components.
- Split large components into smaller UI components, feature hooks, data adapters, and utilities when responsibilities are mixed or the file is hard to scan. Do not wait for a component to reach 1000 lines before refactoring.
- Keep formatting aligned with Prettier using `"printWidth": 140`; do not manually force every JSX prop, object field, or array item onto separate lines when a one-line form remains readable.

Specific error examples:

- Error: `The component contains non-presentation signals: useQuery, interface.`
  Fix: move server-state work into a feature hook and reusable types into `app/src/types/modules/<domain>/<feature>/...Types.ts`.
- Error: `The component file "example-list.tsx" does not follow the required PascalCase filename convention.`
  Fix: rename it to `ExampleList.tsx`.
- Error: `The component contains 1042 lines, exceeding the blocking limit of 1000 lines.`
  Fix: split rendering sections, form orchestration, mappers, and constants into their proper feature files.
- Error: `The component was kept near 1000 lines by squeezing unrelated hook logic, static data, and rendering into one file.`
  Fix: move state orchestration to `app/src/hooks/modules/<domain>/<feature>/use...ts`, static records or mappers to data, and reusable types to types; then run Prettier.

### Fetching Layer Or Request State Is Incomplete

Checkings:
Review API access and request-state handling for the expected frontend flow. Requests should use the configured API client through service functions, not direct `fetch()` calls or UI-level Axios calls. Components that read or mutate server data should receive loading, error, empty, permission-denied, and pending states from hooks and render those states intentionally.

How to qualify:

- Keep API request functions in `app/src/services/modules/<domain>/<feature>/...Api.ts`.
- Let feature hooks call services and own query/mutation state.
- Let UI components render loading, error, empty, permission-denied, and mutation-pending states from the hook.
- Use the shared API client and existing error normalization patterns.

Specific error examples:

- Error: `The project standard requires Axios for API requests, but fetch() was found.`
  Fix: replace `fetch()` with a service function that uses the configured Axios client.
- Error: `A UI component is directly calling Axios or an API client.`
  Fix: move the call into the service layer and call it through a custom TanStack Query hook.
- Error: `The component uses TanStack Query but no recognized error-state handling was found.`
  Fix: render a retryable error state or pass the error to the module table/form state.

### Mock Or Temporary Data Leaked Into Production Code

Checkings:
Review changed files for temporary data that accidentally became production code. Some modules still use mock data while the backend API is unavailable; that is allowed only when the data is isolated, clearly named, and structured to match the expected API contract. Mock, dummy, fake, fixture, sample, placeholder, and very large inline datasets should be removed, moved to approved data ownership, or replaced with service responses once an actual API exists.

How to qualify:

- Keep approved seed or display data in `app/src/data/modules/<domain>/<feature>/...Data.ts`.
- Keep API-pending mock records out of UI components and services.
- Shape temporary mock records like the expected backend response or frontend view model.
- Keep a clear API-readiness note when mock data remains because the endpoint is not available yet.
- Replace mock datasets with service responses when the backend is available.
- If backend work is pending, isolate temporary data and add a clear TODO or ticket reference.

Specific error examples:

- Error: `Production code imports "mock" data.`
  Fix: replace the import with a service/hook call or move approved static data to the feature data file.
- Error: `The changed file contains inline mock data.`
  Fix: remove inline arrays from UI/services and place durable display data in `app/src/data/modules/<domain>/<feature>/...Data.ts`.

### Visual And Responsive QA Is Missing

Checkings:
Review the changed screens at desktop and mobile widths. Layouts should avoid overflow, clipped text, overlapping content, unstable table widths, broken sticky headers, cramped modals, and drawers that cannot scroll or close cleanly. If the app supports more than one theme, check that colors and contrast still work across themes.

How to qualify:

- Verify list, add, edit, view, drawer, modal, table, and empty-state layouts.
- Check long labels, long values, large record counts, narrow mobile screens, and zoomed browser text.
- Keep table density readable without making important actions disappear.
- Use stable dimensions for repeated controls that should not resize during loading or hover.

### Accessibility QA Is Missing

Checkings:
Review keyboard and assistive-technology behavior for changed UI. Interactive controls need accessible names, visible focus states, correct labels, usable tab order, modal focus trapping, screen-reader-friendly errors, and color choices that do not rely on color alone.

How to qualify:

- Icon-only buttons need an accessible label.
- Form controls need label associations and field-level error messaging.
- Dialogs and drawers should trap focus, restore focus on close, and support Escape where appropriate.
- Toasts and async errors should not be the only way to understand a failed action.

### Functional Workflow QA Is Missing

Checkings:
Review complete user flows, not only isolated components. Create, edit, view, delete, status changes, cancel flows, confirmation dialogs, duplicate-submit prevention, optimistic updates, rollback, and retry paths should behave consistently.

How to qualify:

- Disable save actions while a mutation is pending.
- Prevent duplicate submits and repeated status changes.
- Release locks or pending UI state after success and failure.
- Roll back optimistic UI changes when the request fails.
- Keep cancel and close flows from losing data without confirmation when the form is dirty.

### Form QA Is Missing

Checkings:
Review form behavior against the feature schema and backend integration expectations. Required fields, invalid formats, cross-field rules, backend validation mapping, reset behavior, dirty state, disabled submit, and field-level errors should all stay aligned.

How to qualify:

- Keep validation rules in the feature validation file.
- Avoid duplicating validation rules in UI event handlers when the schema should own them.
- Map backend validation errors to specific fields where possible.
- Show non-field errors for conflicts that involve multiple fields or records.
- Reset form state after successful create flows and preserve state where edit flows require it.

### Permission, Route, And Tenant Context QA Is Missing

Checkings:
Review permission, route, company, branch, and tenant context behavior for frontend-side integration. Actions should be hidden or disabled based on the approved permission helpers, direct URL access should be guarded, and query keys or storage keys should not leak data across companies, branches, or tenants.

How to qualify:

- Use existing permission hooks, guards, or HOCs instead of hardcoded role strings.
- Scope query keys, storage keys, table preferences, and cached filters by the required company, branch, or tenant context.
- Verify expired sessions, missing company selection, missing branch selection, and direct route entry.
- Do not let a user see mutation controls when the permission check only allows read access.

### API Contract And Error Handling QA Is Missing

Checkings:
Review frontend API integration against the generated client and shared error handling. Orval output should be current, request payloads should match backend DTOs, response mapping should be explicit, and auth/session retry behavior should use the shared API client instead of local reimplementation.

How to qualify:

- Run API generation when backend contracts changed.
- Use generated request, response, and parameter types where available.
- Keep endpoint calls in services and request state in hooks.
- Use shared error normalization so field, toast, and page errors behave consistently.
- Avoid duplicating silent-refresh or retry behavior already handled by the Axios layer.

### Data Table QA Is Missing

Checkings:
Review tables as working module surfaces. Search, filters, pagination, sorting, column visibility, import, export, refresh, row actions, empty states, filtered-empty states, and preference persistence should work together without losing context.

How to qualify:

- Keep filter and pagination state predictable after create, edit, delete, and refresh.
- Show a useful empty state when no records exist and a different filtered-empty state when filters hide records.
- Preserve table preferences with properly scoped storage keys.
- Check export/import behavior with filtered data, empty data, and large data.

### Browser And Runtime QA Is Missing

Checkings:
Review browser runtime behavior after frontend changes. Next build, hydration, client/server component boundaries, console errors, environment usage, and browser-only APIs should be clean.

How to qualify:

- Run lint, typecheck, and build before handoff.
- Check the browser console for hydration warnings and runtime errors.
- Keep browser-only code behind client components or guarded effects.
- Do not read private environment variables in client code.

### Client State Ownership QA Is Missing

Checkings:
Review client-side state for ownership boundaries. Shared or global state should not mirror server data that belongs in the request/cache layer, and feature-local UI state should not leak into shared app state unless it is intentionally reused across screens.

How to qualify:

- Keep server records, pagination, and request status in query hooks or the approved request-state layer.
- Keep local form drafts, open panels, selected tabs, and transient filters near the feature unless another screen must share them.
- Scope persisted keys by company, branch, or tenant when the state is context-specific.
- Clear or revalidate client state when context changes.

### Socket Listener QA Is Missing

Checkings:
Review realtime listeners for singleton usage and cleanup. Components should not create duplicate Socket.IO connections, bypass shared listener helpers, or leave subscriptions active after unmount.

How to qualify:

- Use the shared socket client or module listener helper.
- Register listeners in effects with stable dependencies.
- Clean up listeners on unmount or context change.
- Scope realtime events by company, branch, tenant, and permission where required.

### Theming And Styling QA Is Missing

Checkings:
Review styling for design-system consistency. Hardcoded hex values, one-off spacing, custom shadows, and local color decisions should not bypass the shared theme or runtime palette unless the feature has a documented exception.

How to qualify:

- Prefer existing tokens, utility classes, and shared component variants.
- Check hover, focus, disabled, active, loading, and error states.
- Verify theme changes do not break text contrast or icons.
- Keep report, PDF, and print styling consistent with the module brand and data density.

### Security And Privacy QA Is Missing

Checkings:
Review frontend code for sensitive data exposure and unsafe browser handling. Tokens, tenant identifiers, private payloads, uploaded files, exported files, logs, and environment values should be handled intentionally.

How to qualify:

- Do not log tokens, credentials, payment data, or sensitive company records.
- Do not store sensitive payloads in local storage unless explicitly approved.
- Keep public environment variables limited to values that are safe for the browser.
- Validate file type, size, preview behavior, and download filenames on upload/export flows.

### Report, PDF, And Export QA Is Missing

Checkings:
Review generated files as user-facing outputs. Print previews, PDFs, spreadsheets, filenames, date formats, currency formats, page breaks, large datasets, and empty exports should match the module workflow.

How to qualify:

- Verify header, footer, totals, line-item wrapping, and page breaks.
- Use shared formatting helpers for dates, currency, quantities, and identifiers.
- Check exported data with filters applied and with no records.
- Keep file names specific enough for users to identify the module, date, and record context.

### Module Structure Is Misplaced

Checkings:
Review changed files for layer ownership and folder placement. Hooks, services, types, UI components, constants, data, and validations should live under the expected shared or module-specific frontend layer, using generic `<domain>/<feature>` paths and creating only the folders that the feature actually uses.

How to qualify:

- Keep module implementation generic by layer:
  - UI: `app/src/ui/modules/<domain>/<feature>/...`
  - Hooks: `app/src/hooks/modules/<domain>/<feature>/...`
  - Services: `app/src/services/modules/<domain>/<feature>/...`
  - Types: `app/src/types/modules/<domain>/<feature>/...`
  - Constants: `app/src/constants/modules/<domain>/<feature>/...`
  - Data: `app/src/data/modules/<domain>/<feature>/...`
  - Validations: `app/src/validations/modules/<domain>/<feature>/...`
- Do not create empty folders just to match the pattern; create a layer only when the feature uses it.

Specific error examples:

- Error: `The changed service "ExampleApi.ts" is not located in the services layer.`
  Fix: move API functions to `app/src/services/modules/<domain>/<feature>/ExampleApi.ts`.
- Error: `The changed hook "useExamplePage.ts" is not located in a shared or feature hooks directory.`
  Fix: move it to `app/src/hooks/modules/<domain>/<feature>/useExamplePage.ts`.

### Reusable Helper Logic Is Duplicated

Checkings:
Review repeated helper logic before adding module-local functions. Common formatting, normalization, parsing, comparison, casing, trimming, search matching, status conversion, date formatting, currency formatting, percentage formatting, file handling, and import cleanup should use existing helpers from `app/src/utils` when available. If a reusable helper is missing, add it under `app/src/utils` with a generic name that describes the behavior, not the module that first needed it.

How to qualify:

- Check the shared utilities before creating a module-local helper.
- Reuse an existing helper when the behavior is generic, such as normalization, casing, comparison, formatting, parsing, conversion, or cleanup.
- Add a new shared helper only when the same behavior can reasonably be reused by unrelated modules.
- Name shared helpers by what they do, not by the first module that needs them.
- Keep helpers pure and reusable across unrelated modules.
- Keep feature-specific business rules in the feature data, constants, validation, or service layer instead of shared utilities.

Specific error examples:

- Error: a module defines a local normalization helper that trims and changes casing while the same behavior already exists in shared utilities.
  Fix: reuse the shared helper instead of duplicating the function.
- Error: a feature creates a module-named helper for generic case-insensitive matching.
  Fix: add or reuse a shared helper with a behavior-based name.
- Error: multiple modules manually repeat the same comparison or formatting chain.
  Fix: use or add a shared helper with a generic name and update the modules to call it.

## Writing QA Findings

When documenting a PR issue, keep the module name generic but make the code problem easy to act on. A finding should read like a reviewer explaining what they saw, where they saw it, and what should move or change.

Use this format:

```text
Category: <UI, Types, Data, Hooks, Services, Forms, Routing, or Integration>
Location: <exact file path>:<line>
Issue: <short plain-language issue>
Code: <small snippet or identifier that shows the problem>
Recommendation: <specific code movement or replacement using app/src/<layer>/modules/<domain>/<feature>/...>
```

Good example:

```text
Category: UI
Location: app/src/ui/modules/<domain>/<feature>/ExampleList.tsx:42
Issue: The UI component is doing request work instead of only rendering the screen.
Code: apiClient.get(...)
Recommendation: Move the request to app/src/services/modules/<domain>/<feature>/ExampleApi.ts and expose it through useExampleListQuery().
```

Avoid:

```text
This module has mixed responsibilities and has API issues. Please refactor.
```

## Module File Checklist

Before finishing a module change:

1. Search changed files for repeated strings that are business concepts.
2. Move repeated literals to the feature constants file.
3. Keep mock records and pure mappers in the feature data file.
4. Keep form schemas and cross-field rules in the feature validation file.
5. Keep shared React controls reusable under `app/src/ui/shared/...`.
6. Keep API functions in services and server-state orchestration in hooks.
7. Name hook functions and hook files with the `use...` pattern, and keep their internal structure readable.
8. Refactor files by responsibility before they become hard to scan; do not use 1000 lines as a target size.
9. Run Prettier with the project configuration (`"printWidth": 140`) so readable one-line code stays compact.
10. Reuse existing helpers in `app/src/utils` before creating module-local normalization, formatting, parsing, or comparison functions.
11. Render loading, error, empty, permission-denied, and mutation-pending states when a feature reads or writes server data.
12. Run:

```bash
npm run lint
npm exec tsc -- --noEmit
```

For route or module identity changes, also run:

```bash
rg '/add/new|add/\[recordId\]|add\\\[recordId\\\]' 'app/(modules)' app/src -g '*.tsx' -g '*.ts'
```
