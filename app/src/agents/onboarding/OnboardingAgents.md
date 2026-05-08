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
  OnboardingSchemas.ts
  OnboardingTypes.ts

app/src/hooks/onboarding/
  useOnboardingFlow.ts

app/src/ui/onboarding/
  OnboardingActionRow.tsx
  OnboardingField.tsx
  OnboardingFileField.tsx
  OnboardingFlow.tsx
  OnboardingPasswordRequirements.tsx
  OnboardingPasswordStrength.tsx
  OnboardingProgressHeader.tsx
  OnboardingReviewStep.tsx
  OnboardingSelectField.tsx
  OnboardingStepOne.tsx
  OnboardingStepTwo.tsx

app/src/agents/onboarding/
  OnboardingAgents.md

app/src/services/shared/
  ApiClient.ts
  QueryClient.ts

app/src/hooks/shared/
  useAppStore.ts
  usePasswordVisibility.ts

app/src/ui/shared/
  AppProviders.tsx
  AppToaster.tsx
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
  - step metadata for the 3-step flow
  - select options such as department and organization type
  - upload limits such as the 5MB logo size
- `OnboardingSchemas.ts`
  - step 1 validation
  - step 2 validation
  - password rules
  - TIN and logo validation
- `OnboardingTypes.ts`
  - form value shape
  - field error types
  - initial onboarding values

### `hooks/onboarding`

Use hooks for client state, step movement, validation orchestration, file handling, and navigation.

- `useOnboardingFlow.ts`
  - owns current step index
  - owns accumulated onboarding values across all steps
  - runs Zod validation for step 1 and step 2
  - handles logo upload and removal
  - computes password strength
  - shows `react-hot-toast` feedback
  - handles final navigation after completion

### `ui/onboarding`

Use `ui` for presentational onboarding pieces and reusable step components.

- `OnboardingFlow.tsx`
  - top-level onboarding screen controller
  - renders the active step
- `OnboardingStepOne.tsx`
  - taxpayer and organization details
- `OnboardingStepTwo.tsx`
  - account creation
- `OnboardingReviewStep.tsx`
  - final review screen
- shared components
  - `OnboardingField.tsx`
  - `OnboardingSelectField.tsx`
  - `OnboardingFileField.tsx`
  - `OnboardingActionRow.tsx`
  - `OnboardingProgressHeader.tsx`
  - `OnboardingPasswordStrength.tsx`
  - `OnboardingPasswordRequirements.tsx`

### Shared frontend foundation

- `ApiClient.ts`
  - shared Axios boilerplate for future onboarding API wrappers
- `QueryClient.ts`
  - shared TanStack Query client factory
- `useAppStore.ts`
  - shared Zustand boilerplate for lightweight client state
- `AppProviders.tsx`
  - shared app provider entrypoint with TanStack Query

## Current Progress

Implemented onboarding behavior:

- direct route at `/onboarding`
- 3-step onboarding flow
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
- step 2 account setup:
  - account first name
  - account last name
  - work email
  - department
  - password
  - confirm password
- password rules:
  - minimum 8 characters
  - at least 1 uppercase letter
  - at least 1 lowercase letter
  - at least 1 special character
- live password strength bar
- password requirement helper list
- review step for submitted details
- toast-based validation feedback

## Notes

- The active onboarding screen is client-driven through `useOnboardingFlow.ts`.
- There is currently no dedicated `services/onboarding` runtime layer because the active flow is fully client-driven.
- If a future change introduces onboarding API wrappers, place them under `app/src/services/onboarding/` and build them on the shared Axios and TanStack foundation.
