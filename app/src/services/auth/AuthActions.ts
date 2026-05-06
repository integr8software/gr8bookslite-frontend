"use server";

import {
  ForgotPasswordSchema,
  LoginSchema,
  OtpSchema,
  ResetPasswordSchema,
  SignUpSchema,
} from "@/app/src/data/auth/AuthSchemas";
import { MOCK_OTP_CODE } from "@/app/src/data/auth/OtpData";
import type {
  AuthActionState,
  AuthFieldErrors,
} from "@/app/src/data/auth/AuthTypes";

function GetFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function InvalidState(errors: AuthFieldErrors): AuthActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    errors,
  };
}

export async function LoginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = LoginSchema.safeParse({
    email: GetFormValue(formData, "email"),
    password: GetFormValue(formData, "password"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  return {
    status: "success",
    message: "Login request validated. Connect the auth provider next.",
  };
}

export async function SignUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = SignUpSchema.safeParse({
    name: GetFormValue(formData, "name"),
    email: GetFormValue(formData, "email"),
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  return {
    status: "success",
    message: "Account details validated. Connect persistence next.",
  };
}

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

  return {
    status: "success",
    message: "Password reset OTP sent. Please check your email.",
  };
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

  if (otp !== MOCK_OTP_CODE) {
    return {
      status: "error",
      message: "Incorrect OTP. Try again.",
      errors: {
        otp: ["The code you entered is invalid."],
      },
    };
  }

  return {
    status: "success",
    message: "OTP verified. Create a new password.",
  };
}

export async function ResetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = ResetPasswordSchema.safeParse({
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  return {
    status: "success",
    message: "Password reset successfully. You can now log in.",
  };
}

export async function OtpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const otp = GetFormValue(formData, "otp");
  const parsed = OtpSchema.safeParse({ otp });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  if (otp !== MOCK_OTP_CODE) {
    return {
      status: "error",
      message: "Incorrect OTP. Try again.",
      errors: {
        otp: ["The code you entered is invalid."],
      },
    };
  }

  return {
    status: "success",
    message: "OTP validated successfully.",
  };
}
