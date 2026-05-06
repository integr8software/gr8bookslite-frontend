<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Structure

Use a modular monolith structure inside the `app` directory.

Routes live directly under `app` with route groups for major areas:

```txt
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    otp/page.tsx
  (onboarding)/
    layout.tsx
    onboarding/page.tsx
  api/
  src/
    data/
    services/
    hooks/
    ui/
```

Route group folder names should be lowercase, for example `(auth)` and `(onboarding)`.

Shared feature code belongs under `app/src`:

- `app/src/data/<feature>/` for schemas, types, constants, and static data.
- `app/src/services/<feature>/` for server actions, API wrappers, and business operations.
- `app/src/hooks/<feature>/` for client hooks.
- `app/src/ui/<feature>/` for reusable UI components.

# Naming

Use PascalCase as the default naming standard for shared project files under `app/src`.

Use PascalCase for TypeScript files that export components, schemas, actions, shared types, constants, or reusable modules.

Examples:

- `AuthSchemas.ts`
- `AuthTypes.ts`
- `AuthActions.ts`
- `OtpData.ts`
- `LoginForm.tsx`
- `AuthShell.tsx`

Only use lowercase route-group folder names where required by Next.js, for example `(auth)` and `(onboarding)`.

Hooks should keep the React hook convention:

- `useLoginForm.ts`
- `useSignUpForm.ts`
- `useForgotPasswordForm.ts`
- `useOtpForm.ts`

# Auth

Auth routes currently use:

```txt
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/otp/page.tsx
```

Auth validation should use Zod schemas from `app/src/data/auth/AuthSchemas.ts`.

Auth form server actions should return a typed `AuthActionState` from `app/src/data/auth/AuthTypes.ts`.

Client form components should use `useActionState` through hooks in `app/src/hooks/auth`.

Auth constants and static auth helpers should live in `app/src/data/auth`, for example `OtpData.ts`.

# Styling

Global Tailwind color tokens are defined in `app/globals.css`.

Use these project colors:

- `darknavy`: `#212738`
- `coralpink`: `#f97068`
- `citron`: `#d1d646`
- `offwhite`: `#ecf2ef`
- `skyblue`: `#57c4e5`

Prefer project tokens like `text-darknavy`, `bg-offwhite`, `bg-coralpink`, `bg-citron`, and `bg-skyblue` over ad hoc hex values.
