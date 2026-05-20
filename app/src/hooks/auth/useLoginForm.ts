"use client";

import { useActionState } from "react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
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
  GetRemainingPostAuthRedirectDelayMs,
  IsOnboardingRedirectPath,
  IsSystemRedirectPath,
  ResolvePostAuthDestination,
} from "@/app/src/services/auth/AuthRedirects";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

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

function NavigateAfterPostAuthDelay(startedAt: number, navigate: () => void) {
  const remainingDelay = GetRemainingPostAuthRedirectDelayMs(startedAt);

  if (remainingDelay === 0) {
    navigate();
    return null;
  }

  return window.setTimeout(navigate, remainingDelay);
}

export function useLoginForm() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const setActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const [state, formAction, pending] = useActionState(
    LoginAction,
    InitialAuthActionState,
  );
  const [formValues, setFormValues] = useState<Partial<LoginFormValues>>({});
  const [isSystemRedirecting, setIsSystemRedirecting] = useState(false);
  const [postAuthRedirectPath, setPostAuthRedirectPath] = useState<
    string | null
  >(null);
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
  const activePostAuthRedirectPath =
    postAuthRedirectPath ?? successfulAuthRedirectPath;
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
      if (state.accessToken) {
        isResolvingPostAuthRef.current = true;
        SaveAccessToken(state.accessToken, state.rememberMe ?? false);
        setAccessToken(state.accessToken);
      }
      toast.success(state.message);
      if (state.accessToken) {
        const redirectStartedAt = Date.now();
        let isCancelled = false;
        let redirectTimeout: ReturnType<typeof NavigateAfterPostAuthDelay> =
          null;

        void ResolvePostAuthDestination(state.accessToken)
          .then(({ profile, redirectPath }) => {
            if (isCancelled) {
              return;
            }

            setActiveCompanyId(profile.activeCompanyId);
            setPostAuthRedirectPath(redirectPath);
            setIsSystemRedirecting(IsSystemRedirectPath(redirectPath));
            redirectTimeout = NavigateAfterPostAuthDelay(
              redirectStartedAt,
              () => {
                if (!isCancelled) {
                  router.push(redirectPath);
                }
              },
            );
          })
          .catch(() => {
            if (isCancelled) {
              return;
            }

            const fallbackPath =
              state.redirectTo ??
              GetFallbackPostAuthRedirectPath(state.accessToken);

            setPostAuthRedirectPath(fallbackPath);
            setIsSystemRedirecting(IsSystemRedirectPath(fallbackPath));
            redirectTimeout = NavigateAfterPostAuthDelay(
              redirectStartedAt,
              () => {
                if (!isCancelled) {
                  router.push(fallbackPath);
                }
              },
            );
          });
        return () => {
          isCancelled = true;

          if (redirectTimeout !== null) {
            window.clearTimeout(redirectTimeout);
          }
        };
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
    isSystemRedirecting: isSystemRedirecting || shouldShowImmediateSystemLoader,
    isOnboardingRedirecting: IsOnboardingRedirectPath(activePostAuthRedirectPath),
    values,
    handleEmailChange,
    handleSubmit,
  };
}
