"use client";

import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import type { BillingCycle, PricingPlan } from "@/app/src/data/pricing/PricingData";

type OnboardingBillingSummaryCardProps = {
  selectedPlan: PricingPlan | null;
  selectedBillingCycle: BillingCycle;
};

export function OnboardingBillingSummaryCard({
  selectedPlan,
  selectedBillingCycle,
}: OnboardingBillingSummaryCardProps) {
  const selectedPrice = selectedPlan
    ? selectedBillingCycle === "monthly"
      ? selectedPlan.monthlyPrice
      : selectedPlan.yearlyPrice
    : null;
  const billingLabel =
    selectedBillingCycle === "yearly" ? "Yearly billing" : "Monthly billing";
  const cadenceLabel =
    selectedBillingCycle === "yearly"
      ? "Charged once a year"
      : "Charged every month";
  const renewalLabel =
    selectedBillingCycle === "yearly"
      ? "Renews yearly after your free trial ends."
      : "Renews monthly after your free trial ends.";

  return (
    <aside className="relative overflow-hidden rounded-3xl border border-darknavy/10 bg-darknavy p-6 text-offwhite shadow-[0_24px_70px_rgba(33,39,56,0.22)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(87,196,229,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(209,214,70,0.14),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-citron">
              Selected Plan
            </p>
            <h3 className="mt-4 text-2xl font-semibold">
              {selectedPlan?.name ?? "No plan selected yet"}
            </h3>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_18px_35px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <Sparkles className="h-5 w-5 text-citron" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-medium text-offwhite/88 backdrop-blur-md">
            <CalendarDays className="mr-2 h-4 w-4 text-skyblue" />
            {billingLabel}
          </div>
          <div className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-medium text-offwhite/88 backdrop-blur-md">
            <ShieldCheck className="mr-2 h-4 w-4 text-citron" />
            Secure checkout
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-offwhite/55">
            Billing Summary
          </p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="whitespace-nowrap text-[2.4rem] leading-none font-semibold tracking-tight sm:text-4xl">
                {selectedPrice ?? "Choose a plan first"}
              </p>
              <p className="mt-2 text-sm text-offwhite/70">
                {cadenceLabel}
              </p>
            </div>
            <div className="inline-flex self-start rounded-2xl bg-coralpink px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.18em] text-offwhite shadow-[0_14px_30px_rgba(249,112,104,0.3)] sm:self-auto">
              Free Trial
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
            <span className="text-offwhite/62">Plan</span>
            <span className="font-medium text-offwhite">
              {selectedPlan?.name ?? "Pending selection"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm">
            <span className="text-offwhite/62">Billing cycle</span>
            <span className="font-medium text-offwhite">{billingLabel}</span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="text-offwhite/62">What happens next</span>
            <span className="max-w-48 text-right leading-6 text-offwhite/82">
              {renewalLabel}
            </span>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-offwhite/75">
          You can review pricing again by going back to the previous step.
        </p>
      </div>
    </aside>
  );
}
