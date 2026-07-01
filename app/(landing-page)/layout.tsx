import type { ReactNode } from "react";
import { LandingFooter } from "@/app/src/ui/landing-page/LandingFooter";
import { LandingNavigation } from "@/app/src/ui/landing-page/LandingNavigation";

export default function LandingPageLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<>
			<LandingNavigation />
			{children}
			<LandingFooter />
		</>
	);
}
