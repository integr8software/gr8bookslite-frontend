import type { Metadata } from "next";
import { OnboardingFlow } from "@/app/src/ui/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Onboarding | GR8BooksLite",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
