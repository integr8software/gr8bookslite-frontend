"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	GetCompletedOnboardingDestination,
	RequiresOnboarding,
} from "@/app/src/services/auth/AuthRouteState";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";

type OnboardingRouteGuardProps = {
	children: ReactNode;
};

export function OnboardingRouteGuard({
	children,
}: OnboardingRouteGuardProps) {
	const router = useRouter();
	const accessToken = useAppStore((state) => state.accessToken);
	const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
	const { data: profile, isFetching } = useAuthProfileQuery({
		accessToken,
		enabled: isAuthSessionReady,
	});
	const shouldRedirectToApplication =
		profile != null && !RequiresOnboarding(profile);

	useEffect(() => {
		if (!shouldRedirectToApplication || !profile) {
			return;
		}

		router.replace(GetCompletedOnboardingDestination(profile));
	}, [profile, router, shouldRedirectToApplication]);

	if (
		!isAuthSessionReady ||
		isFetching ||
		shouldRedirectToApplication
	) {
		return <MainLoadingScreen message="Checking onboarding status..." />;
	}

	return children;
}
