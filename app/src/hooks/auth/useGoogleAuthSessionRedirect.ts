"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthenticatedSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import {
  GetFallbackPostAuthRedirectPath,
  IsOnboardingRedirectPath,
  IsSystemRedirectPath,
  ResolvePostAuthDestination,
} from "@/app/src/services/auth/AuthRedirects";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import { GetAuthProfileCompanyId } from "@/app/src/services/auth/AuthProfileAccess";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

export type GoogleAuthRedirectState = "idle" | "resolving" | "system" | "onboarding";

type GoogleAuthMode = "login" | "signup";

type UseGoogleAuthSessionRedirectOptions = {
  requireToken?: boolean;
  defaultMode?: GoogleAuthMode;
};

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function buildAuthErrorPath(
  mode: string | null,
  defaultMode: GoogleAuthMode,
  message: string,
) {
  const url = new URL(readFallbackAuthPath(mode, defaultMode), window.location.origin);
  url.searchParams.set("googleAuthError", message);

  return `${url.pathname}${url.search}`;
}

function readFallbackAuthPath(mode: string | null, defaultMode: GoogleAuthMode) {
  const resolvedMode = mode === "signup" ? "signup" : defaultMode;
  return resolvedMode === "signup" ? "/signup" : "/login?force=true";
}

function readGoogleAuthCallbackParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));

  return {
    accessToken: hashParams.get("accessToken")?.trim() ?? "",
    error: searchParams.get("error"),
    googleAuthError: searchParams.get("googleAuthError"),
    mode: searchParams.get("mode"),
  };
}

async function createFrontendAuthSession(accessToken: string) {
  const sessionResponse = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken, rememberMe: false }),
    cache: "no-store",
  });

  if (!sessionResponse.ok) {
    const payload = (await sessionResponse.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(payload?.message ?? "Unable to create frontend auth session.");
  }

  return ResolvePostAuthDestination();
}

function getGoogleAuthRedirectState(path: string): GoogleAuthRedirectState {
  if (IsOnboardingRedirectPath(path)) {
    return "onboarding";
  }

  if (IsSystemRedirectPath(path)) {
    return "system";
  }

  return "resolving";
}

export function useGoogleAuthSessionRedirect({
  requireToken = false,
  defaultMode = "login",
}: UseGoogleAuthSessionRedirectOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const hasHandledRef = useRef(false);
  const [redirectState, setRedirectState] =
    useState<GoogleAuthRedirectState>("idle");

  useEffect(() => {
    if (hasHandledRef.current) {
      return;
    }

    const { accessToken, error, googleAuthError, mode } =
      readGoogleAuthCallbackParams();

    if (!accessToken && !error && !googleAuthError && !requireToken) {
      return;
    }

    hasHandledRef.current = true;

    if (!accessToken) {
      const message =
        googleAuthError ?? error ?? "Google sign-in could not be completed.";

      if (!googleAuthError) {
        console.log("[Google OAuth] Missing access token.", {
          error,
          mode,
          pathname: window.location.pathname,
          search: window.location.search,
        });
      }
      toast.error(message);
      router.replace(
        googleAuthError
          ? readFallbackAuthPath(mode, defaultMode)
          : buildAuthErrorPath(mode, defaultMode, message),
      );
      return;
    }

    void Promise.resolve()
      .then(async () => {
        setRedirectState("resolving");
        try {
          return await createFrontendAuthSession(accessToken);
        } catch (error) {
          console.log("[Google OAuth] Profile resolution fallback.", {
            error,
            pathname: window.location.pathname,
            search: window.location.search,
          });

          return {
            profile: null,
            redirectPath: GetFallbackPostAuthRedirectPath(accessToken),
          };
        }
      })
      .then(({ profile, redirectPath }) => {
        setAccessToken(AuthenticatedSessionMarker);
        setActiveCompanyId(profile ? GetAuthProfileCompanyId(profile) : null);
        queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
        setRedirectState(getGoogleAuthRedirectState(redirectPath));
        toast.success("Google sign-in successful.");
        router.replace(redirectPath);
      })
      .catch((googleAuthError: unknown) => {
        const message = readErrorMessage(
          googleAuthError,
          "Google sign-in could not create a valid session.",
        );

        console.log("[Google OAuth] Session redirect failed.", {
          error: googleAuthError,
          pathname: window.location.pathname,
          search: window.location.search,
        });
        toast.error(message);
        router.replace(buildAuthErrorPath(mode, defaultMode, message));
      });
  }, [
    defaultMode,
    queryClient,
    requireToken,
    router,
    setAccessToken,
    setActiveCompanyId,
  ]);

  return {
    isHandlingGoogleAuth: redirectState !== "idle",
    redirectState,
  };
}
