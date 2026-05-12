"use client";

import { Check, LoaderCircle, MoveRight } from "lucide-react";
import {
  PricingPlans,
  type BillingCycle,
  type PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import { OnboardingPlanComparisonRows } from "@/app/src/data/onboarding/OnboardingData";

type OnboardingPricingDesktopPlansProps = {
  billingCycle: BillingCycle;
  isSubmitting: boolean;
  submittingPlanCode: string | null;
  onReviewPlans: () => void;
  onSelectPlan: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function OnboardingPricingDesktopPlans({
  billingCycle,
  isSubmitting,
  submittingPlanCode,
  onReviewPlans,
  onSelectPlan,
}: OnboardingPricingDesktopPlansProps) {
  const visiblePlans = PricingPlans.filter(
    (plan) => plan.name !== "Additional Company",
  );

  return (
    <div className="hidden overflow-x-auto lg:block">
      <div className="min-w-245">
        <div className="grid grid-cols-[1.2fr_repeat(2,minmax(0,1fr))] border-b border-darknavy/10">
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
                onClick={onReviewPlans}
                disabled={isSubmitting}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-skyblue transition hover:text-darknavy"
              >
                Review plans
                <MoveRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {visiblePlans.map((plan) => {
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
              <div
                key={plan.name}
                className={`relative flex h-full flex-col border-r border-darknavy/10 px-6 pb-8 pt-7 text-center last:border-r-0 sm:px-8 ${
                  isHighlighted
                    ? "bg-[linear-gradient(180deg,rgba(209,246,235,0.95),rgba(255,255,255,1))] shadow-[inset_0_0_0_1px_rgba(87,196,229,0.45)]"
                    : "bg-white"
                }`}
              >
                <div className="relative flex min-h-18 items-start justify-center">
                  {isHighlighted ? (
                    <div className="absolute -inset-x-6 -top-7 flex items-stretch border-b border-skyblue/25 bg-[linear-gradient(180deg,rgba(209,246,235,0.92),rgba(209,246,235,0.68))] sm:-inset-x-8">
                      <div className="flex min-h-18 flex-1 items-center justify-center px-4 py-4">
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
                    <p className="text-sm text-darknavy/60">{billingLabel}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan, billingCycle)}
                  disabled={isSubmitting}
                  className={`mt-auto inline-flex min-w-33 items-center justify-center gap-2 self-center rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
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
              </div>
            );
          })}
        </div>

        {OnboardingPlanComparisonRows.map((row, rowIndex) => (
          <div
            key={row.label}
            className={`grid grid-cols-[1.2fr_repeat(2,minmax(0,1fr))] ${
              rowIndex !== OnboardingPlanComparisonRows.length - 1
                ? "border-b border-darknavy/10"
                : ""
            }`}
          >
            <div className="border-r border-darknavy/10 bg-offwhite/45 px-6 py-5 text-sm font-medium text-darknavy sm:px-8">
              {row.label}
            </div>

            {row.values
              .slice(0, visiblePlans.length)
              .map((value, valueIndex) => (
                <div
                  key={`${row.label}-${visiblePlans[valueIndex]?.name}`}
                  className={`flex items-center justify-center border-r border-darknavy/10 px-6 py-5 text-center text-sm text-darknavy/75 last:border-r-0 ${
                    visiblePlans[valueIndex]?.highlighted
                      ? "bg-[#f5fffb]"
                      : "bg-white"
                  }`}
                >
                  {typeof value === "boolean" ? (
                    value ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center text-green-700">
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
  );
}
