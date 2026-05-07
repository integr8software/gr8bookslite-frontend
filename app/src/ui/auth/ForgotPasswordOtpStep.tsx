"use client";

import type { RefObject } from "react";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";

type ForgotPasswordOtpStepProps = {
  state: AuthActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  email: string;
  otp: string;
  otpInputRef: RefObject<HTMLInputElement | null>;
  formattedTime: string;
  canResend: boolean;
  isResending: boolean;
  isOtpFocused: boolean;
  otpLength: number;
  handleOtpChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOtpFocus: () => void;
  handleOtpBlur: () => void;
  handleResend: () => void;
  handleChangeEmail: () => void;
};

export function ForgotPasswordOtpStep({
  state,
  formAction,
  pending,
  email,
  otp,
  otpInputRef,
  formattedTime,
  canResend,
  isResending,
  isOtpFocused,
  otpLength,
  handleOtpChange,
  handleOtpFocus,
  handleOtpBlur,
  handleResend,
  handleChangeEmail,
}: ForgotPasswordOtpStepProps) {
  function getOtpBoxClass(index: number) {
    if (state.errors?.otp && otp.length === otpLength) {
      return "border-coralpink ring-2 ring-coralpink/20";
    }

    const isActiveIndex = index === Math.min(otp.length, otpLength - 1);
    const isFilled = index < otp.length;

    if (isOtpFocused && (isFilled || isActiveIndex)) {
      return "border-gray-400 ring-2 ring-gray-400/25";
    }

    return "border-darknavy/20";
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="intent" value="verify-otp" />
      <input type="hidden" name="email" value={email} />
      <input
        ref={otpInputRef}
        type="text"
        name="otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={otp}
        onChange={handleOtpChange}
        onFocus={handleOtpFocus}
        onBlur={handleOtpBlur}
        maxLength={otpLength}
        className="sr-only"
      />

      <button
        type="button"
        onClick={() => otpInputRef.current?.focus()}
        className="flex w-full justify-center gap-2 sm:gap-3"
      >
        {Array.from({ length: otpLength }).map((_, index) => (
          <span
            key={index}
            className={`flex h-14 w-12 items-center justify-center rounded-2xl border text-3xl font-medium text-black shadow-sm transition sm:h-16 sm:w-14 ${getOtpBoxClass(index)}`}
          >
            {otp[index] ?? ""}
          </span>
        ))}
      </button>

      <div className="flex flex-col gap-2 text-xs text-darknavy/75 sm:flex-row sm:items-center sm:justify-between">
        {!canResend ? (
          <p>
            Remaining Time:{" "}
            <span className="font-semibold text-[#3d76ea]">
              {formattedTime}
            </span>
          </p>
        ) : (
          <span aria-hidden="true" />
        )}

        <p>
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            aria-disabled={!canResend}
            className={`font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${canResend ? "text-[#3d76ea]" : "text-darknavy/45"}`}
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>

      <button
        type="submit"
        disabled={pending || otp.length !== otpLength}
        className="h-12 w-full rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Verifying..." : "Verify"}
      </button>

      <button
        type="button"
        onClick={handleChangeEmail}
        className="block w-full text-center text-sm font-semibold text-darknavy/65 transition hover:text-darknavy"
      >
        Change Email
      </button>
    </form>
  );
}
