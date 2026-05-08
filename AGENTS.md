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
- `app/src/services/<feature>/` for server actions, Axios API wrappers, TanStack Query helpers, and business operations.
- `app/src/hooks/<feature>/` for client hooks.
- `app/src/ui/<feature>/` for reusable UI components.

Use `shared` folders under `app/src` for cross-feature modules:

- `app/src/data/shared/`
- `app/src/services/shared/`
- `app/src/hooks/shared/`
- `app/src/ui/shared/`

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
- `useAppStore.ts`

# Logic Placement

Keep logic out of UI components as much as possible.

- Put client interaction logic, state orchestration, derived state, side effects, and flow control in hooks.
- Keep UI components focused on rendering, props, and event wiring.
- Put validation schemas, constants, types, and pure helpers in `data`.
- Put API wrappers, server actions, and business operations in `services`.
- If component logic grows beyond small field-local state, move it into a feature hook or shared hook.
- If a service file gets too large, split it by feature flow or domain responsibility instead of keeping all operations in one file.

# Shared Frontend Stack

The frontend now includes shared boilerplate for:

- `axios`
  - use for reusable API clients and request wrappers
  - shared base client belongs in `app/src/services/shared/ApiClient.ts`
- `@tanstack/react-query`
  - use for cached server state such as session, profile, and company data
  - shared query client setup belongs in `app/src/services/shared/QueryClient.ts`
  - shared provider belongs in `app/src/ui/shared/AppProviders.tsx`
- `zustand`
  - use for lightweight client state such as access token, active company, and UI state
  - shared stores should live under `app/src/hooks/shared/`

Current shared boilerplate:

```txt
app/src/services/shared/ApiClient.ts
app/src/services/shared/QueryClient.ts
app/src/hooks/shared/useAppStore.ts
app/src/ui/shared/AppProviders.tsx
```

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

Auth may continue to use feature-specific service modules, but shared API and cache infrastructure should build on the shared Axios and TanStack Query boilerplate.

# Styling

Global Tailwind color tokens are defined in `app/globals.css`.

Use these project colors:

- `darknavy`: `#212738`
- `coralpink`: `#f97068`
- `citron`: `#d1d646`
- `offwhite`: `#ecf2ef`
- `skyblue`: `#57c4e5`

Prefer project tokens like `text-darknavy`, `bg-offwhite`, `bg-coralpink`, `bg-citron`, and `bg-skyblue` over ad hoc hex values.
