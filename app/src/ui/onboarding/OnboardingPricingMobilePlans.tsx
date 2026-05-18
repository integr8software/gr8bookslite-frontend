"use client";

import { Check, LoaderCircle, MoveRight } from "lucide-react";
import {
  PricingPlans,
  type BillingCycle,
  type PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import { OnboardingPlanComparisonRows } from "@/app/src/data/onboarding/OnboardingData";

type OnboardingPricingMobilePlansProps = {
  billingCycle: BillingCycle;
  isSubmitting: boolean;
  submittingPlanCode: string | null;
  onReviewPlans: () => void;
  onSelectPlan: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function OnboardingPricingMobilePlans({
  billingCycle,
  isSubmitting,
  submittingPlanCode,
  onReviewPlans,
  onSelectPlan,
}: OnboardingPricingMobilePlansProps) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:hidden">
      <div className="rounded-3xl border border-darknavy/10 bg-linear-to-br from-offwhite to-white p-6 text-center">
        <p className="text-sm font-semibold text-darknavy">
          Need help choosing?
        </p>
        <p className="mt-3 text-sm leading-6 text-darknavy/60">
          Start with a 15-days free trial now and pick the plan that best
          matches your current workflow and reporting needs.
        </p>
        <button
          type="button"
          onClick={onReviewPlans}
          disabled={isSubmitting}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-skyblue transition hover:text-darknavy"
        >
          Review plans
          <MoveRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {PricingPlans.filter((plan) => plan.name !== "Additional Company").map(
          (plan, planIndex) => {
            const isHighlighted = plan.highlighted;
            const price =
              billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const compareAtPrice =
              billingCycle === "monthly"
                ? plan.monthlyCompareAtPrice
                : plan.yearlyCompareAtPrice;
            const billingLabel = plan.billingLabel[billingCycle];
            const isSubmittingThisPlan =
              isSubmitting && submittingPlanCode === plan.code;

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

                <div className="mt-4 text-center">
                  <h4 className="text-2xl font-semibold text-darknavy">
                    {plan.name}
                  </h4>
                  <div className="mt-4">
                    {compareAtPrice ? (
                      <p className="text-sm text-darknavy/35 line-through">
                        {compareAtPrice}
                      </p>
                    ) : null}
                    <div className="mt-1 flex items-end justify-center gap-1 whitespace-nowrap">
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

                <div className="mt-6 space-y-3 rounded-2xl bg-offwhite/60 p-4 text-center">
                  {OnboardingPlanComparisonRows.map((row) => {
                    const value = row.values[planIndex];

                    return (
                      <div
                        key={`${plan.name}-${row.label}`}
                        className="flex flex-col items-center gap-2 text-sm"
                      >
                        <span className="text-darknavy/60">{row.label}</span>
                        <span className="font-medium text-darknavy">
                          {typeof value === "boolean" ? (
                            value ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center text-green-700">
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
                  onClick={() => onSelectPlan(plan, billingCycle)}
                  disabled={isSubmitting}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition ${
                    isHighlighted
                      ? "border-darknavy bg-darknavy text-offwhite hover:bg-coralpink hover:border-coralpink"
                      : "border-skyblue/40 bg-white text-darknavy hover:border-darknavy hover:bg-offwhite"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Choose plan
                  {isSubmittingThisPlan ? (
                    <LoaderCircle
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </article>
            );
          },
        )}
      </div>
    </div>
  );
}
