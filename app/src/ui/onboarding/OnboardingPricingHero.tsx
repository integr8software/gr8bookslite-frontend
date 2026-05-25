"use client";

import { OnboardingActionRow } from "@/app/src/ui/onboarding/OnboardingActionRow";

type OnboardingPricingHeroProps = {
  onReviewPlans: () => void;
};

export function OnboardingPricingHero({
  onReviewPlans,
}: OnboardingPricingHeroProps) {
  return (
    <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden rounded-[2.25rem] border border-white/8 bg-darknavy px-6 py-12 text-offwhite shadow-[0_28px_80px_rgba(11,15,26,0.34)] sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(87,196,229,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(249,112,104,0.18),transparent_30%),linear-gradient(180deg,rgba(7,10,18,0.94),rgba(10,13,22,0.98))]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,rgba(236,242,239,0.95)_1px,transparent_1.2px)] bg-size-[18px_18px]" />
      <div className="absolute inset-x-[28%] bottom-[-18%] h-56 rounded-full bg-coralpink/18 blur-3xl sm:h-64" />
      <div className="absolute inset-x-[34%] top-[-16%] h-40 rounded-full bg-skyblue/10 blur-3xl sm:h-48" />

      <div className="absolute left-[9%] top-[13%] h-14 w-12 rotate-[-13deg]rounded-[1.15rem] border border-white/10 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.28)] backdrop-blur-md sm:h-16 sm:w-14" />
      <div className="absolute right-[12%] top-[16%] h-12 w-10 rotate-11 rounded-2xl border border-white/10 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.28)] backdrop-blur-md sm:h-14 sm:w-12" />
      <div className="absolute bottom-[18%] left-[18%] hidden h-12 w-12 rotate-10 rounded-2xl border border-white/10 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.28)] backdrop-blur-md md:block" />
      <div className="absolute bottom-[20%] right-[16%] hidden h-12 w-12 -rotate-12 rounded-2xl border border-white/10 bg-white/6 shadow-[0_18px_35px_rgba(0,0,0,0.28)] backdrop-blur-md md:block" />

      <div className="relative flex max-w-4xl flex-col items-center justify-center text-center">
        <h2 className="max-w-5xl text-balance text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.06em] text-offwhite sm:text-6xl lg:text-[4rem]">
          Start -with a 15days free trial after choosing your plan.
        </h2>
        <p className="mt-7 max-w-3xl text-center text-sm leading-7 text-offwhite/60 sm:text-lg sm:leading-8">
          Explore the available plans below. Every option begins with a free
          trial, so you can continue onboarding now and decide on pricing when
          you are ready.
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
