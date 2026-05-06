"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { useForgotPasswordForm } from "@/app/src/hooks/auth/useForgotPasswordForm";
import { ForgotPasswordEmailStep } from "@/app/src/ui/auth/ForgotPasswordEmailStep";
import { ForgotPasswordOtpStep } from "@/app/src/ui/auth/ForgotPasswordOtpStep";
import { ForgotPasswordResetStep } from "@/app/src/ui/auth/ForgotPasswordResetStep";

export function ForgotPasswordForm() {
  const form = useForgotPasswordForm();
  const isEmailStep = form.step === "email";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-darknavy sm:px-6">
      <section className="w-full max-w-140 rounded-md bg-white px-6 py-6 shadow-[0_18px_60px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/8 sm:px-8">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-darknavy text-offwhite">
            {isEmailStep ? (
              <KeyRound size={27} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <MailCheck size={27} strokeWidth={2.5} aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-darknavy">
            {form.step === "email" ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-darknavy/80">
            {form.step === "email"
              ? "No worries, we'll send you a reset OTP."
              : form.step === "verify"
                ? `Enter the passcode sent to ${form.maskedEmail}.`
                : "Create a new password for your account."}
          </p>
        </div>

        {form.step === "email" ? (
          <ForgotPasswordEmailStep
            state={form.state}
            formAction={form.formAction}
            pending={form.pending}
            handleEmailSubmit={form.handleEmailSubmit}
          />
        ) : form.step === "verify" ? (
          <ForgotPasswordOtpStep
            state={form.state}
            formAction={form.formAction}
            pending={form.pending}
            otp={form.otp}
            otpInputRef={form.otpInputRef}
            formattedTime={form.formattedTime}
            canResend={form.canResend}
            isResending={form.isResending}
            isOtpFocused={form.isOtpFocused}
            otpLength={form.otpLength}
            handleOtpChange={form.handleOtpChange}
            handleOtpFocus={form.handleOtpFocus}
            handleOtpBlur={form.handleOtpBlur}
            handleResend={form.handleResend}
            handleChangeEmail={form.handleChangeEmail}
          />
        ) : (
          <ForgotPasswordResetStep
            state={form.state}
            formAction={form.formAction}
            pending={form.pending}
            isResetComplete={form.isResetComplete}
          />
        )}

        <div className="pt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-semibold text-darknavy/65 transition hover:text-darknavy"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to log in
          </Link>
        </div>
      </section>
    </main>
  );
}
