# Auth Area Instructions

These instructions apply to the auth feature files and should be read together with the root `AGENTS.md`.

## Scope

This auth area currently supports:

```txt
app/(auth)/
  login/page.tsx
  signup/page.tsx
  forgot-password/page.tsx
  otp/page.tsx
```

Shared auth logic is split across:

```txt
app/src/data/auth/
app/src/services/auth/
app/src/hooks/auth/
app/src/ui/auth/
```

Shared cross-feature foundation also exists in:

```txt
app/src/services/shared/
app/src/hooks/shared/
app/src/ui/shared/
```

Current route files:

```txt
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/otp/page.tsx
```

## Naming

- Use PascalCase for auth components, schemas, types, actions, and data modules.
- Use hook naming for hooks, for example `useOtpForm.ts`.
- Keep route group folder names lowercase where required by Next.js, for example `(auth)`.

Examples:

- `AuthValidation.ts`
- `AuthTypes.ts`
- `AuthActions.ts`
- `AuthLoginActions.ts`
- `AuthRegistrationActions.ts`
- `AuthPasswordActions.ts`
- `OtpData.ts`
- `LoginForm.tsx`
- `SignUpForm.tsx`
- `OtpForm.tsx`
- `useLoginForm.ts`
- `useOtpForm.ts`

## Auth Structure

```txt
app/src/data/auth/
  AuthTypes.ts
  OtpData.ts

app/src/validations/auth/
  AuthValidation.ts

app/src/services/auth/
  AuthActions.ts
  AuthApi.ts
  AuthApiTypes.ts
  AuthActionUtils.ts
  AuthLoginActions.ts
  AuthRegistrationActions.ts
  AuthPasswordActions.ts

app/src/hooks/auth/
  useForgotPasswordForm.ts
  useLoginForm.ts
  useOtpForm.ts
  useSignUpForm.ts

app/src/ui/auth/
  AuthField.tsx
  AuthPasswordRequirements.tsx
  ForgotPasswordForm.tsx
  ForgotPasswordEmailStep.tsx
  ForgotPasswordOtpStep.tsx
  ForgotPasswordResetStep.tsx
  LoginForm.tsx
  OtpForm.tsx
  PrivacyPolicyForm.tsx
  SignUpForm.tsx
  TermsOfServiceForm.tsx
```

Shared frontend boilerplate available to auth:

```txt
app/src/services/shared/
  ApiClient.ts
  QueryClient.ts

app/src/hooks/shared/
  useAppStore.ts
  usePasswordVisibility.ts

app/src/ui/shared/
  AppProviders.tsx
  AppToaster.tsx
  GradientBlurBackground.tsx
```

## How The Auth Layers Work

### `data/auth`

This layer stores auth types, constants, and small reusable helpers.

- `validations/auth/AuthValidation.ts`
  - contains Zod schemas for login, signup, forgot password, and OTP
  - exports inferred input types

- `AuthTypes.ts`
  - contains shared auth action result types
  - defines `AuthActionState`
  - defines auth field error shape used by forms

- `OtpData.ts`
  - contains OTP-specific constants and helpers
  - current items include OTP length, resend timeout, mock OTP code, and email masking helper

### `services/auth`

This layer contains server-side auth operations.

- `AuthActions.ts`
  - acts as a thin barrel for auth actions
  - re-exports the flow-based action modules

- `AuthLoginActions.ts`
  - contains login-only server actions

- `AuthRegistrationActions.ts`
  - contains sign-up, email verification, and verification-email-change actions

- `AuthPasswordActions.ts`
  - contains forgot-password and reset-password actions

- `AuthActionUtils.ts`
  - contains shared auth action helpers such as form-value extraction and invalid-state mapping

- `AuthApiTypes.ts`
  - contains auth API request and response types

Quick mental model for these files:

- `AuthActions.ts`
  - main entry file
  - re-exports auth actions from the smaller flow-based files
  - lets the rest of the app import from one place when preferred

- `AuthActionUtils.ts`
  - shared helper functions for auth actions
  - things like reading `FormData` values and returning common invalid-state responses
  - avoids repeating tiny utility logic in every auth action file

- `AuthApi.ts`
  - auth request helper layer
  - knows how to call backend auth endpoints
  - handles base URL building and error shaping for auth requests

- `AuthApiTypes.ts`
  - shared request and response TypeScript types for auth API calls
  - keeps payload and response shapes in one place
  - avoids repeating those types across multiple auth action files

- `AuthApi.ts`
  - contains auth-specific request helpers
  - currently uses `fetch`
  - can later be unified with the shared Axios client when auth request handling is centralized

