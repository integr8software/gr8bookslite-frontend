"use server";

import { LoginSchema } from "@/app/src/data/auth/AuthSchemas";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  type LoginRequest,
  type LoginResponse,
} from "@/app/src/services/auth/AuthApiTypes";
import { PostAuthJson } from "@/app/src/services/auth/AuthApi";
import {
  GetFormValue,
  InvalidState,
} from "@/app/src/services/auth/AuthActionUtils";

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

  try {
    const response = await PostAuthJson<LoginRequest, LoginResponse>(
      "/auth/login",
      {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    );

    return {
      status: "success",
      message: response.message ?? "Login successful.",
      redirectTo: "/onboarding",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not sign you in right now.";

    if (message.startsWith("Please verify your email before logging in.")) {
      const otpParams = new URLSearchParams({
        email: parsed.data.email,
      });

      return {
        status: "error",
        message,
        redirectTo: `/otp?${otpParams.toString()}`,
        pendingVerificationEmail: parsed.data.email,
      };
    }

    return {
      status: "error",
      message,
      errors: {
        password: ["Email or Password is incorrect."],
      },
    };
  }
}
