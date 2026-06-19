import { LandingCtaSection } from "@/app/src/ui/landing-page/LandingCtaSection";
import { LandingHeroSection } from "@/app/src/ui/landing-page/LandingHeroSection";
import { LandingHighlightsSection } from "@/app/src/ui/landing-page/LandingHighlightsSection";
import { LandingModulesSection } from "@/app/src/ui/landing-page/LandingModulesSection";

export function LandingPage() {
	return (
		<main className="landing-page min-h-screen bg-[#f6f9fc] text-slate-950">
			<LandingHeroSection />
			<LandingModulesSection />
			<LandingHighlightsSection />
			<LandingCtaSection />
		</main>
  );
}
