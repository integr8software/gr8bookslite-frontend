"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";
import {
	BillingOptions,
	PricingHeader,
	PricingPlans,
	type PricingPlan,
	type BillingCycle,
} from "@/app/src/data/pricing/PricingData";

type PricingPageProps = {
	onGetStarted?: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function PricingPage({ onGetStarted }: PricingPageProps) {
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	const [selectedPlan, setSelectedPlan] = useState(PricingPlans[1]?.name ?? "");

	return (
		<div className="mx-auto flex w-full max-w-360 flex-col items-center justify-center bg-white px-5 py-12 text-darknavy sm:px-8 lg:px-12 lg:py-16">
			<section className="flex flex-col items-center">
				<h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
					{PricingHeader.title}
				</h1>
				<p className="mt-3 max-w-2xl text-center text-sm leading-6 text-darknavy/60 sm:text-base">
					{PricingHeader.description}
				</p>

				<div className="mt-8 inline-flex rounded-lg border border-darknavy/35 bg-white p-1 shadow-sm">
					{BillingOptions.map((option) => {
						const isActive = billingCycle === option.value;

						return (
							<button
								key={option.value}
								type="button"
								onClick={() => setBillingCycle(option.value)}
								aria-pressed={isActive}
								className={`min-w-[92px] rounded-md px-5 py-3 text-sm font-medium transition-colors ${
									isActive
										? "bg-darknavy text-offwhite shadow-sm"
										: "text-darknavy/75 hover:bg-darknavy/5"
								}`}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			</section>

			<section className="mt-14 grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
				{PricingPlans.map((plan) => {
					const price =
						billingCycle === "monthly"
							? plan.monthlyPrice
							: plan.yearlyPrice;
					const billingLabel = plan.billingLabel[billingCycle];
					const isSelected = selectedPlan === plan.name;

					return (
						<article
							key={plan.name}
							onClick={() => setSelectedPlan(plan.name)}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									setSelectedPlan(plan.name);
								}
							}}
							role="button"
							tabIndex={0}
							aria-pressed={isSelected}
							className={`flex h-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition-transform duration-200 hover:-translate-y-1 ${
								isSelected
									? "border-darknavy/55 shadow-[0_18px_40px_rgba(33,39,56,0.10)]"
									: "border-darknavy/12"
							}`}
						>
							<div>
								<h2 className="text-[1.7rem] font-semibold leading-tight">
									{plan.name}
								</h2>
								<p className="mt-4 text-4xl font-semibold tracking-tight">
									{price}
								</p>
								<p className="mt-2 text-sm text-darknavy/65">
									{billingLabel}
								</p>
							</div>

							<ul className="mt-5 flex-1 space-y-3 text-sm text-darknavy/80">
								{plan.features.map((feature) => (
									<li
										key={feature.label}
										className="flex items-start gap-3"
									>
										<Check
											className="mt-0.5 h-4 w-4 shrink-0 text-darknavy"
											strokeWidth={2.4}
										/>
										<span>{feature.label}</span>
									</li>
								))}
							</ul>

							{onGetStarted ? (
								<button
									type="button"
									onClick={() => onGetStarted(plan, billingCycle)}
									className="mt-7 inline-flex items-center justify-center rounded-md bg-darknavy px-5 py-3 text-sm font-semibold text-offwhite transition hover:bg-coralpink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink focus-visible:ring-offset-2"
								>
									{plan.ctaLabel}
								</button>
							) : (
								<Link
									href={plan.ctaHref}
									className="mt-7 inline-flex items-center justify-center rounded-md bg-darknavy px-5 py-3 text-sm font-semibold text-offwhite transition hover:bg-coralpink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink focus-visible:ring-offset-2"
								>
									{plan.ctaLabel}
								</Link>
							)}
						</article>
					);
				})}
			</section>
		</div>
	);
}
