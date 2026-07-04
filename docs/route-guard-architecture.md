# Route Guard Architecture

## Overview

Gr8Books Neo separates authentication from application readiness.

The frontend uses BFF cookie-only authentication. The cookie proves a browser session exists, but `/auth/me` is the source of truth for the user's current application state.

## Route States

### 1. Unauthenticated

Allowed:

- `/login`
- `/signup`
- `/forgot-password`
- public pages

Blocked:

- application routes
- onboarding

Handled by:

- `proxy.ts`
- `AuthProxyGuard`

Redirect:

```text
/login
```

### 2. Authenticated, Onboarding Required

Allowed:

- `/onboarding`

Blocked:

- `/dashboard`
- `/workspace/*`
- `/master/*`
- `/account/*`
- module routes

Handled by:

- `MainLayout`
- `useMainLayout`
- `/auth/me`

Redirect:

```text
/onboarding
```

This covers manual URL entry, refresh, and browser Back navigation.

### 3. Authenticated, Onboarding Complete

Allowed:

- application routes

Handled by:

- `OnboardingRouteGuard`
- `/auth/me`

If a completed user opens `/onboarding`, the user is redirected to the normal post-auth landing route.

### 4. Onboarding Complete, No Branch Access

This is not onboarding.

The app shows the existing `NoBranchAccess` state inside the main layout. This means the user has completed onboarding but does not currently have branch authorization.

### 5. Onboarding Complete, Unauthorized Module

This is not onboarding and should not redirect to onboarding.

Module authorization remains the responsibility of module permission checks and the existing unauthorized/access-denied experience.

## Responsibility Split

### proxy.ts

The proxy stays lightweight.

It handles:

- cookie/session presence
- public route access
- unauthenticated redirects

It does not handle:

- onboarding completion
- branch access
- module permissions
- business authorization

### Application Route Guard

Application readiness is evaluated after `/auth/me` loads.

The app route guard lives at the shared main layout boundary so application routes behave consistently without scattered page-level redirects.

### Onboarding Route Guard

The onboarding guard prevents completed users from returning to onboarding through browser history, refresh, or manual navigation.

## Current Lifecycle

```text
Login / Google callback
  -> BFF creates HTTP-only session cookie
  -> frontend hydrates session marker
  -> /auth/me loads profile
  -> if onboarding.required
       /onboarding
     else
       post-auth landing route
```

For app routes:

```text
Request /dashboard
  -> proxy validates session cookie
  -> MainLayout loads /auth/me
  -> if onboarding.required
       redirect /onboarding
     else
       render shell
  -> if no branch access
       render NoBranchAccess
  -> if module unauthorized
       render unauthorized flow
```

For onboarding:

```text
Request /onboarding
  -> proxy validates session cookie
  -> OnboardingRouteGuard loads /auth/me
  -> if onboarding.required
       render onboarding
     else
       redirect to post-auth landing route
```

## Implementation Files

- `proxy.ts`
- `app/src/services/auth/AuthProxyGuard.ts`
- `app/src/services/auth/AuthRouteState.ts`
- `app/src/hooks/shared/main-layout/useMainLayout.ts`
- `app/src/ui/shared/main-layout/MainLayout.tsx`
- `app/src/ui/onboarding/OnboardingRouteGuard.tsx`
- `app/onboarding/page.tsx`

## Design Rule

Do not fix route-state bugs with browser back-button prevention or scattered page redirects.

Route state must be enforced at route boundaries:

- proxy for session presence
- main layout for application readiness
- onboarding route guard for onboarding-only access
