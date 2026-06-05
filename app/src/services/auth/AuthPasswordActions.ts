"use server";

import {
  ForgotPasswordSchema,
  OtpSchema,
  ResetPasswordSchema,
} from "@/app/src/validations/auth/AuthValidation";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ActivateWorkspaceInvitationRequest,
  type ActivateWorkspaceInvitationResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type VerifyForgotPasswordCodeRequest,
  type VerifyForgotPasswordCodeResponse,
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
      code: response.code,
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
    const response = await PostAuthJson<
      VerifyForgotPasswordCodeRequest,
      VerifyForgotPasswordCodeResponse
    >("/auth/verify-forgot-password-code", {
      email: emailValidation.data.email,
      code: parsed.data.otp,
    });

    return {
      status: "success",
      message: response.message,
      resetToken: response.resetToken,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not verify your reset code right now.";

    return {
      status: "error",
      message,
      errors: {
        otp: [
          message === "Reset code is invalid." ||
          message === "Reset code has expired." ||
          message === "No active reset code was found."
            ? message
            : "The code you entered is invalid.",
        ],
      },
    };
  }
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
      code: response.code,
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
  const resetToken = GetFormValue(formData, "resetToken");
  const parsed = ResetPasswordSchema.safeParse({
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  if (!resetToken) {
    return {
      status: "error",
      message: "Verify your reset code before creating a new password.",
      errors: {
        otp: ["Verify your reset code before creating a new password."],
      },
    };
  }

  try {
    const response = await PostAuthJson<
      ResetPasswordRequest,
      ResetPasswordResponse
    >("/auth/reset-password", {
      resetToken,
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
          message === "Password reset token is invalid." ||
          message === "Password reset token is invalid or expired." ||
          message === "Password reset request is invalid."
            ? [message]
            : undefined,
      },
    };
  }
}

export async function ActivateWorkspaceInvitationAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = GetFormValue(formData, "email");
  const token = GetFormValue(formData, "token");
  const parsed = ResetPasswordSchema.safeParse({
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  if (!email || !token) {
    return {
      status: "error",
      message:
        "This invitation link is incomplete. Ask your administrator for a new invitation.",
    };
  }

  try {
    const response = await PostAuthJson<
      ActivateWorkspaceInvitationRequest,
      ActivateWorkspaceInvitationResponse
    >("/auth/workspace-invitation/activate", {
      email,
      token,
      newPassword: parsed.data.password,
      confirmNewPassword: parsed.data.confirmPassword,
    });

    return {
      status: "success",
      message: response.message,
      redirectTo: "/login",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not activate this invitation right now.",
    };
  }
}
