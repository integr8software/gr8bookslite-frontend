# Onboarding Module Instructions

These instructions apply to the onboarding module and should be read together with the root `AGENTS.md`.

## Scope

The onboarding module is separate from auth. It is the flow users enter after a successful sign in and before the main product area.

Current onboarding route:

```txt
app/onboarding/page.tsx
```

## Structure

```txt
app/onboarding/
  page.tsx

app/src/data/onboarding/
  OnboardingData.ts
  OnboardingTypes.ts

app/src/validations/onboarding/
  OnboardingValidation.ts

app/src/hooks/onboarding/
  useOnboardingDraft.ts
  useOnboardingFlow.ts
  useOnboardingFormState.ts
  useOnboardingSubmission.ts

app/src/services/onboarding/
  OnboardingApi.ts

app/src/types/onboarding/
  OnboardingApiModels.ts

app/src/ui/onboarding/
  OnboardingActionRow.tsx
  OnboardingBillingStep.tsx
  OnboardingBillingSummaryCard.tsx
  OnboardingField.tsx
  OnboardingPricingDesktopPlans.tsx
  OnboardingFileField.tsx
  OnboardingFlow.tsx
  OnboardingFreeTrialStep.tsx
  OnboardingPricingHero.tsx
  OnboardingPricingMobilePlans.tsx
  OnboardingProgressHeader.tsx
  OnboardingReviewStep.tsx
  OnboardingSelectField.tsx
  OnboardingStepOne.tsx

app/src/agents/onboarding/
  OnboardingAgents.md

app/src/services/shared/
  ApiClient.ts
  QueryClient.ts

app/src/hooks/shared/
  useAppStore.ts
  usePasswordVisibility.ts

app/src/ui/shared/
  AppSkeleton.tsx
  AppProviders.tsx
  AppToaster.tsx

proxy.ts
```

## Rules

- Use PascalCase for shared onboarding files.
- Keep onboarding logic out of auth folders.
- Keep the module split as `data -> services -> hooks -> ui` when a real onboarding service layer exists.
- Reuse onboarding UI components before adding large inline JSX to a step screen.
- Prefer project color tokens from `app/globals.css` over ad hoc values.
- Use shared services and hooks for cross-feature concerns such as Axios clients, TanStack Query setup, and Zustand state.
- Put onboarding interaction logic, flow control, derived state, and side effects in hooks.
- Keep onboarding UI components focused on rendering and event wiring.

## Layer Responsibilities

### `data/onboarding`

Use `data` for onboarding constants, Zod schemas, types, and initial values.

- `OnboardingData.ts`
  - step metadata for the 4-step flow
  - select options such as organization type
  - upload limits such as the 5MB logo size
- `OnboardingValidation.ts`
  - step 1 validation
  - billing step validation
  - TIN and logo validation
- `OnboardingTypes.ts`
  - form value shape
  - field error types
  - initial onboarding values
  - shared component prop types such as `OnboardingBillingStepProps`

### `hooks/onboarding`

Use hooks for client state, step movement, validation orchestration, file handling, and navigation.

- `useOnboardingFlow.ts`
  - lightweight composition hook
  - combines onboarding state, draft hydration, and submission handlers for the screen
- `useOnboardingFormState.ts`
  - owns current step index
  - owns accumulated onboarding values across all steps
  - handles field updates, report date syncing, and logo file state
  - tracks the currently submitting plan code for plan-card button loading
  - manages step-to-step scroll behavior
- `useOnboardingDraft.ts`
  - loads `user_onboarding_drafts` from the backend
  - resumes the saved onboarding step and hydrates known values
  - handles first-entry token timing and retry behavior for draft loading
- `useOnboardingSubmission.ts`
  - runs Zod validation for billing and company details
  - persists plan, billing, company details, and final completion through the onboarding API
  - tracks plan-selection submission so only the clicked pricing CTA shows a spinner
  - shows `react-hot-toast` feedback
  - handles final navigation and post-completion logout redirect

### `ui/onboarding`

Use `ui` for presentational onboarding pieces and reusable step components.

