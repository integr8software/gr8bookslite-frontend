"use server";

import {
  ForgotPasswordSchema,
  OtpSchema,
  ResetPasswordSchema,
} from "@/app/src/data/auth/AuthSchemas";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
} from "@/app/src/services/auth/AuthApiTypes";
import { PostAuthJson } from "@/app/src/services/auth/AuthApi";
import {
  GetFormValue,
  InvalidState,
} from "@/app/src/services/auth/AuthActionUtils";

export async function ForgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = ForgotPasswordSchema.safeParse({
    email: GetFormValue(formData, "email"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  try {
    const response = await PostAuthJson<
      ForgotPasswordRequest,
      ForgotPasswordResponse
    >("/auth/forgot-password", {
      email: parsed.data.email,
    });

    return {
      status: "success",
      message: response.message,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not send a reset code right now.",
    };
  }
}

export async function ForgotPasswordOtpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const otp = GetFormValue(formData, "otp");
  const parsed = OtpSchema.safeParse({ otp });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  return {
    status: "success",
    message: "Code accepted. Create a new password.",
  };
}

export async function ResendForgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = ForgotPasswordSchema.safeParse({
    email: GetFormValue(formData, "email"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  try {
    const response = await PostAuthJson<
      ForgotPasswordRequest,
      ForgotPasswordResponse
    >("/auth/resend-forgot-password", {
      email: parsed.data.email,
    });

    return {
      status: "success",
      message: response.message,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not resend the reset code right now.",
    };
  }
}

export async function ResetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = GetFormValue(formData, "email");
  const otp = GetFormValue(formData, "otp");
  const parsed = ResetPasswordSchema.safeParse({
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
  });

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

  const otpValidation = OtpSchema.safeParse({ otp });

  if (!otpValidation.success) {
    return {
      status: "error",
      message: "Enter a valid reset code.",
      errors: otpValidation.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await PostAuthJson<
      ResetPasswordRequest,
      ResetPasswordResponse
    >("/auth/reset-password", {
      email: emailValidation.data.email,
      code: otpValidation.data.otp,
      newPassword: parsed.data.password,
      confirmNewPassword: parsed.data.confirmPassword,
    });

    return {
      status: "success",
      message: response.message,
      redirectTo: "/login",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not reset your password right now.";

    return {
      status: "error",
      message,
      errors: {
        otp:
          message === "Reset code is invalid." ||
          message === "Reset code has expired." ||
          message === "No active reset code was found."
            ? [message]
            : undefined,
      },
    };
  }
}
