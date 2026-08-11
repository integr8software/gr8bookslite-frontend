"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AuthActionStatuses, InitialAuthActionState, type AuthActionState } from "@/app/src/types/auth/AuthTypes";
import { ClearPendingVerificationEmail, SavePendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { AuthenticatedSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import { LoginWithFrontendAuthSession } from "@/app/src/services/auth/AuthApi";
import { GetFallbackPostAuthRedirectPath, IsOnboardingRedirectPath, IsSystemRedirectPath } from "@/app/src/services/auth/AuthRedirects";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { LoginSchema } from "@/app/src/validations/auth/AuthValidation";

type LoginFormValues = {
  email: string;
};

const InitialLoginFormValues: LoginFormValues = {
  email: "",
};

function GetSubmittedValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function useLoginForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAppStore((state) => state.accessToken);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const [state, setState] = useState<AuthActionState>(InitialAuthActionState);
  const [formValues, setFormValues] = useState<Partial<LoginFormValues>>({});
  const loginMutation = useMutation({
    mutationFn: LoginWithFrontendAuthSession,
  });
  const values: LoginFormValues = {
    ...InitialLoginFormValues,
    ...state.formValues,
    ...formValues,
  };
  const shouldShowImmediateSystemLoader =
    state.status === AuthActionStatuses.Success &&
    Boolean(state.redirectTo) &&
    IsSystemRedirectPath(state.redirectTo ?? GetFallbackPostAuthRedirectPath(accessToken));
  const successfulAuthRedirectPath =
    state.status === AuthActionStatuses.Success ? (state.redirectTo ?? GetFallbackPostAuthRedirectPath(accessToken)) : null;
  const isResolvingPostAuthRef = useRef(false);
  const isForcedLogin = searchParams.get("force") === "true";

  function updateValues(nextValues: Partial<LoginFormValues>) {
    setFormValues((currentValues) => ({
      ...currentValues,
      ...nextValues,
    }));
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    updateValues({ email: event.target.value });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loginMutation.isPending) {
      return;
    }

    const submittedFormData = new FormData(event.currentTarget);
    const email = GetSubmittedValue(submittedFormData, "email");
    const password = GetSubmittedValue(submittedFormData, "password");
    const rememberMe = submittedFormData.has("rememberMe");

    updateValues({
      email,
    });

    const parsed = LoginSchema.safeParse({ email, password });

    if (!parsed.success) {
      setState({
        ...InitialAuthActionState,
        status: AuthActionStatuses.Error,
        message: "Email or Password is incorrect.",
        errors: parsed.error.flatten().fieldErrors,
        formValues: { email },
      });
      return;
    }

    try {
      const payload = await loginMutation.mutateAsync({
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe,
      });

      const nextState: AuthActionState = {
        status: AuthActionStatuses.Success,
        message: payload?.message ?? "Login successful.",
        rememberMe,
        redirectTo: payload?.redirectTo,
      };

      setState(nextState);
      ClearPendingVerificationEmail();
      queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
      isResolvingPostAuthRef.current = true;
      setAccessToken(AuthenticatedSessionMarker);
      toast.success(nextState.message);
      if (nextState.redirectTo) {
        router.push(nextState.redirectTo);
        return;
      }
      router.push(GetFallbackPostAuthRedirectPath(null));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email or Password is incorrect.";
      const passwordMessage = message.startsWith("This account does not have a password yet.")
        ? message
        : "Email or Password is incorrect.";
      const nextState: AuthActionState = {
        status: AuthActionStatuses.Error,
        message,
        errors: {
          password: [passwordMessage],
        },
        formValues: { email },
      };

      setState(nextState);
      isResolvingPostAuthRef.current = false;
      toast.error(message);
      if (message.startsWith("Please verify your email before logging in.")) {
        SavePendingVerificationEmail(parsed.data.email);
        router.push("/auth/verify-email");
      }
    }
  }

  useEffect(() => {
    if (accessToken && !isResolvingPostAuthRef.current && !isForcedLogin) {
      router.replace(GetFallbackPostAuthRedirectPath(accessToken));
    }
  }, [accessToken, isForcedLogin, router]);

  return {
    state,
    pending: loginMutation.isPending,
    isSystemRedirecting: shouldShowImmediateSystemLoader,
    isOnboardingRedirecting: IsOnboardingRedirectPath(successfulAuthRedirectPath),
    values,
    handleEmailChange,
    handleSubmit,
  };
}
