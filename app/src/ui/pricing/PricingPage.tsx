"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import {
	BillingOptions,
	PricingHeader,
	PricingPlans,
} from "@/app/src/data/pricing/PricingData";
import type {
	BillingCycle,
	PricingPlan,
} from "@/app/src/types/pricing/PricingTypes";

type PricingPageProps = {
	onGetStarted?: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function PricingPage({ onGetStarted }: PricingPageProps) {
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	const [selectedPlanCode, setSelectedPlanCode] = useState(
		PricingPlans.find((plan) => plan.highlighted)?.code ??
			PricingPlans[0]?.code,
	);
	const [hoveredPlanCode, setHoveredPlanCode] = useState<string | null>(null);

	const activePlanCode = hoveredPlanCode ?? selectedPlanCode;

	return (
		<main className="relative min-h-screen overflow-hidden bg-offwhite text-darknavy">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-136 bg-[radial-gradient(circle_at_78%_18%,rgba(87,196,229,0.20),transparent_30%),radial-gradient(circle_at_14%_4%,rgba(209,214,70,0.12),transparent_24%)]" />

			<section className="relative z-1 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-20">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-darknavy sm:text-6xl lg:text-7xl">
						One platform. The right plan for your business.
					</h1>

					<p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-darknavy/65 sm:text-lg">
						{PricingHeader.description} Start with what you need
						today and scale without switching systems.
					</p>
				</div>

				<div className="mx-auto mt-9 grid w-fit grid-cols-2 gap-1.5 rounded-xl border border-darknavy/10 bg-white/80 p-1.5 shadow-[0_12px_40px_rgba(33,39,56,0.08)] backdrop-blur">
					{BillingOptions.map((option) => {
						const isActive = billingCycle === option.value;

						return (
							<button
								key={option.value}
								type="button"
								onClick={() => setBillingCycle(option.value)}
								aria-pressed={isActive}
								className={`group flex h-12 min-w-26 flex-col items-center justify-center rounded-lg border px-5 text-sm font-semibold leading-tight outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-skyblue/30 sm:min-w-30 sm:px-7 ${
									isActive
										? "border-darknavy bg-darknavy text-white shadow-sm ring-1 ring-darknavy/20"
										: "border-transparent text-darknavy/60 hover:border-darknavy/10 hover:bg-offwhite hover:text-darknavy"
								}`}
							>
								<span>{option.label}</span>

								{option.value === "yearly" ? (
									<span
										className={`mt-0.5 text-[10px] font-extrabold uppercase leading-none ${
											isActive
												? "text-citron"
												: "text-sky-700 group-hover:text-citron"
										}`}
									>
										Save 2 months
									</span>
								) : null}
							</button>
						);
					})}
				</div>

				<div className="mx-auto mt-12 grid w-full max-w-md items-stretch gap-5 md:max-w-2xl lg:max-w-7xl lg:grid-cols-3">
					{PricingPlans.map((plan) => (
						<PricingCard
							key={plan.name}
							plan={plan}
							billingCycle={billingCycle}
							onGetStarted={onGetStarted}
							isActive={activePlanCode === plan.code}
							onSelect={() => setSelectedPlanCode(plan.code)}
							onHoverStart={() => setHoveredPlanCode(plan.code)}
							onHoverEnd={() => setHoveredPlanCode(null)}
						/>
					))}
				</div>
			</section>
		</main>
	);
}

function PricingCard({
	plan,
	billingCycle,
	onGetStarted,
	isActive,
	onSelect,
	onHoverStart,
	onHoverEnd,
}: {
	plan: PricingPlan;
	billingCycle: BillingCycle;
	onGetStarted?: (plan: PricingPlan, billingCycle: BillingCycle) => void;
	isActive: boolean;
	onSelect: () => void;
	onHoverStart: () => void;
	onHoverEnd: () => void;
}) {
	const price =
		billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

	const compareAtPrice =
		billingCycle === "monthly"
			? plan.monthlyCompareAtPrice
			: plan.yearlyCompareAtPrice;

	const billingLabel = plan.billingLabel[billingCycle];
	const numberOfUsers = plan.billingLabel.numberOfUsers;

	return (
		<motion.article
			onClick={onSelect}
			onHoverStart={onHoverStart}
			onHoverEnd={onHoverEnd}
			initial={false}
			animate={{
				y: isActive ? -10 : 0,
			}}
			whileTap={{
				scale: 0.985,
			}}
			transition={{
				type: "spring",
				stiffness: 320,
				damping: 24,
			}}
			className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-6 pt-8 outline-none transition-colors duration-300 sm:p-7 ${
				isActive ? "border-skyblue " : "border-darknavy/10 "
			}`}
		>
			<motion.div
				initial={false}
				animate={{
					opacity: isActive ? 1 : 0,
					scaleX: isActive ? 1 : 0.4,
				}}
				transition={{
					duration: 0.25,
				}}
				className="absolute inset-x-0 bottom-0 h-1 origin-center bg-skyblue"
			/>

			<h2 className="text-xl font-bold text-darknavy">{plan.name}</h2>

			<p className="mt-2 min-h-10 text-sm leading-5 text-darknavy/60">
				{plan.description ??
					"Flexible tools designed to grow with your business."}
			</p>

			<div className="mt-6 flex flex-wrap items-baseline gap-2">
				<p className="text-3xl font-bold tracking-[-0.03em] text-darknavy sm:text-4xl">
					{price}
				</p>

				{compareAtPrice ? (
					<p className="text-xs text-darknavy/80 line-through">
						{compareAtPrice}
					</p>
				) : null}
			</div>

			<div className="mt-2 min-h-10 text-xs font-medium leading-5 text-darknavy/80">
				<p>- {billingLabel}</p>

				{numberOfUsers ? (
					<p className="text-darknavy/80">- {numberOfUsers}</p>
				) : null}
			</div>

			<div className="my-6 h-px bg-darknavy/10" />

			<p className="text-xs font-bold uppercase tracking-[0.12em] text-darknavy/45">
				What&apos;s included
			</p>

			<ul className="mt-4 flex-1 space-y-3.5 text-sm text-darknavy/75">
				{plan.features.map((feature) => (
					<li key={feature.label} className="flex items-start gap-3">
						<span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ">
							<Check
								className="h-2.5 w-2.5 text-sky-800"
								strokeWidth={3}
								aria-hidden="true"
							/>
						</span>

						<span>{feature.label}</span>
					</li>
				))}
			</ul>

			{onGetStarted ? (
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						onGetStarted(plan, billingCycle);
					}}
					className={getCtaClasses()}
				>
					{plan.ctaLabel}
					<ArrowRight className="h-4 w-4" aria-hidden="true" />
				</button>
			) : (
				<Link
					href={plan.ctaHref}
					onClick={(event) => event.stopPropagation()}
					className={getCtaClasses()}
				>
					{plan.ctaLabel}
					<ArrowRight className="h-4 w-4" aria-hidden="true" />
				</Link>
			)}
		</motion.article>
	);
}

function getCtaClasses() {
	return "mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-darknavy px-5 text-sm font-bold text-white transition text-white transition hover:bg-sky-700";
}
