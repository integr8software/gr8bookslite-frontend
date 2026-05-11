"use client";

import { useRef, useState } from "react";
import {
  BillingOptions,
  type BillingCycle,
  type PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import { OnboardingPricingDesktopPlans } from "./OnboardingPricingDesktopPlans";
import { OnboardingPricingHero } from "./OnboardingPricingHero";
import { OnboardingPricingMobilePlans } from "./OnboardingPricingMobilePlans";

type OnboardingFreeTrialStepProps = {
  handlePlanSelection: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function OnboardingFreeTrialStep({
  handlePlanSelection,
}: OnboardingFreeTrialStepProps) {
  const pricingSectionRef = useRef<HTMLElement | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  function scrollToPricing() {
    pricingSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="mt-10 space-y-8">
      <OnboardingPricingHero onReviewPlans={scrollToPricing} />

      <section
        ref={pricingSectionRef}
        className="overflow-hidden rounded-4xl border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]"
      >
        <div className="border-b border-darknavy/10 bg-offwhite/50 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coralpink">
                Pricing Overview
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-darknavy">
                Compare plans before you continue
              </h3>
              <p className="mt-3 text-sm leading-6 text-darknavy/65 sm:text-base">
                Each plan begins with a free trial. Choose the setup that fits
                your team best, then we&apos;ll take you to billing.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full border border-darknavy/15 bg-white p-1 shadow-sm">
              {BillingOptions.map((option) => {
                const isActive = billingCycle === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBillingCycle(option.value)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-darknavy text-offwhite"
                        : "text-darknavy/70 hover:bg-darknavy/5"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <OnboardingPricingMobilePlans
          billingCycle={billingCycle}
          onReviewPlans={scrollToPricing}
          onSelectPlan={handlePlanSelection}
        />

        <OnboardingPricingDesktopPlans
          billingCycle={billingCycle}
          onReviewPlans={scrollToPricing}
          onSelectPlan={handlePlanSelection}
        />
      </section>
    </div>
  );
}