- shared services
  - `ApiClient.ts` is the shared Axios boilerplate
  - `QueryClient.ts` is the shared TanStack Query client factory

### `hooks/auth`

This layer contains client-side form state and interaction logic.

- `useLoginForm.ts`
  - connects the login form to `LoginAction` with `useActionState`

- `useSignUpForm.ts`
  - connects the signup form to `SignUpAction`

- `useForgotPasswordForm.ts`
  - connects the forgot-password form to `ForgotPasswordAction`

- `useOtpForm.ts`
  - connects the OTP form to `OtpAction`
  - manages OTP step flow
  - manages resend countdown
  - manages OTP input state and focus state
  - manages toast-based feedback for OTP interactions

- shared hooks
  - `useAppStore.ts` is the shared Zustand boilerplate for lightweight client state
  - `usePasswordVisibility.ts` handles shared password-visibility state

### `ui/auth`

This layer contains reusable and screen-level auth components.

- Shared components:
  - `AuthField.tsx`
  - `AuthPasswordRequirements.tsx`

- Screen/form components:
  - `LoginForm.tsx`
  - `SignUpForm.tsx`
  - `ForgotPasswordForm.tsx`
  - `OtpForm.tsx`

## UI Rules

- Reuse `AuthField.tsx` and shared auth helpers where they still fit the flow.
- If a form becomes custom and screen-specific, keep business logic in hooks or data files and keep the component focused on rendering.
- Prefer project color tokens from `app/globals.css`.
- Keep auth screens mobile responsive first, then enhance for desktop.
- Use TanStack Query for shared auth/session server state when those queries are introduced.
- Use Zustand for lightweight auth-adjacent client state, not for form validation already handled in hooks and Zod.

## What Has Been Done

- Login
  - custom full-page responsive layout
  - desktop image panel
  - Google CTA UI
  - submit button with arrow icon

- Sign Up
  - custom full-page responsive layout
  - desktop image panel
  - Google CTA UI
  - submit button with arrow icon

- Forgot Password
  - shared shell-based reset form

- OTP
  - route created at `app/(auth)/otp/page.tsx`
  - two-step flow: email entry then OTP verification
  - 4-digit OTP input
  - interactive OTP ring states
  - green success ring
  - red error ring
  - 5-minute resend cooldown
  - resend protection
  - retry behavior fixed for repeated wrong attempts
  - mock valid OTP set to `1234`
  - toast notifications using `react-hot-toast`
  - floating white verification card UI

## Current Auth Behavior

- `LoginForm.tsx`
  - custom full-page layout
  - responsive
  - Google CTA UI

- `SignUpForm.tsx`
  - custom full-page layout
  - desktop image panel
  - responsive
  - Google CTA UI

- `ForgotPasswordForm.tsx`
  - shared shell layout

- `OtpForm.tsx`
  - two-step flow: email entry then OTP verification
  - 4-digit OTP
  - 5-minute resend cooldown
  - resend is blocked until timer completes
  - mock valid OTP is `1234`
  - uses toast feedback instead of inline status messaging

## Logic Placement

- Validation belongs in `app/src/validations/auth/AuthValidation.ts`
- Shared auth types belong in `app/src/data/auth/AuthTypes.ts`
- OTP constants and helpers belong in `app/src/data/auth/OtpData.ts`
- Server actions belong in `app/src/services/auth/AuthActions.ts`
- Shared Axios boilerplate belongs in `app/src/services/shared/ApiClient.ts`
- Shared TanStack Query client setup belongs in `app/src/services/shared/QueryClient.ts`
- Client-side interaction state, side effects, derived state, and auth flow logic belong in hooks under `app/src/hooks/auth`
- Shared lightweight client state belongs in Zustand hooks under `app/src/hooks/shared`
- Keep screen components focused on rendering and event wiring
- Move reusable logic out of UI files when a form starts getting large
- If an auth service file grows too large, split it by auth flow such as login, registration/verification, and password reset

## Toasts

- `react-hot-toast` is mounted globally from `app/layout.tsx`
- OTP success, error, and resend feedback should use toasts instead of inline messages

## Guidance For Future Changes

- If you add a new auth flow, update all four layers when needed:
  - `data/auth`
  - `services/auth`
  - `hooks/auth`
  - `ui/auth`

- Prefer this sequence when adding a new auth feature:
  1. Add or update schema and types
  2. Add or update the correct flow-based auth service file
  3. Add or update hook
  4. Build or update the UI component
  5. Connect the route page

- Keep this file updated when auth structure or behavior changes significantly
