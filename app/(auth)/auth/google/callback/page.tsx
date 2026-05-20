"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SaveAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { Gr8BooksLoadingScreen } from "@/app/src/ui/shared/Gr8BooksLoadingScreen";
import {
  GetFallbackPostAuthRedirectPath,
  GetRemainingPostAuthRedirectDelayMs,
  IsOnboardingRedirectPath,
  IsSystemRedirectPath,
  ResolvePostAuthDestination,
} from "@/app/src/services/auth/AuthRedirects";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

type GoogleAuthRedirectState = "resolving" | "system" | "onboarding";

function ReadRedirectPath(mode: string | null) {
	return mode === "signup" ? "/signup" : "/login";
}

function NavigateAfterPostAuthDelay(startedAt: number, navigate: () => void) {
	const remainingDelay = GetRemainingPostAuthRedirectDelayMs(startedAt);

	if (remainingDelay === 0) {
		navigate();
		return null;
	}

	return window.setTimeout(navigate, remainingDelay);
}

export default function GoogleAuthCallbackPage() {
	return (
		<Suspense fallback={<Gr8BooksLoadingScreen />}>
			<GoogleAuthCallbackContent />
		</Suspense>
	);
}

function GoogleAuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const setActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
	const setAccessToken = useAppStore((state) => state.setAccessToken);
	const [redirectState, setRedirectState] =
		useState<GoogleAuthRedirectState>("resolving");

	useEffect(() => {
		const hashParams = new URLSearchParams(window.location.hash.slice(1));
		const accessToken = hashParams.get("accessToken");
		const error = searchParams.get("error");
		const mode = searchParams.get("mode");

		if (accessToken) {
			const redirectStartedAt = Date.now();
			let isCancelled = false;
			let redirectTimeout: ReturnType<typeof NavigateAfterPostAuthDelay> =
				null;

			SaveAccessToken(accessToken, false);
			setAccessToken(accessToken);
			toast.success("Google sign-in successful.");
			void ResolvePostAuthDestination(accessToken)
				.then(({ profile, redirectPath }) => {
					if (isCancelled) {
						return;
					}

					setActiveCompanyId(profile.activeCompanyId);
					setRedirectState(GetGoogleAuthRedirectState(redirectPath));
					redirectTimeout = NavigateAfterPostAuthDelay(
						redirectStartedAt,
						() => {
							if (!isCancelled) {
								router.replace(redirectPath);
							}
						},
					);
				})
				.catch(() => {
					if (isCancelled) {
						return;
					}

					const fallbackPath = GetFallbackPostAuthRedirectPath(accessToken);

					setRedirectState(GetGoogleAuthRedirectState(fallbackPath));
					redirectTimeout = NavigateAfterPostAuthDelay(
						redirectStartedAt,
						() => {
							if (!isCancelled) {
								router.replace(fallbackPath);
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

		toast.error(error ?? "Google sign-in could not be completed.");
		router.replace(ReadRedirectPath(mode));
	}, [router, searchParams, setAccessToken, setActiveCompanyId]);

	if (redirectState === "onboarding") {
		return <OnboardingDraftLoadingScreen isFullScreen />;
	}

	if (redirectState === "system") {
		return <Gr8BooksLoadingScreen />;
	}

	return <GoogleAuthCallbackMessage />;
}

function GetGoogleAuthRedirectState(path: string): GoogleAuthRedirectState {
	if (IsOnboardingRedirectPath(path)) {
		return "onboarding";
	}

	if (IsSystemRedirectPath(path)) {
		return "system";
	}

	return "resolving";
}

function GoogleAuthCallbackMessage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-darknavy">
			<p className="text-sm text-darknavy/70">
				Finishing your Google sign-in...
			</p>
		</main>
	);
}
