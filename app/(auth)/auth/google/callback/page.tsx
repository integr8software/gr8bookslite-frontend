"use client";

import { Suspense } from "react";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";
import { useGoogleAuthSessionRedirect } from "@/app/src/hooks/auth/useGoogleAuthSessionRedirect";

export default function GoogleAuthCallbackPage() {
	return (
		<Suspense fallback={<MainLoadingScreen />}>
			<GoogleAuthCallbackContent />
		</Suspense>
	);
}

function GoogleAuthCallbackContent() {
	const { redirectState } = useGoogleAuthSessionRedirect({
		requireSession: true,
	});

	if (redirectState === "onboarding") {
		return <OnboardingDraftLoadingScreen isFullScreen />;
	}

	if (redirectState === "system") {
		return <MainLoadingScreen />;
	}

	return <GoogleAuthCallbackMessage />;
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
