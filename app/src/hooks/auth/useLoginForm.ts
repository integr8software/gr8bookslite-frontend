"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  InitialAuthActionState,
  type AuthActionState,
} from "@/app/src/data/auth/AuthTypes";
import {
  ClearPendingVerificationEmail,
  SavePendingVerificationEmail,
} from "@/app/src/data/auth/AuthVerificationStorage";
import {
  AuthenticatedSessionMarker,
  SaveAccessToken,
} from "@/app/src/data/auth/AuthSessionStorage";
import {
  GetFallbackPostAuthRedirectPath,
  IsOnboardingRedirectPath,
  IsSystemRedirectPath,
} from "@/app/src/services/auth/AuthRedirects";
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

async function EnsureFrontendSessionCreated() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Login worked, but Safari did not save the session cookie.");
  }
}

export function useLoginForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const [state, setState] = useState<AuthActionState>(InitialAuthActionState);
  const [pending, setPending] = useState(false);
  const [formValues, setFormValues] = useState<Partial<LoginFormValues>>({});
  const values: LoginFormValues = {
    ...InitialLoginFormValues,
    ...state.formValues,
    ...formValues,
  };
  const shouldShowImmediateSystemLoader =
    state.status === "success" &&
    Boolean(state.redirectTo) &&
    IsSystemRedirectPath(
      state.redirectTo ?? GetFallbackPostAuthRedirectPath(accessToken),
    );
  const successfulAuthRedirectPath =
    state.status === "success"
      ? state.redirectTo ?? GetFallbackPostAuthRedirectPath(accessToken)
      : null;
  const isResolvingPostAuthRef = useRef(false);

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

    if (pending) {
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
        status: "error",
        message: "Email or Password is incorrect.",
        errors: parsed.error.flatten().fieldErrors,
        formValues: { email },
      });
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
          rememberMe,
        }),
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        pendingVerificationEmail?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Email or Password is incorrect.");
      }

      await EnsureFrontendSessionCreated();

      const nextState: AuthActionState = {
        status: "success",
        message: payload?.message ?? "Login successful.",
        rememberMe,
        redirectTo: payload?.redirectTo,
      };

      setState(nextState);
      ClearPendingVerificationEmail();
      queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
      isResolvingPostAuthRef.current = true;
      SaveAccessToken(AuthenticatedSessionMarker, rememberMe);
      setAccessToken(AuthenticatedSessionMarker);
      toast.success(nextState.message);
      if (nextState.redirectTo) {
        router.push(nextState.redirectTo);
        return;
      }
      router.push(GetFallbackPostAuthRedirectPath(null));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Email or Password is incorrect.";
      const nextState: AuthActionState = {
        status: "error",
        message,
        errors: {
          password: ["Email or Password is incorrect."],
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
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (accessToken && !isResolvingPostAuthRef.current) {
      router.replace(GetFallbackPostAuthRedirectPath(accessToken));
    }
  }, [accessToken, router]);

  return {
    state,
    pending,
    isSystemRedirecting: shouldShowImmediateSystemLoader,
    isOnboardingRedirecting: IsOnboardingRedirectPath(successfulAuthRedirectPath),
    values,
    handleEmailChange,
    handleSubmit,
  };
}
