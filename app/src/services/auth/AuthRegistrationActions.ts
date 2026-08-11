"use server";

import { ChangeVerificationEmailSchema, ForgotPasswordSchema, OtpSchema, SignUpSchema } from "@/app/src/validations/auth/AuthValidation";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  type VerificationEmailChangeInput,
  type VerificationEmailChangeResult,
  type RegistrationInput,
  type RegistrationResult,
  type VerificationResendInput,
  type VerificationResendResult,
  type EmailVerificationInput,
  type EmailVerificationResult,
} from "@/app/src/types/auth/AuthTypes";
import { PostAuthJson } from "@/app/src/services/auth/AuthApi";
import { GetFormValue, InvalidState } from "@/app/src/services/auth/AuthActionUtils";
import { GetFallbackPostAuthRedirectPath } from "@/app/src/services/auth/AuthRedirects";
import { SetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";

export async function SignUpAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const formValues = {
    name: GetFormValue(formData, "name"),
    email: GetFormValue(formData, "email"),
    contactNumber: GetFormValue(formData, "contactNumber"),
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
    termsAccepted: GetFormValue(formData, "termsAccepted") === "true",
  };

  const parsed = SignUpSchema.safeParse(formValues);

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors, formValues);
  }

  try {
    const response = await PostAuthJson<RegistrationInput, RegistrationResult>("/auth/register", {
      fullName: parsed.data.name,
      email: parsed.data.email,
      contactNumber: parsed.data.contactNumber,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
    });

    return {
      status: "success",
      message: response.message,
      redirectTo: "/auth/verify-email",
      pendingVerificationEmail: response.email,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not create your account right now.";

    return {
      status: "error",
      message,
      errors:
        message === "An account already uses this email. Sign in or reset your password." || message === "Email is already in use."
          ? {
              email: ["An account already uses this email. Sign in or reset your password."],
            }
          : undefined,
      formValues,
    };
  }
}

export async function OtpAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = GetFormValue(formData, "email");
  const otp = GetFormValue(formData, "otp");
  const parsed = OtpSchema.safeParse({ otp });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  const emailValidation = ForgotPasswordSchema.safeParse({ email });

  if (!emailValidation.success) {
    return {
      status: "error",
      message: "Enter a valid email address.",
      errors: {
        email: emailValidation.error.flatten().fieldErrors.email,
      },
    };
  }

  try {
    const response = await PostAuthJson<EmailVerificationInput, EmailVerificationResult>("/auth/verify-email", {
      email: emailValidation.data.email,
      code: parsed.data.otp,
    });
    await SetAuthAccessTokenCookie(response.accessToken, false);

    return {
      status: "success",
      message: response.message ?? "Email verified successfully.",
      redirectTo: GetFallbackPostAuthRedirectPath(response.accessToken),
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "We could not verify your email right now.",
      errors: {
        otp: ["The code you entered is invalid."],
      },
    };
  }
}

export async function ResendVerificationAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = ForgotPasswordSchema.safeParse({
    email: GetFormValue(formData, "email"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  try {
    const response = await PostAuthJson<VerificationResendInput, VerificationResendResult>("/auth/resend-verification", {
      email: parsed.data.email,
    });

    return {
      status: "success",
      message: response.message,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "We could not resend the verification code right now.",
    };
  }
}

export async function ChangeVerificationEmailAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = ChangeVerificationEmailSchema.safeParse({
    currentEmail: GetFormValue(formData, "currentEmail"),
    newEmail: GetFormValue(formData, "newEmail"),
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      status: "error",
      message: "Please enter a valid new email address.",
      errors: {
        email: fieldErrors.newEmail,
        newEmail: fieldErrors.newEmail,
      },
    };
  }

  try {
    const response = await PostAuthJson<VerificationEmailChangeInput, VerificationEmailChangeResult>(
      "/auth/change-verification-email",
      parsed.data,
    );

    return {
      status: "success",
      message: response.message,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "We could not update your verification email right now.",
    };
  }
}
