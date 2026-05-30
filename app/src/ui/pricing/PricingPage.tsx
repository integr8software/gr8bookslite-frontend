"use client";

import Link from "next/link";
import { ArrowRight, Building2, Check, PackageCheck, ReceiptText } from "lucide-react";
import { useState } from "react";
import {
  BillingOptions,
  PricingHeader,
  PricingPlans,
  type BillingCycle,
  type PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

type PricingPageProps = {
  onGetStarted?: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="text-xl font-semibold">
          <LogoText brandSuffixClassName="text-sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-sky-700">
            Simple pricing
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Pick the package that matches your operations.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            {PricingHeader.description}
          </p>
        </div>

        <div className="mt-8 inline-grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-1">
          {BillingOptions.map((option) => {
            const isActive = billingCycle === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setBillingCycle(option.value)}
                aria-pressed={isActive}
                className={`min-h-11 rounded-md px-6 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              billingCycle={billingCycle}
              onGetStarted={onGetStarted}
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
}: {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  onGetStarted?: (plan: PricingPlan, billingCycle: BillingCycle) => void;
}) {
  const price =
    billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const compareAtPrice =
    billingCycle === "monthly"
      ? plan.monthlyCompareAtPrice
      : plan.yearlyCompareAtPrice;
  const billingLabel = plan.billingLabel[billingCycle];
  const Icon =
    plan.code === "ACCOUNTING"
      ? ReceiptText
      : plan.code === "ACCOUNTING_INVENTORY"
        ? PackageCheck
        : Building2;

  return (
    <article
      className={`flex h-full flex-col rounded-lg border bg-white p-6 transition hover:border-sky-200 ${
        plan.highlighted
          ? "border-sky-300 shadow-[0_20px_60px_rgba(14,165,233,0.14)]"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {plan.highlighted ? (
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase text-sky-800">
            Recommended
          </span>
        ) : null}
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-slate-950">
        {plan.name}
      </h2>
      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <p className="text-4xl font-semibold tracking-normal text-slate-950">
          {price}
        </p>
        {compareAtPrice ? (
          <p className="text-sm text-slate-400 line-through">{compareAtPrice}</p>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-slate-600">{billingLabel}</p>

      <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      {onGetStarted ? (
        <button
          type="button"
          onClick={() => onGetStarted(plan, billingCycle)}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
        >
          {plan.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <Link
          href={plan.ctaHref}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
        >
          {plan.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
