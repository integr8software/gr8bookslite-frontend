import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PricingHeader, PricingPlans } from "@/app/src/data/pricing/PricingData";
import { LandingActionLink } from "@/app/src/ui/landing-page/LandingActionLink";

export function PricingSection() {
	return (
		<section id="pricing" className="landing-section landing-section-blue">
			<div className="landing-section-content">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-darknavy sm:text-5xl">
						Start with the plan that fits your company.
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-darknavy/55 sm:text-base">
						{PricingHeader.description}
					</p>
				</div>

				<div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3 lg:items-stretch">
					{PricingPlans.map((plan) => (
						<article
							key={plan.code}
							className={`relative flex h-full flex-col rounded-2xl border p-6 transition sm:p-7 ${
								plan.highlighted
									? "border-darknavy bg-darknavy text-white shadow-[0_22px_60px_rgba(33,39,56,0.18)] lg:-translate-y-2"
									: "border-darknavy/10 bg-white text-darknavy shadow-[0_14px_44px_rgba(33,39,56,0.07)]"
							}`}
						>
							{plan.highlighted ? (
								<span className="absolute -top-3 right-4 rounded-full bg-skyblue px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-darknavy shadow-sm ring-4 ring-white">
									Most popular
								</span>
							) : null}
							<p
								className={`min-h-8 text-[10px] font-bold uppercase tracking-[0.16em] ${
									plan.highlighted ? "text-white/45" : "text-darknavy/40"
								}`}
							>
								{plan.name}
							</p>
							<div className="mt-4 flex flex-wrap items-end gap-2">
								<p className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
									{plan.monthlyPrice}
								</p>
								<span
									className={`pb-1 text-xs ${
										plan.highlighted ? "text-white/45" : "text-darknavy/45"
									}`}
								>
									/month
								</span>
							</div>
							<p
								className={`mt-3 min-h-12 text-sm leading-6 ${
									plan.highlighted ? "text-white/60" : "text-darknavy/55"
								}`}
							>
								{plan.description}
							</p>

							<ul
								className={`mt-6 flex-1 space-y-3 border-t pt-6 ${
									plan.highlighted ? "border-white/10" : "border-darknavy/10"
								}`}
							>
								{plan.features.map((feature) => (
									<li
										key={feature.label}
										className={`flex items-start gap-2.5 text-xs leading-5 ${
											plan.highlighted
												? "text-white/75"
												: "text-darknavy/60"
										}`}
									>
										<Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-skyblue" strokeWidth={3} />
										{feature.label}
									</li>
								))}
							</ul>

							<div className="mt-7">
								<LandingActionLink
									href={plan.ctaHref}
									variant={plan.highlighted ? "secondary" : "primary"}
									fullWidth
									showArrow
								>
									{plan.ctaLabel}
								</LandingActionLink>
							</div>
						</article>
					))}
				</div>

				<div className="mt-9 text-center">
					<Link
						href="/pricing"
						className="inline-flex items-center gap-2 text-sm font-semibold text-darknavy transition hover:text-sky-700"
					>
						Compare plans and yearly pricing
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	);
}
