"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SaveAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";
import {
	GetFallbackPostAuthRedirectPath,
	IsOnboardingRedirectPath,
	IsSystemRedirectPath,
	ResolvePostAuthDestination,
} from "@/app/src/services/auth/AuthRedirects";
import { GetAuthProfileCompanyId } from "@/app/src/services/auth/AuthProfileAccess";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

type GoogleAuthRedirectState = "resolving" | "system" | "onboarding";

function ReadRedirectPath(mode: string | null) {
	return mode === "signup" ? "/signup" : "/login";
}

export default function GoogleAuthCallbackPage() {
	return (
		<Suspense fallback={<MainLoadingScreen />}>
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
			void CreateFrontendAuthSession(accessToken)
				.then(({ profile, redirectPath }) => {
					SaveAccessToken(accessToken, false);
					setAccessToken(accessToken);
					setActiveCompanyId(GetAuthProfileCompanyId(profile));
					setRedirectState(GetGoogleAuthRedirectState(redirectPath));
					toast.success("Google sign-in successful.");
					router.replace(redirectPath);
				})
				.catch(() => {
					const fallbackPath = GetFallbackPostAuthRedirectPath(accessToken);

					setRedirectState(GetGoogleAuthRedirectState(fallbackPath));
					router.replace(fallbackPath);
				});
			return;
		}

		toast.error(error ?? "Google sign-in could not be completed.");
		router.replace(ReadRedirectPath(mode));
	}, [router, searchParams, setAccessToken, setActiveCompanyId]);

	if (redirectState === "onboarding") {
		return <OnboardingDraftLoadingScreen isFullScreen />;
	}

	if (redirectState === "system") {
		return <MainLoadingScreen />;
	}

	return <GoogleAuthCallbackMessage />;
}

async function CreateFrontendAuthSession(accessToken: string) {
	const sessionResponse = await fetch("/api/auth/session", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ accessToken, rememberMe: false }),
		cache: "no-store",
	});

	if (!sessionResponse.ok) {
		throw new Error("Unable to create frontend auth session.");
	}

	return ResolvePostAuthDestination(accessToken);
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
