import type { AuthProfileResponse } from "@/app/src/services/auth/AuthApiTypes";
import { GetPostAuthRedirectPathFromProfile } from "@/app/src/services/auth/AuthRedirects";

export const OnboardingRoutePath = "/onboarding";

export function RequiresOnboarding(profile: AuthProfileResponse | undefined) {
	return profile?.onboarding.requiresCompanySetup === true;
}

export function GetCompletedOnboardingDestination(
	profile: AuthProfileResponse,
) {
	return GetPostAuthRedirectPathFromProfile(profile);
}
