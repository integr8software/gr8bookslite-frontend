"use client";

import { OnboardingActionRow } from "@/app/src/ui/onboarding/OnboardingActionRow";

type OnboardingPricingHeroProps = {
  onReviewPlans: () => void;
};

export function OnboardingPricingHero({
  onReviewPlans,
}: OnboardingPricingHeroProps) {
  return (
    <section className="relative flex min-h-[24rem] items-center justify-center overflow-hidden rounded-2xl border border-skyblue/30 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.88),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(87,196,229,0.42),transparent_38%),linear-gradient(145deg,#d8f1fb_0%,#edf8fc_44%,#ccecf8_100%)] px-6 py-14 text-darknavy shadow-[0_18px_60px_rgba(33,39,56,0.10)] sm:px-10 lg:px-14">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(33,39,56,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex max-w-4xl flex-col items-center justify-center text-center">
        <h2 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-darknavy sm:text-5xl lg:text-6xl">
          Start with a 15-day free trial.
        </h2>
        <p className="mt-7 max-w-3xl text-center text-sm leading-7 text-darknavy/60 sm:text-lg sm:leading-8">
          Choose the plan that fits your workflow. You can explore the product
          first and won&apos;t be charged until your trial ends.
        </p>

        <div className="mt-10 sm:mt-12">
          <OnboardingActionRow
            showBack={false}
            primaryVariant="circle"
            onPrimary={onReviewPlans}
            onBack={() => undefined}
          />
        </div>
      </div>
    </section>
  );
}
