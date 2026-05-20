import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/app/src/ui/auth/LogoutButton";
import { OnboardingFlow } from "@/app/src/ui/onboarding/OnboardingFlow";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { Gr8BooksLogoText } from "@/app/src/ui/shared/Gr8BooksLogoText";

export const metadata: Metadata = {
  title: `Onboarding | ${AppName}`,
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between border-b border-darknavy/10 px-5 py-5 sm:px-8 lg:px-14">
        <div className="inline-flex w-fit text-xl font-semibold sm:text-2xl">
          <Gr8BooksLogoText neoClassName="text-sm" />
        </div>

        <LogoutButton
          className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-darknavy/15 px-4 py-2.5 text-sm font-semibold text-darknavy transition hover:border-coralpink hover:bg-coralpink hover:text-offwhite"
        >
          <span>Logout</span>
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </LogoutButton>
      </nav>

      <div className="max-w-280 mx-auto px-5 py-8 sm:px-8 lg:px-14 lg:py-12">
        <OnboardingFlow />
      </div>
    </div>
  );
}
