import type { AuthProfile } from "@/app/src/types/auth/AuthTypes";
import { GetPostAuthRedirectPathFromProfile } from "@/app/src/services/auth/AuthRedirects";

export const OnboardingRoutePath = "/onboarding";

export function RequiresOnboarding(profile: AuthProfile | undefined) {
  return profile?.onboarding.requiresCompanySetup === true;
}

export function GetCompletedOnboardingDestination(profile: AuthProfile) {
  return GetPostAuthRedirectPathFromProfile(profile);
}
