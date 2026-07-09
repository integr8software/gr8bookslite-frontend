"use client";

import type { HTMLAttributes } from "react";
import { AlertCircle, CreditCard, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useBillingSubscriptionManager } from "@/app/src/hooks/billing/useBillingSubscriptionManager";
import { BillingMethodSelector } from "@/app/src/ui/billing/BillingMethodSelector";
import {
  FormatBillingDate,
  FormatBillingPrice,
  GetBillingCycleLabel,
  GetPlanPriceForCycle,
  GetStatusTone,
} from "@/app/src/data/billing/BillingUtils";

export function BillingPage() {
  const {
    accessToken,
    plans,
    selectedPlanCode,
    selectedBillingCycle,
    selectedBillingMode,
    paymentValues,
    paymentErrors,
    currentSubscription,
    isPlansLoading,
    isSubscriptionLoading,
    isSubmitting,
    isCancelling,
    hasBlockingSubscription,
    setSelectedPlanCode,
    setSelectedBillingCycle,
    setSelectedBillingMode,
    updatePaymentValue,
    retryQueries,
    startSubscriptionSetup,
    startManualCheckout,
    cancelSubscriptionNow,
  } = useBillingSubscriptionManager();

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-5xl rounded-3xl border border-coralpink/30 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-darknavy">Billing</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/65">
          Sign in again to load your company billing workspace. Billing actions stay protected on the backend and only use your authenticated company context.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-darknavy/10 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-darknavy via-darknavy to-skyblue/80 px-6 py-8 text-offwhite sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-offwhite/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-offwhite/90">
                <ShieldCheck className="h-4 w-4" />
                Company Billing
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Manage PayMongo subscriptions with backend-controlled access
              </h1>
              <p className="mt-3 text-sm leading-6 text-offwhite/80 sm:text-base">
                Plans, payment setup, and subscription status are synced from the backend. PayMongo webhooks remain the source of truth for recurring billing updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void retryQueries()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-offwhite/20 bg-offwhite/10 px-4 text-sm font-semibold text-offwhite transition hover:bg-offwhite/15"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh status
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-darknavy">
                  Current subscription
                </h2>
                <p className="mt-2 text-sm leading-6 text-darknavy/60">
                  Your company access should always follow this local subscription state, not the frontend alone.
                </p>
              </div>
              {isSubscriptionLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-darknavy/45" />
              ) : null}
            </div>

            {currentSubscription ? (
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-semibold text-darknavy">
                    {currentSubscription.plan.name}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${GetStatusTone(
                      currentSubscription.status,
                    )}`}
                  >
                    {currentSubscription.status.replace(/_/g, " ")}
                  </span>
                </div>

                <dl className="grid gap-4 md:grid-cols-2">
                  <BillingMetric
                    label="Billing mode"
                    value="Auto renewal"
                  />
                  <BillingMetric
                    label="Billing cycle"
                    value={GetBillingCycleLabel(
                      currentSubscription.billingCycle === "YEARLY"
                        ? "yearly"
                        : "monthly",
                    )}
                  />
                  <BillingMetric
                    label="Next billing"
                    value={FormatBillingDate(currentSubscription.nextBillingAt)}
                  />
                  <BillingMetric
                    label="Trial ends"
                    value={FormatBillingDate(currentSubscription.trialEndsAt)}
                  />
                  <BillingMetric
                    label="Latest invoice"
                    value={
                      currentSubscription.providerReferences.latestInvoiceId ??
                      "Not available"
                    }
                  />
                </dl>

                {currentSubscription.failureMessage ? (
                  <div className="rounded-2xl border border-coralpink/30 bg-coralpink/10 p-4 text-sm text-darknavy">
                    <p className="font-semibold">Payment attention needed</p>
                    <p className="mt-1 leading-6 text-darknavy/75">
                      {currentSubscription.failureMessage}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => cancelSubscriptionNow(true)}
                    disabled={isCancelling}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-darknavy/12 px-4 text-sm font-semibold text-darknavy transition hover:border-coralpink/35 hover:bg-coralpink/8 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCancelling ? "Updating..." : "Cancel at period end"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelSubscriptionNow(false)}
                    disabled={isCancelling}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-coralpink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCancelling ? "Updating..." : "Cancel immediately"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-darknavy/15 bg-offwhite p-5 text-sm leading-6 text-darknavy/70">
                No company subscription is on record yet. Choose a plan below and complete the initial payment setup to begin.
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-darknavy">
                  Available plans
                </h2>
                <p className="mt-2 text-sm leading-6 text-darknavy/60">
                  These plans are loaded from the backend so the frontend stays aligned with your company entitlements.
                </p>
              </div>
              {isPlansLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-darknavy/45" />
              ) : null}
            </div>

            <div className="mt-6 inline-flex rounded-2xl border border-darknavy/12 bg-offwhite p-1">
              {(["monthly", "yearly"] as const).map((billingCycle) => {
                const isActive = selectedBillingCycle === billingCycle;

                return (
                  <button
                    key={billingCycle}
                    type="button"
                    onClick={() => setSelectedBillingCycle(billingCycle)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-darknavy text-offwhite shadow-sm"
                        : "text-darknavy/70 hover:bg-darknavy/5"
                    }`}
                  >
                    {GetBillingCycleLabel(billingCycle)}
                  </button>
                );
              })}
            </div>

            {paymentErrors.planCode?.length ? (
              <p className="mt-4 text-sm text-coralpink">
                {paymentErrors.planCode[0]}
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {plans.map((plan) => {
                const isSelected = selectedPlanCode === plan.code;
                const activePrice = GetPlanPriceForCycle(plan, selectedBillingCycle);
                const compareAtPrice = activePrice.compareAtInCents;

                return (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => setSelectedPlanCode(plan.code)}
                    className={`rounded-3xl border p-5 text-left shadow-sm transition ${
                      isSelected
                        ? "border-darknavy/55 bg-darknavy text-offwhite"
                        : "border-darknavy/12 bg-white text-darknavy hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{plan.name}</p>
                        <p
                          className={`mt-2 text-sm leading-6 ${
                            isSelected
                              ? "text-offwhite/78"
                              : "text-darknavy/62"
                          }`}
                        >
                          {plan.description || "Subscription plan for your company workspace."}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                          plan.trialDays > 0
                            ? isSelected
                              ? "bg-offwhite/16 text-offwhite"
                              : "bg-skyblue/14 text-darknavy"
                            : isSelected
                              ? "bg-offwhite/16 text-offwhite"
                              : "bg-darknavy/8 text-darknavy"
                        }`}
                      >
                        {plan.trialDays > 0
                          ? `${plan.trialDays} day trial`
                          : "No trial"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end gap-3">
                      <p className="text-3xl font-semibold tracking-tight">
                        {FormatBillingPrice(
                          activePrice.amountInCents,
                          plan.currency,
                        )}
                      </p>
                      <p
                        className={`pb-1 text-sm ${
                          isSelected ? "text-offwhite/72" : "text-darknavy/60"
                        }`}
                      >
                        per company / {selectedBillingCycle === "yearly" ? "year" : "month"}
                      </p>
                    </div>

                    {compareAtPrice ? (
                      <p
                        className={`mt-2 text-sm line-through ${
                          isSelected ? "text-offwhite/60" : "text-darknavy/45"
                        }`}
                      >
                        {FormatBillingPrice(compareAtPrice, plan.currency)}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        <article className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-darknavy text-offwhite">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-darknavy">
                Initial payment setup
              </h2>
                <p className="mt-1 text-sm leading-6 text-darknavy/60">
                Choose manual checkout without saving a payment method, or use the existing auto-renewal card setup.
              </p>
            </div>
          </div>

          {hasBlockingSubscription ? (
            <div className="mt-6 rounded-2xl border border-citron/40 bg-citron/18 p-4 text-sm leading-6 text-darknavy">
              An active or in-flight subscription already exists for this company. Cancel or settle it first before starting a new subscription flow.
            </div>
          ) : null}

          <div className="mt-6">
            <BillingMethodSelector
              disabled={isSubmitting || hasBlockingSubscription}
              mode={selectedBillingMode}
              onChange={setSelectedBillingMode}
            />
          </div>

          {selectedBillingMode === "AUTO" ? (
            <div className="mt-6 space-y-4">
              <BillingInput
                label="Cardholder name"
                value={paymentValues.cardholderName}
                onChange={(value) => updatePaymentValue("cardholderName", value)}
                error={paymentErrors.cardholderName?.[0]}
                placeholder="Juan Dela Cruz"
              />
              <BillingInput
                label="Billing email"
                value={paymentValues.billingEmail}
                onChange={(value) => updatePaymentValue("billingEmail", value)}
                error={paymentErrors.billingEmail?.[0]}
                placeholder="billing@company.com"
                type="email"
              />
              <BillingInput
                label="Contact number"
                value={paymentValues.contactNumber}
                onChange={(value) => updatePaymentValue("contactNumber", value)}
                error={paymentErrors.contactNumber?.[0]}
                placeholder="+63 917 000 0000"
              />
              <BillingInput
                label="Card number"
                value={paymentValues.cardNumber}
                onChange={(value) => updatePaymentValue("cardNumber", value)}
                error={paymentErrors.cardNumber?.[0]}
                placeholder="4343 4343 4343 4345"
                inputMode="numeric"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <BillingInput
                  label="Expiry month"
                  value={paymentValues.expiryMonth}
                  onChange={(value) => updatePaymentValue("expiryMonth", value)}
                  error={paymentErrors.expiryMonth?.[0]}
                  placeholder="MM"
                  inputMode="numeric"
                />
                <BillingInput
                  label="Expiry year"
                  value={paymentValues.expiryYear}
                  onChange={(value) => updatePaymentValue("expiryYear", value)}
                  error={paymentErrors.expiryYear?.[0]}
                  placeholder="YYYY"
                  inputMode="numeric"
                />
              </div>

              <BillingInput
                label="CVC"
                value={paymentValues.cvc}
                onChange={(value) => updatePaymentValue("cvc", value)}
                error={paymentErrors.cvc?.[0]}
                placeholder="123"
                inputMode="numeric"
              />

              <BillingTextArea
                label="Billing address"
                value={paymentValues.billingAddress}
                onChange={(value) => updatePaymentValue("billingAddress", value)}
                error={paymentErrors.billingAddress?.[0]}
                placeholder="Street address used for billing"
              />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-skyblue/20 bg-skyblue/8 p-4 text-sm leading-6 text-darknavy/70">
              Manual checkout is mocked in Phase 1. The future backend endpoint will create a PayMongo hosted checkout session and return the checkout URL.
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-darknavy/10 bg-offwhite p-4 text-sm leading-6 text-darknavy/70">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-coralpink" />
              <p>
                {selectedBillingMode === "AUTO"
                  ? "This frontend creates a PayMongo payment method with your public key, then hands the resulting payment method ID to the backend. Final subscription status still depends on PayMongo webhook confirmation."
                  : "Manual payment redirects to hosted checkout and stores no payment method. Final activation will depend on webhook confirmation once Phase 2 backend support exists."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              selectedBillingMode === "AUTO"
                ? startSubscriptionSetup
                : startManualCheckout
            }
            disabled={isSubmitting || hasBlockingSubscription}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-darknavy px-5 text-sm font-semibold text-offwhite transition hover:bg-coralpink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? selectedBillingMode === "AUTO"
                ? "Starting subscription..."
                : "Creating checkout..."
              : selectedBillingMode === "AUTO"
                ? "Create subscription and attach card"
                : "Continue to hosted checkout"}
          </button>
        </article>
      </section>
    </div>
  );
}

type BillingMetricProps = {
  label: string;
  value: string;
};

function BillingMetric({ label, value }: BillingMetricProps) {
  return (
    <div className="rounded-2xl border border-darknavy/10 bg-offwhite p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-darknavy/45">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-darknavy">{value}</dd>
    </div>
  );
}

type BillingInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
};

function BillingInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
}: BillingInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-darknavy">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`mt-2 min-h-12 w-full rounded-2xl border bg-white px-4 text-sm text-darknavy outline-none transition ${
          error
            ? "border-coralpink/45 focus:border-coralpink"
            : "border-darknavy/12 focus:border-skyblue"
        }`}
      />
      {error ? <p className="mt-2 text-xs text-coralpink">{error}</p> : null}
    </label>
  );
}

type BillingTextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

function BillingTextArea({
  label,
  value,
  onChange,
  error,
  placeholder,
}: BillingTextAreaProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-darknavy">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-darknavy outline-none transition ${
          error
            ? "border-coralpink/45 focus:border-coralpink"
            : "border-darknavy/12 focus:border-skyblue"
        }`}
      />
      {error ? <p className="mt-2 text-xs text-coralpink">{error}</p> : null}
    </label>
  );
}
