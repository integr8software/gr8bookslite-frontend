# Gr8Books Neo Frontend

## Setup

Clone and run the project locally:

```bash
git clone <your-repository-url>
cd gr8booksneo-frontend
npm install
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://localhost:3001
```

Frontend API requests should target the backend through:

```txt
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxx
NEXT_PUBLIC_PAYMONGO_API_BASE_URL=https://api.paymongo.com/v1
```

For Vercel staging, copy the values from `env.staging.example` into the
Vercel project's **Environment Variables** for the Preview environment. Update
`NEXT_PUBLIC_API_BASE_URL` after Render gives you the real backend staging URL.

For the company billing page, the frontend only uses the PayMongo public key to create a payment method in test mode. The backend remains the source of truth for plan loading, subscription creation, attachment, cancellation, and webhook-driven status updates.

## Frontend Stack

- `next` `16.2.4`
- `react` `19.2.4`
- `tailwindcss` `4`
- `zod`
- `axios`
- `@tanstack/react-query`
- `zustand`
- `react-hot-toast`
- `lucide-react`

## Shared Services Boilerplate

Shared frontend foundation now includes:

```txt
app/src/services/shared/ApiClient.ts
app/src/services/shared/QueryClient.ts
app/src/hooks/shared/useAppStore.ts
app/src/ui/shared/AppProviders.tsx
```

What each one is for:

- `ApiClient.ts`
  - shared Axios instance
  - uses `NEXT_PUBLIC_API_BASE_URL`
  - central place for request defaults and response error shaping

- `QueryClient.ts`
  - shared TanStack Query client factory
  - holds default cache and retry behavior

- `useAppStore.ts`
  - shared Zustand store boilerplate
  - currently includes `accessToken`, `activeCompanyId`, and `isSidebarOpen`

- `AppProviders.tsx`
  - mounts shared app providers
  - currently wraps the app in `QueryClientProvider`

Recommended usage:

- use `axios` for reusable API wrappers
- use `@tanstack/react-query` for cached server state such as session, profile, and company data
- use `zustand` for lightweight client state, not for form validation already handled by hooks and Zod

## Services And Features Implemented

- Login
  - responsive custom login screen
  - validation with Zod
  - form action flow using `useActionState`

- Sign Up
  - responsive custom signup screen
  - validation with Zod
  - form action flow using `useActionState`

- Forgot Password
  - reset request form
  - validation with Zod
  - server action flow

- OTP Verification
  - email entry step
  - 4-digit OTP verification
  - 5-minute resend timeout
  - resend protection
  - interactive OTP ring states
  - toast-based success and error feedback
  - mock valid OTP: `1234`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
