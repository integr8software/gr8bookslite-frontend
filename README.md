# GR8BooksLite Frontend

## Setup

Clone and run the project locally:

```bash
git clone <your-repository-url>
cd gr8bookslite-frontend
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
```

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

## Libraries Used

- `react-hot-toast`
  - for toast notifications

- `lucide-react`
  - for icons such as arrow actions and auth UI icons

- `zod`
  - for form validation schemas

- `next`
- `react`
- `react-dom`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
