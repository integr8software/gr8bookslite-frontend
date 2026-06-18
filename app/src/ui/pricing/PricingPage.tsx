"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-offwhite text-darknavy">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_78%_18%,rgba(87,196,229,0.20),transparent_30%),radial-gradient(circle_at_14%_4%,rgba(209,214,70,0.12),transparent_24%)]" />

      <header className="relative z-10 border-b border-darknavy/10 bg-offwhite/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="text-xl font-semibold">
            <LogoText brandSuffixClassName="text-sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-darknavy/70 transition hover:bg-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-darknavy px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-[1] mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-skyblue/30 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Simple, transparent pricing
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-darknavy sm:text-6xl lg:text-7xl">
            One platform. The right plan for your business.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-darknavy/65 sm:text-lg">
            {PricingHeader.description} Start with what you need today and scale
            without switching systems.
          </p>
        </div>

        <div className="mx-auto mt-9 flex w-fit items-center gap-3 rounded-xl border border-darknavy/10 bg-white/80 p-1.5 shadow-[0_12px_40px_rgba(33,39,56,0.08)] backdrop-blur">
          {BillingOptions.map((option) => {
            const isActive = billingCycle === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setBillingCycle(option.value)}
                aria-pressed={isActive}
                className={`min-h-10 rounded-lg px-5 text-sm font-semibold transition sm:px-7 ${
                  isActive
                    ? "bg-darknavy text-white shadow-sm"
                    : "text-darknavy/60 hover:bg-offwhite hover:text-darknavy"
                }`}
              >
                {option.label}
                {option.value === "yearly" ? (
                  <span
                    className={`ml-2 text-[10px] font-bold uppercase ${isActive ? "text-citron" : "text-sky-700"}`}
                  >
                    Save 2 months
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {PricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              billingCycle={billingCycle}
              onGetStarted={onGetStarted}
            />
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 border-t border-darknavy/10 pt-8 text-sm text-darknavy/65 sm:grid-cols-3">
          <TrustItem icon={CircleCheck} label="No setup fees" />
          <TrustItem icon={ShieldCheck} label="Secure cloud access" />
          <TrustItem icon={Sparkles} label="Easy to upgrade anytime" />
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
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${
        plan.highlighted
          ? "border-skyblue shadow-[0_24px_70px_rgba(87,196,229,0.22)]"
          : "border-darknavy/10 shadow-[0_14px_42px_rgba(33,39,56,0.06)] hover:border-skyblue/60 hover:shadow-[0_22px_58px_rgba(33,39,56,0.10)]"
      }`}
    >
      {plan.highlighted ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-skyblue" />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${plan.highlighted ? "bg-skyblue text-white" : "bg-skyblue/10 text-sky-700"}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
        </div>
        {plan.highlighted ? (
          <span className="rounded-full bg-skyblue/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-800">
            Most popular
          </span>
        ) : null}
      </div>

      <h2 className="mt-6 text-xl font-bold text-darknavy">
        {plan.name}
      </h2>
      <p className="mt-2 min-h-10 text-sm leading-5 text-darknavy/60">
        {plan.description ?? "Flexible tools designed to grow with your business."}
      </p>
      <div className="mt-6 flex flex-wrap items-baseline gap-2">
        <p className="text-3xl font-bold tracking-[-0.03em] text-darknavy sm:text-4xl">
          {price}
        </p>
        {compareAtPrice ? (
          <p className="text-xs text-darknavy/35 line-through">{compareAtPrice}</p>
        ) : null}
      </div>
      <p className="mt-2 text-xs font-medium text-darknavy/50">{billingLabel}</p>

      <div className="my-6 h-px bg-darknavy/10" />
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-darknavy/45">
        What&apos;s included
      </p>
      <ul className="mt-4 flex-1 space-y-3.5 text-sm text-darknavy/75">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-skyblue/15">
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
          onClick={() => onGetStarted(plan, billingCycle)}
          className={getCtaClasses(plan.highlighted)}
        >
          {plan.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <Link href={plan.ctaHref} className={getCtaClasses(plan.highlighted)}>
          {plan.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}

function getCtaClasses(highlighted?: boolean) {
  return `mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/30 ${
    highlighted
      ? "bg-skyblue text-darknavy shadow-[0_10px_28px_rgba(87,196,229,0.28)] hover:bg-citron"
      : "bg-darknavy text-white hover:bg-sky-700"
  }`;
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: typeof CircleCheck;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <Icon className="h-4 w-4 text-sky-700" aria-hidden="true" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}
