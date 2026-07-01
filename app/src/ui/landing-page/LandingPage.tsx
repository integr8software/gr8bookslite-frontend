import { BackToTopButton } from "@/app/src/ui/landing-page/BackToTopButton";
import { CallToActionSection } from "@/app/src/ui/landing-page/CallToActionSection";
import { FeaturesSection } from "@/app/src/ui/landing-page/FeaturesSection";
import { HeroSection } from "@/app/src/ui/landing-page/HeroSection";
import { ModulesSection } from "@/app/src/ui/landing-page/ModulesSection";
import { PricingSection } from "@/app/src/ui/landing-page/PricingSection";
import { SectionReveal } from "@/app/src/ui/landing-page/SectionReveal";
import { TestimonialsSection } from "@/app/src/ui/landing-page/TestimonialsSection";

export function LandingPage() {
	return (
		<main className="landing-page min-h-screen bg-[#f6f9fc] text-slate-950">
			<SectionReveal>
				<HeroSection />
			</SectionReveal>
			<SectionReveal>
				<ModulesSection />
			</SectionReveal>
			<SectionReveal>
				<FeaturesSection />
			</SectionReveal>
			<SectionReveal>
				<TestimonialsSection />
			</SectionReveal>
			<SectionReveal>
				<PricingSection />
			</SectionReveal>
			<SectionReveal>
				<CallToActionSection />
			</SectionReveal>
			<BackToTopButton />
		</main>
	);
}