- `OnboardingFlow.tsx`
  - top-level onboarding screen controller
  - renders the active step
  - renders shared skeleton UI while draft hydration is still pending
- `OnboardingStepOne.tsx`
  - taxpayer and organization details
- `OnboardingBillingStep.tsx`
  - billing details shell
  - renders billing form and summary card
- `OnboardingBillingSummaryCard.tsx`
  - selected plan summary
  - billing cadence, free-trial messaging, and pricing recap
- `OnboardingReviewStep.tsx`
  - final review screen
- `OnboardingFreeTrialStep.tsx`
  - pricing step shell
  - owns billing cadence toggle and passes selection handlers into pricing card layouts
- `OnboardingPricingDesktopPlans.tsx`
  - desktop pricing table and plan CTA buttons
- `OnboardingPricingMobilePlans.tsx`
  - mobile pricing cards and plan CTA buttons
- `OnboardingPricingHero.tsx`
  - introductory pricing copy and plan-review CTA
- shared components
  - `OnboardingField.tsx`
  - `OnboardingSelectField.tsx`
  - `OnboardingFileField.tsx`
  - `OnboardingActionRow.tsx`
  - `OnboardingProgressHeader.tsx`

### Shared frontend foundation

- `ApiClient.ts`
  - shared Axios boilerplate for future onboarding API wrappers
- `OnboardingApi.ts`
  - onboarding REST wrappers for draft load, plan save, billing save, company details save, and completion
- `OnboardingApiModels.ts`
  - onboarding API payload models owned by the onboarding feature types layer
- `QueryClient.ts`
  - shared TanStack Query client factory
- `useAppStore.ts`
  - shared Zustand boilerplate for lightweight client state
- `AppProviders.tsx`
  - shared app provider entrypoint with TanStack Query
- `AppSkeleton.tsx`
  - shared skeleton primitives used by onboarding and reusable by other pages
- `proxy.ts`
  - frontend route guard for `/onboarding`
  - redirects unauthenticated requests to `/login`

## Current Progress

Implemented onboarding behavior:

- direct route at `/onboarding`
- frontend route protection for `/onboarding` through `proxy.ts`
- 4-step onboarding flow
- free-trial plan selection step
- billing setup step
- backend-connected onboarding persistence:
  - save selected plan
  - save billing details
  - save company details
  - complete onboarding
- draft resume support:
  - reads `user_onboarding_drafts`
  - restores saved step after login or refresh
- billing validation:
  - cardholder name
  - billing email
  - card number
  - expiry month and year
  - CVC
  - billing address
- animated progress header
- step 1 taxpayer flow:
  - individual path
  - non-individual path
  - conditional organization type input for `Others`
- step 1 validation:
  - address
  - TIN
  - website
  - Philippine contact number format
  - required logo upload
  - image-only upload
  - max upload size `5MB`
- review step for submitted details
- toast-based validation feedback
- loading skeleton while onboarding draft is being resolved
- shared shadcn-style skeleton primitive with pulse animation
- consistent `LoaderCircle` loading indicators for onboarding actions and plan selection
- only the clicked pricing CTA shows a spinner during plan save

Current UI files also include:

- `OnboardingBillingStep.tsx`
- `OnboardingBillingSummaryCard.tsx`
- `OnboardingFreeTrialStep.tsx`
- `OnboardingPricingHero.tsx`
- `OnboardingPricingMobilePlans.tsx`
- `OnboardingPricingDesktopPlans.tsx`

## Notes

- The active onboarding screen is client-driven through `useOnboardingFlow.ts`, but the hook is now intentionally split into smaller onboarding hooks.
- The onboarding module now has a dedicated runtime layer under `app/src/services/onboarding/`.
- Resume behavior depends on backend draft data and token availability from browser storage during the first client pass.
- Pricing plan CTA buttons do not use `OnboardingActionRow.tsx`; they are separate pricing-card buttons in desktop and mobile pricing components and manage their own loading presentation.
- The backend currently stores logo metadata in the draft, not the uploaded file bytes, so the frontend can restore logo name but not the file object or image preview across reloads.
