import { LandingCtaSection } from "@/app/src/ui/landing-page/LandingCtaSection";
import { LandingHighlightsSection } from "@/app/src/ui/landing-page/LandingHighlightsSection";
import { LandingPageIntro } from "@/app/src/ui/landing-page/LandingPageIntro";

export function LandingWhyGr8BooksPage() {
	return (
		<main className="min-h-screen bg-white">
			<LandingPageIntro
				eyebrow="Why Gr8Books"
				title="Clear records and controlled operations."
				description="Keep financial records, stock movement, approvals, branches, and reporting connected as your company grows."
			/>
			<LandingHighlightsSection />
			<LandingCtaSection />
		</main>
	);
}
