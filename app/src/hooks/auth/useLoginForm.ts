"use client";

import { useActionState } from "react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  ClearPendingVerificationEmail,
  SavePendingVerificationEmail,
} from "@/app/src/data/auth/AuthVerificationStorage";
import { SaveAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { LoginAction } from "@/app/src/services/auth/AuthActions";
import {
  GetFallbackPostAuthRedirectPath,
  IsOnboardingRedirectPath,
  IsSystemRedirectPath,
  ReadAuthJwtPayload,
} from "@/app/src/services/auth/AuthRedirects";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

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
  const accessToken = useAppStore((state) => state.accessToken);
  const setActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const [state, formAction, pending] = useActionState(
    LoginAction,
    InitialAuthActionState,
  );
  const [formValues, setFormValues] = useState<Partial<LoginFormValues>>({});
  const values: LoginFormValues = {
    ...InitialLoginFormValues,
    ...state.formValues,
    ...formValues,
  };
  const shouldShowImmediateSystemLoader =
    state.status === "success" &&
    Boolean(state.accessToken) &&
    IsSystemRedirectPath(
      state.redirectTo ?? GetFallbackPostAuthRedirectPath(state.accessToken),
    );
  const successfulAuthRedirectPath =
    state.status === "success" && state.accessToken
      ? state.redirectTo ?? GetFallbackPostAuthRedirectPath(state.accessToken)
      : null;
  const wasPendingRef = useRef(false);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submittedFormData = new FormData(event.currentTarget);
    updateValues({
      email: GetSubmittedValue(submittedFormData, "email"),
    });
  }

  useEffect(() => {
    if (accessToken && !isResolvingPostAuthRef.current) {
      router.replace(GetFallbackPostAuthRedirectPath(accessToken));
    }
  }, [accessToken, router]);

  useEffect(() => {
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (!justFinishedSubmitting || !state.message) {
      return;
    }

    if (state.status === "success") {
      ClearPendingVerificationEmail();
      queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
      if (state.accessToken) {
        isResolvingPostAuthRef.current = true;
        SaveAccessToken(state.accessToken, state.rememberMe ?? false);
        setAccessToken(state.accessToken);
      }
      toast.success(state.message);
      if (state.accessToken) {
        const fallbackPath =
          state.redirectTo ?? GetFallbackPostAuthRedirectPath(state.accessToken);
        const payload = ReadAuthJwtPayload(state.accessToken);

        setActiveCompanyId(payload?.companyId ?? null);
        router.push(fallbackPath);
        return;
      }
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
      return;
    }

    if (state.status === "error") {
      isResolvingPostAuthRef.current = false;
      toast.error(state.message);
      if (state.pendingVerificationEmail) {
        SavePendingVerificationEmail(state.pendingVerificationEmail);
      }
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [
    pending,
    queryClient,
    router,
    state.accessToken,
    state.message,
    state.rememberMe,
    state.pendingVerificationEmail,
    state.redirectTo,
    state.status,
    setActiveCompanyId,
    setAccessToken,
  ]);

  return {
    state,
    formAction,
    pending,
    isSystemRedirecting: shouldShowImmediateSystemLoader,
    isOnboardingRedirecting: IsOnboardingRedirectPath(successfulAuthRedirectPath),
    values,
    handleEmailChange,
    handleSubmit,
  };
}
