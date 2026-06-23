"use client";

import { Suspense } from "react";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { useGoogleAuthSessionRedirect } from "@/app/src/hooks/auth/useGoogleAuthSessionRedirect";

export default function GoogleAuthCallbackPage() {
	return (
		<Suspense fallback={<GoogleAuthCallbackMessage />}>
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
		return <GoogleAuthCallbackMessage message="Opening your workspace..." />;
	}

	return <GoogleAuthCallbackMessage />;
}

function GoogleAuthCallbackMessage({
	message = "Finishing your Google sign-in...",
}: {
	message?: string;
}) {
	return (
		<main className="flex h-dvh min-h-0 items-center justify-center overflow-hidden bg-white px-6 text-center text-darknavy">
			<p className="text-sm text-darknavy/70">{message}</p>
		</main>
	);
}
