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

				<div
					className="landing-feature-carousel mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:grid sm:overflow-visible sm:pb-0 md:grid-cols-2 xl:grid-cols-4"
					aria-label="Swipe to explore product features"
				>
					{FeatureCards.map((feature) => (
						<article
							key={feature.title}
							className="flex w-[86%] shrink-0 snap-center flex-col rounded-xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(33,39,56,0.06)] ring-1 ring-darknavy/10 backdrop-blur-md first:snap-start sm:min-h-72 sm:w-auto sm:rounded-2xl sm:p-6 sm:shadow-[0_16px_48px_rgba(33,39,56,0.07)]"
						>
							<div className="flex items-center gap-3 sm:block">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-skyblue/10 text-sky-700 sm:h-10 sm:w-10 sm:rounded-xl">
									<FeatureIcon
										name={feature.icon}
										className="h-4 w-4 sm:h-5 sm:w-5"
									/>
								</div>
								<h3 className="text-base font-semibold text-darknavy sm:mt-5 sm:text-lg">
									{feature.title}
								</h3>
							</div>
							<p className="mt-3 text-xs leading-5 text-darknavy/55 sm:text-sm sm:leading-6">
								{feature.text}
							</p>
							<ul className="mt-4 grid gap-1.5 border-t border-darknavy/10 pt-3 sm:mt-auto sm:block sm:space-y-2 sm:pt-5">
								{feature.bullets.map((bullet) => (
									<li
										key={bullet}
										className="flex items-center gap-2 text-[11px] font-medium text-darknavy/55 sm:text-xs"
									>
										<span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-citron/25 text-darknavy sm:h-4 sm:w-4">
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
