import type { AuthProfile } from "@/app/src/types/auth/AuthTypes";
import { GetPostAuthRedirectPathFromProfile } from "@/app/src/services/auth/AuthRedirects";
export { OnboardingRoutePath } from "@/app/src/services/auth/AuthRouteConstants";

export function RequiresOnboarding(profile: AuthProfile | undefined) {
  return profile?.onboarding.requiresCompanySetup === true;
}

export function GetCompletedOnboardingDestination(profile: AuthProfile) {
  return GetPostAuthRedirectPathFromProfile(profile);
}
