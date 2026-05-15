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
import { GetFallbackPostAuthRedirectPath } from "@/app/src/services/auth/AuthRedirects";

export async function LoginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const formValues = {
    email: GetFormValue(formData, "email"),
    password: GetFormValue(formData, "password"),
  };

  const rememberMe = formData.has("rememberMe");

  const parsed = LoginSchema.safeParse({
    email: formValues.email,
    password: formValues.password,
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors, formValues);
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
      accessToken: response.accessToken,
      rememberMe,
      redirectTo: GetFallbackPostAuthRedirectPath(response.accessToken),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not sign you in right now.";

    if (message.startsWith("Please verify your email before logging in.")) {
      return {
        status: "error",
        message,
        redirectTo: "/auth/verify-email",
        pendingVerificationEmail: parsed.data.email,
        formValues,
        rememberMe,
      };
    }

    return {
      status: "error",
      message,
      errors: {
        password: ["Email or Password is incorrect."],
      },
      formValues,
    };
  }
}
