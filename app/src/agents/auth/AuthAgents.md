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

- `AuthSchemas.ts`
- `AuthTypes.ts`
- `AuthActions.ts`
- `OtpData.ts`
- `LoginForm.tsx`
- `SignUpForm.tsx`
- `OtpForm.tsx`
- `useLoginForm.ts`
- `useOtpForm.ts`

## Auth Structure

```txt
app/src/data/auth/
  AuthSchemas.ts
  AuthTypes.ts
  OtpData.ts

app/src/services/auth/
  AuthActions.ts

app/src/hooks/auth/
  useForgotPasswordForm.ts
  useLoginForm.ts
  useOtpForm.ts
  useSignUpForm.ts

app/src/ui/auth/
  AuthField.tsx
  AuthShell.tsx
  AuthStatusMessage.tsx
  AuthSubmitButton.tsx
  ForgotPasswordForm.tsx
  LoginForm.tsx
  OtpForm.tsx
  SignUpForm.tsx
```

## How The Auth Layers Work

### `data/auth`

This layer stores auth validation, types, constants, and small reusable helpers.

- `AuthSchemas.ts`
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
  - contains `LoginAction`
  - contains `SignUpAction`
  - contains `ForgotPasswordAction`
  - contains `OtpAction`
  - each action validates form data using schemas from `data/auth`
  - each action returns `AuthActionState`

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

### `ui/auth`

This layer contains reusable and screen-level auth components.

- Shared components:
  - `AuthField.tsx`
  - `AuthShell.tsx`
  - `AuthStatusMessage.tsx`
  - `AuthSubmitButton.tsx`

- Screen/form components:
  - `LoginForm.tsx`
  - `SignUpForm.tsx`
  - `ForgotPasswordForm.tsx`
  - `OtpForm.tsx`

## UI Rules

- Reuse `AuthField.tsx`, `AuthStatusMessage.tsx`, and `AuthSubmitButton.tsx` where they still fit the flow.
- If a form becomes custom and screen-specific, keep business logic in hooks or data files and keep the component focused on rendering.
- Prefer project color tokens from `app/globals.css`.
- Keep auth screens mobile responsive first, then enhance for desktop.

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

- Validation belongs in `app/src/data/auth/AuthSchemas.ts`
- Shared auth types belong in `app/src/data/auth/AuthTypes.ts`
- OTP constants and helpers belong in `app/src/data/auth/OtpData.ts`
- Server actions belong in `app/src/services/auth/AuthActions.ts`
- Client-side interaction state belongs in hooks under `app/src/hooks/auth`
- Keep screen components focused on rendering and event wiring
- Move reusable logic out of UI files when a form starts getting large

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
  2. Add or update server action
  3. Add or update hook
  4. Build or update the UI component
  5. Connect the route page

- Keep this file updated when auth structure or behavior changes significantly
