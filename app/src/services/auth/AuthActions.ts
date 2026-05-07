"use server";

import {
  ChangeVerificationEmailSchema,
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
import { PostAuthJson } from "@/app/src/services/auth/AuthApi";

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

type RegisterRequest = {
  fullName: string;
  email: string;
  contactNumber?: string;
  password: string;
  confirmPassword: string;
};

type RegisterResponse = {
  message: string;
  verificationRequired: boolean;
  nextStep: string;
  email: string;
  maskedEmail: string;
};

type VerifyEmailRequest = {
  email: string;
  code: string;
};

type VerifyEmailResponse = {
  message?: string;
  accessToken: string;
};

type ResendVerificationRequest = {
  email: string;
};

type ResendVerificationResponse = {
  message: string;
  maskedEmail: string;
};

type ChangeVerificationEmailRequest = {
  currentEmail: string;
  newEmail: string;
};

type ChangeVerificationEmailResponse = {
  message: string;
  maskedEmail: string;
};

export async function LoginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = LoginSchema.safeParse({
    email: GetFormValue(formData, "email"),
    password: GetFormValue(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Email or Password is incorrect.",
      errors: {
        password: ["Email or Password is incorrect."],
      },
    };
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
    contactNumber: GetFormValue(formData, "contactNumber"),
    password: GetFormValue(formData, "password"),
    confirmPassword: GetFormValue(formData, "confirmPassword"),
    termsAccepted: formData.has("termsAccepted"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  try {
    const response = await PostAuthJson<RegisterRequest, RegisterResponse>(
      "/auth/register",
      {
        fullName: parsed.data.name,
        email: parsed.data.email,
        contactNumber: parsed.data.contactNumber,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
      },
    );

    const otpParams = new URLSearchParams({
      email: response.email,
    });

    return {
      status: "success",
      message: response.message,
      redirectTo: `/otp?${otpParams.toString()}`,
      pendingVerificationEmail: response.email,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not create your account right now.",
    };
  }
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
    const response = await PostAuthJson<VerifyEmailRequest, VerifyEmailResponse>(
      "/auth/verify-email",
      {
        email: emailValidation.data.email,
        code: parsed.data.otp,
      },
    );

    return {
      status: "success",
      message: response.message ?? "Email verified successfully.",
      redirectTo: "/login",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not verify your email right now.",
      errors: {
        otp: ["The code you entered is invalid."],
      },
    };
  }
}

export async function ResendVerificationAction(
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
      ResendVerificationRequest,
      ResendVerificationResponse
    >("/auth/resend-verification", {
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
          : "We could not resend the verification code right now.",
    };
  }
}

export async function ChangeVerificationEmailAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
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
    const response = await PostAuthJson<
      ChangeVerificationEmailRequest,
      ChangeVerificationEmailResponse
    >("/auth/change-verification-email", parsed.data);

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
          : "We could not update your verification email right now.",
    };
  }
}
