"use client";

import { LoaderCircle } from "lucide-react";
import type { AuthActionState } from "@/app/src/types/auth/AuthTypes";

type ForgotPasswordEmailStepProps = {
  state: AuthActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  handleEmailSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ForgotPasswordEmailStep({ state, formAction, pending, handleEmailSubmit }: ForgotPasswordEmailStepProps) {
  const emailErrors = state.errors?.email;

  return (
    <form action={formAction} onSubmit={handleEmailSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-darknavy">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          aria-describedby={emailErrors?.length ? "email-error" : undefined}
          aria-invalid={emailErrors?.length ? true : undefined}
          className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition placeholder:text-darknavy/45 focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
        />
        {emailErrors?.length ? (
          <p id="email-error" className="mt-2 text-sm text-coralpink">
            {emailErrors[0]}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{pending ? "Sending..." : "Send OTP"}</span>
        {pending ? <LoaderCircle className="ml-2 h-5 w-5 animate-spin" aria-hidden="true" /> : null}
      </button>
    </form>
  );
}
