"use client";

import { Check, MoveRight } from "lucide-react";
import { useRef, useState } from "react";
import {
  BillingOptions,
  PricingPlans,
  type BillingCycle,
  type PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import { OnboardingActionRow } from "./OnboardingActionRow";

type OnboardingFreeTrialStepProps = {
  handlePlanSelection: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function OnboardingFreeTrialStep({
  handlePlanSelection,
}: OnboardingFreeTrialStepProps) {
  const pricingSectionRef = useRef<HTMLElement | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const comparisonRows = [
    {
      label: "Best for",
      values: [
        "Solo bookkeeping and lean teams",
        "Growing operations with inventory",
        "Expanding into multiple entities",
      ],
    },
    {
      label: "Included users",
      values: ["Up to 3 users", "Up to 10 users", "Per additional company"],
    },
    {
      label: "Priority support",
      values: [true, true, true],
    },
    {
      label: "Inventory workflows",
      values: [false, true, false],
    },
    {
      label: "Multi-company management",
      values: [false, false, true],
    },
    {
      label: "Storage upgrades",
      values: [true, true, true],
    },
  ] as const;

  function scrollToPricing() {
    pricingSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="mt-10 space-y-8">
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
              onPrimary={scrollToPricing}
              onBack={() => undefined}
            />
          </div>
        </div>
      </section>

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

        <div className="space-y-6 p-4 sm:p-6 lg:hidden">
          <div className="rounded-3xl border border-darknavy/10 bg-linear-to-br from-offwhite to-white p-6">
            <p className="text-sm font-semibold text-darknavy">
              Need help choosing?
            </p>
            <p className="mt-3 text-sm leading-6 text-darknavy/60">
              Start with your free trial now and pick the plan that best matches
              your current workflow and reporting needs.
            </p>
            <button
              type="button"
              onClick={scrollToPricing}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-skyblue transition hover:text-darknavy"
            >
              Review plans
              <MoveRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {PricingPlans.map((plan, planIndex) => {
              const isHighlighted = plan.highlighted;
              const price =
                billingCycle === "monthly"
                  ? plan.monthlyPrice
                  : plan.yearlyPrice;
              const compareAtPrice =
                billingCycle === "monthly"
                  ? plan.monthlyCompareAtPrice
                  : plan.yearlyCompareAtPrice;
              const billingLabel = plan.billingLabel[billingCycle];

              return (
                <article
                  key={plan.name}
                  className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm ${
                    isHighlighted
                      ? "border-skyblue/40 bg-[linear-gradient(180deg,rgba(209,246,235,0.95),rgba(255,255,255,1))]"
                      : "border-darknavy/10 bg-white"
                  }`}
                >
                  {isHighlighted ? (
                    <div className="-mx-6 -mt-6 mb-6 flex items-stretch border-b border-skyblue/25 bg-[linear-gradient(180deg,rgba(209,246,235,0.92),rgba(209,246,235,0.68))]">
                      <div className="flex min-h-16 flex-1 items-center justify-center px-4 py-4">
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-darknavy/55">
                          Most Popular
                        </p>
                      </div>
                      <div className="flex w-16 shrink-0 flex-col items-center justify-center bg-citron px-2 text-[11px] font-bold uppercase leading-tight tracking-[0.14em] text-darknavy">
                        <span>20%</span>
                        <span>Off</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 h-10" />
                  )}

                  <div className="mt-4">
                    <h4 className="text-2xl font-semibold text-darknavy">
                      {plan.name}
                    </h4>
                    <div className="mt-4">
                      {compareAtPrice ? (
                        <p className="text-sm text-darknavy/35 line-through">
                          {compareAtPrice}
                        </p>
                      ) : null}
                      <div className="mt-1 flex items-end gap-1 whitespace-nowrap">
                        <p className="text-4xl font-semibold tracking-tight text-darknavy">
                          {price}
                        </p>
                        <span className="pb-1 text-sm font-medium text-darknavy/65">
                          {billingCycle === "monthly" ? "/month" : "/year"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-darknavy/60">
                        {billingLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 rounded-2xl bg-offwhite/60 p-4">
                    {comparisonRows.map((row) => {
                      const value = row.values[planIndex];

                      return (
                        <div
                          key={`${plan.name}-${row.label}`}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <span className="text-darknavy/60">{row.label}</span>
                          <span className="text-right font-medium text-darknavy">
                            {typeof value === "boolean" ? (
                              value ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-skyblue/35 bg-skyblue/10 text-skyblue">
                                  <Check className="h-4 w-4" />
                                </span>
                              ) : (
                                <span className="text-darknavy/30">-</span>
                              )
                            ) : (
                              value
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection(plan, billingCycle)}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold transition ${
                      isHighlighted
                        ? "border-darknavy bg-darknavy text-offwhite hover:bg-coralpink hover:border-coralpink"
                        : "border-skyblue/40 bg-white text-darknavy hover:border-darknavy hover:bg-offwhite"
                    }`}
                  >
                    Choose plan
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] border-b border-darknavy/10">
              <div className="border-r border-darknavy/10 bg-linear-to-br from-offwhite to-white p-6 sm:p-8">
                <div className="max-w-xs">
                  <p className="text-sm font-semibold text-darknavy">
                    Need help choosing?
                  </p>
                  <p className="mt-3 text-sm leading-6 text-darknavy/60">
                    Start with your free trial now and pick the plan that best
                    matches your current workflow and reporting needs.
                  </p>
                  <button
                    type="button"
                    onClick={scrollToPricing}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-skyblue transition hover:text-darknavy"
                  >
                    Review plans
                    <MoveRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {PricingPlans.map((plan) => {
                const isHighlighted = plan.highlighted;
                const price =
                  billingCycle === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice;
                const compareAtPrice =
                  billingCycle === "monthly"
                    ? plan.monthlyCompareAtPrice
                    : plan.yearlyCompareAtPrice;
                const billingLabel = plan.billingLabel[billingCycle];

                return (
                  <div
                    key={plan.name}
                    className={`relative flex h-full flex-col border-r border-darknavy/10 px-6 pb-8 pt-7 text-center last:border-r-0 sm:px-8 ${
                      isHighlighted
                        ? "bg-[linear-gradient(180deg,rgba(209,246,235,0.95),rgba(255,255,255,1))] shadow-[inset_0_0_0_1px_rgba(87,196,229,0.45)]"
                        : "bg-white"
                    }`}
                  >
                    <div className="relative flex min-h-[72px] items-start justify-center">
                      {isHighlighted ? (
                        <div className="absolute inset-x-[-1.5rem] top-[-1.75rem] flex items-stretch border-b border-skyblue/25 bg-[linear-gradient(180deg,rgba(209,246,235,0.92),rgba(209,246,235,0.68))] sm:inset-x-[-2rem]">
                          <div className="flex min-h-[72px] flex-1 items-center justify-center px-4 py-4">
                            <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-darknavy/55">
                              Most Popular
                            </p>
                          </div>
                          <div className="flex w-16 shrink-0 flex-col items-center justify-center bg-citron px-2 text-[11px] font-bold uppercase leading-tight tracking-[0.14em] text-darknavy">
                            <span>20%</span>
                            <span>Off</span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 flex min-h-50 flex-col justify-start">
                      <h4 className="text-2xl font-semibold text-darknavy">
                        {plan.name}
                      </h4>
                      <div className="mt-4 space-y-1">
                        {compareAtPrice ? (
                          <p className="text-sm text-darknavy/35 line-through">
                            {compareAtPrice}
                          </p>
                        ) : null}
                        <div className="flex items-end justify-center gap-1 whitespace-nowrap">
                          <p className="text-3xl font-semibold tracking-tight text-darknavy">
                            {price}
                          </p>
                          <span className="pb-1 text-sm font-medium text-darknavy/65">
                            {billingCycle === "monthly" ? "/month" : "/year"}
                          </span>
                        </div>
                        <p className="text-sm text-darknavy/60">
                          {billingLabel}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlanSelection(plan, billingCycle)}
                      className={`mt-auto inline-flex min-w-33 items-center justify-center self-center rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                        isHighlighted
                          ? "border-darknavy bg-darknavy text-offwhite hover:bg-coralpink hover:border-coralpink"
                          : "border-skyblue/40 bg-white text-darknavy hover:border-darknavy hover:bg-offwhite"
                      }`}
                    >
                      Choose plan
                    </button>
                  </div>
                );
              })}
            </div>

            {comparisonRows.map((row, rowIndex) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] ${
                  rowIndex !== comparisonRows.length - 1
                    ? "border-b border-darknavy/10"
                    : ""
                }`}
              >
                <div className="border-r border-darknavy/10 bg-offwhite/45 px-6 py-5 text-sm font-medium text-darknavy sm:px-8">
                  {row.label}
                </div>

                {row.values.map((value, valueIndex) => (
                  <div
                    key={`${row.label}-${PricingPlans[valueIndex]?.name}`}
                    className={`flex items-center justify-center border-r border-darknavy/10 px-6 py-5 text-center text-sm text-darknavy/75 last:border-r-0 ${
                      PricingPlans[valueIndex]?.highlighted
                        ? "bg-[#f5fffb]"
                        : "bg-white"
                    }`}
                  >
                    {typeof value === "boolean" ? (
                      value ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-skyblue/35 bg-skyblue/10 text-skyblue">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="text-base font-semibold text-darknavy/30">
                          -
                        </span>
                      )
                    ) : (
                      value
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
