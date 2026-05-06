"use client";

import Link from "next/link";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";

type ForgotPasswordResetStepProps = {
  state: AuthActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  isResetComplete: boolean;
};

export function ForgotPasswordResetStep({
  state,
  formAction,
  pending,
  isResetComplete,
}: ForgotPasswordResetStepProps) {
  const passwordErrors = state.errors?.password;
  const confirmPasswordErrors = state.errors?.confirmPassword;

  if (isResetComplete) {
    return (
      <div className="space-y-5">
        <div className="rounded-md border border-skyblue/25 bg-skyblue/10 px-4 py-3 text-sm leading-6 text-darknavy">
          <p className="font-medium">Password reset complete.</p>
          <p className="mt-1 text-darknavy/75">
            Use your new password the next time you log in.
          </p>
        </div>

        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8]"
        >
          Continue to Login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="intent" value="reset-password" />

      <div>
        <label
          htmlFor="new-password"
          className="mb-2 block text-sm font-medium text-darknavy"
        >
          New Password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby={
            passwordErrors?.length ? "new-password-error" : undefined
          }
          aria-invalid={passwordErrors?.length ? true : undefined}
          className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition placeholder:text-darknavy/45 focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
        />
        {passwordErrors?.length ? (
          <p id="new-password-error" className="mt-2 text-sm text-coralpink">
            {passwordErrors[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="confirm-new-password"
          className="mb-2 block text-sm font-medium text-darknavy"
        >
          Confirm Password
        </label>
        <input
          id="confirm-new-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-describedby={
            confirmPasswordErrors?.length
              ? "confirm-new-password-error"
              : undefined
          }
          aria-invalid={confirmPasswordErrors?.length ? true : undefined}
          className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition placeholder:text-darknavy/45 focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
        />
        {confirmPasswordErrors?.length ? (
          <p
            id="confirm-new-password-error"
            className="mt-2 text-sm text-coralpink"
          >
            {confirmPasswordErrors[0]}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Reset Password"}
      </button>
    </form>
  );
}
