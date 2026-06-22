import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/app/src/ui/auth/LogoutButton";
import { OnboardingFlow } from "@/app/src/ui/onboarding/OnboardingFlow";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export const metadata: Metadata = {
	title: `Onboarding | ${AppName}`,
};

export default function OnboardingPage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-offwhite text-darknavy">
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(209,214,70,0.11),transparent_24%),radial-gradient(circle_at_90%_10%,rgba(87,196,229,0.17),transparent_28%)]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(rgba(33,39,56,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
				aria-hidden="true"
			/>

			<nav className="relative z-20 border-b border-darknavy/10 bg-white/80 backdrop-blur-xl">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
					<div className="inline-flex w-fit text-xl font-semibold sm:text-2xl">
						<LogoText brandSuffixClassName="text-sm" />
					</div>

					<LogoutButton className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 py-2.5 text-sm font-semibold text-darknavy shadow-sm transition hover:border-coralpink/40 hover:bg-coralpink/10 hover:text-coralpink">
						<span className="hidden sm:inline">Log out</span>
						<LogOut className="h-4 w-4" aria-hidden="true" />
					</LogoutButton>
				</div>
			</nav>

			<div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
				<OnboardingFlow />
			</div>
		</main>
	);
}
