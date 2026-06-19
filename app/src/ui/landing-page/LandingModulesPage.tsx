import { LandingCtaSection } from "@/app/src/ui/landing-page/LandingCtaSection";
import { LandingModulesSection } from "@/app/src/ui/landing-page/LandingModulesSection";
import { LandingPageIntro } from "@/app/src/ui/landing-page/LandingPageIntro";

export function LandingModulesPage() {
	return (
		<main className="min-h-screen bg-white">
			<LandingPageIntro
				eyebrow="Product modules"
				title="Your back-office workflows, working together."
				description="Explore the connected modules that keep accounting, inventory, sales, purchasing, approvals, and reporting in one workspace."
			/>
			<LandingModulesSection />
			<LandingCtaSection />
		</main>
	);
}
