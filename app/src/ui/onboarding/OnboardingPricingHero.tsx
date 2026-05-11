"use client";

import { OnboardingActionRow } from "./OnboardingActionRow";

type OnboardingPricingHeroProps = {
  onReviewPlans: () => void;
};

export function OnboardingPricingHero({
  onReviewPlans,
}: OnboardingPricingHeroProps) {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden rounded-4xl border border-white/10 bg-[#121316] px-6 py-10 text-offwhite shadow-[0_30px_90px_rgba(18,19,22,0.28)] sm:px-8 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(87,196,229,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(249,112,104,0.14),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]" />
      <div className="absolute left-[10%] top-[14%] h-16 w-16 -rotate-12 rounded-2xl border border-white/12 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.25)] backdrop-blur-md" />
      <div className="absolute right-[12%] top-[18%] hidden h-18 w-18 rotate-14 rounded-2xl border border-white/12 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.25)] backdrop-blur-md sm:block" />
      <div className="absolute bottom-[18%] left-[18%] hidden h-14 w-14 rotate-10 rounded-2xl border border-white/12 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.25)] backdrop-blur-md md:block" />
      <div className="absolute bottom-[20%] right-[16%] hidden h-14 w-14 rotate-[-10deg] rounded-2xl border border-white/12 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.25)] backdrop-blur-md md:block" />

      <div className="relative flex max-w-3xl flex-col items-center justify-center text-center">
        <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-medium text-offwhite/90 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
          Free Trial Experience
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-skyblue">
          Start Here
        </p>
        <h2 className="mt-4 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.04em] text-offwhite sm:text-5xl lg:text-6xl">
          Start with a free trial before choosing your plan
        </h2>
        <p className="mt-6 max-w-2xl text-center text-sm leading-7 text-offwhite/68 sm:text-base">
          Explore the available plans below. Every option begins with a free
          trial, so you can continue onboarding now and decide on pricing when
          you are ready.
        </p>

        <div className="mt-10">
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
