import { Check } from "lucide-react";
import { FeatureCards } from "@/app/src/data/landing-page/LandingPageData";
import { FeatureIcon } from "@/app/src/ui/landing-page/FeatureIcon";

const SupportingFeatures = [
	{
		icon: "reports" as const,
		title: "Actionable insights",
		text: "Turn daily transactions into useful operational reports.",
	},
	{
		icon: "teams" as const,
		title: "Connected workflows",
		text: "Keep teams, branches, and modules working from shared records.",
	},
	{
		icon: "approvals" as const,
		title: "Accountable security",
		text: "Control access with roles, approvals, and visible history.",
	},
] as const;

export function FeaturesSection() {
	return (
		<section
			id="features"
			className="landing-section landing-section-blue"
		>
			<div className="landing-section-content">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-darknavy sm:text-5xl">
						Everything you need. Nothing you don&apos;t.
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-darknavy/55 sm:text-base">
						Replace fragmented tools with one connected operating system
						for books, inventory, approvals, and reporting.
					</p>
				</div>

				<div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{FeatureCards.map((feature) => (
						<article
							key={feature.title}
							className="flex min-h-72 flex-col rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_16px_48px_rgba(33,39,56,0.07)] ring-1 ring-darknavy/10 backdrop-blur-md"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-skyblue/10 text-sky-700">
								<FeatureIcon name={feature.icon} className="h-5 w-5" />
							</div>
							<h3 className="mt-5 text-lg font-semibold text-darknavy">
								{feature.title}
							</h3>
							<p className="mt-3 text-sm leading-6 text-darknavy/55">
								{feature.text}
							</p>
							<ul className="mt-auto space-y-2 border-t border-darknavy/10 pt-5">
								{feature.bullets.map((bullet) => (
									<li
										key={bullet}
										className="flex items-center gap-2 text-xs font-medium text-darknavy/55"
									>
										<span className="flex h-4 w-4 items-center justify-center rounded-full bg-citron/25 text-darknavy">
											<Check className="h-2.5 w-2.5" strokeWidth={3} />
										</span>
										{bullet}
									</li>
								))}
							</ul>
						</article>
					))}
				</div>

				<div className="mt-4 grid gap-4 lg:grid-cols-3">
					{SupportingFeatures.map((feature) => (
						<article
							key={feature.title}
							className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/80 p-5 ring-1 ring-darknavy/10 backdrop-blur-md"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-skyblue/10 text-sky-700">
								<FeatureIcon name={feature.icon} className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-sm font-semibold text-darknavy">
									{feature.title}
								</h3>
								<p className="mt-1 text-xs leading-5 text-darknavy/50">
									{feature.text}
								</p>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
