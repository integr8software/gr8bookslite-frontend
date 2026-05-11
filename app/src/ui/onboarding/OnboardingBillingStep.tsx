"use client";

import { useState } from "react";
import type {
  BillingCycle,
  PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import { OnboardingActionRow } from "./OnboardingActionRow";
import { OnboardingField } from "./OnboardingField";

type OnboardingBillingStepProps = {
  selectedPlan: PricingPlan | null;
  selectedBillingCycle: BillingCycle;
  handleBack: () => void;
  handleNext: () => void;
};

export function OnboardingBillingStep({
  selectedPlan,
  selectedBillingCycle,
  handleBack,
  handleNext,
}: OnboardingBillingStepProps) {
  const [cardholderName, setCardholderName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const selectedPrice = selectedPlan
    ? selectedBillingCycle === "monthly"
      ? selectedPlan.monthlyPrice
      : selectedPlan.yearlyPrice
    : null;

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-3xl border border-darknavy/10 bg-gradient-to-br from-offwhite via-white to-citron/10 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coralpink">
          Billing
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-darknavy">
          Add your billing details
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-darknavy/70 sm:text-base">
          Your free trial starts first. Billing details are used for the plan
          you selected and will only be charged after the trial ends.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <OnboardingField
              label="Cardholder Name"
              id="cardholderName"
              name="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
              errors={undefined}
            />
            <OnboardingField
              label="Billing Email"
              id="billingEmail"
              name="billingEmail"
              type="email"
              placeholder="billing@company.com"
              value={billingEmail}
              onChange={(event) => setBillingEmail(event.target.value)}
              errors={undefined}
            />
          </div>

          <OnboardingField
            label="Card Number"
            id="cardNumber"
            name="cardNumber"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            errors={undefined}
          />

          <div className="grid gap-6 md:grid-cols-3">
            <OnboardingField
              label="Expiry Month"
              id="expiryMonth"
              name="expiryMonth"
              type="text"
              placeholder="MM"
              value={expiryMonth}
              onChange={(event) => setExpiryMonth(event.target.value)}
              errors={undefined}
            />
            <OnboardingField
              label="Expiry Year"
              id="expiryYear"
              name="expiryYear"
              type="text"
              placeholder="YYYY"
              value={expiryYear}
              onChange={(event) => setExpiryYear(event.target.value)}
              errors={undefined}
            />
            <OnboardingField
              label="CVC"
              id="cvc"
              name="cvc"
              type="text"
              inputMode="numeric"
              placeholder="123"
              value={cvc}
              onChange={(event) => setCvc(event.target.value)}
              errors={undefined}
            />
          </div>

          <OnboardingField
            label="Billing Address"
            id="billingAddress"
            name="billingAddress"
            type="text"
            placeholder="123 Main St, City, Province"
            value={billingAddress}
            onChange={(event) => setBillingAddress(event.target.value)}
            errors={undefined}
          />

          <OnboardingActionRow
            showBack
            primaryLabel="Continue"
            onPrimary={handleNext}
            onBack={handleBack}
          />
        </div>

        <aside className="rounded-3xl border border-darknavy/10 bg-darknavy p-6 text-offwhite shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-citron">
            Selected Plan
          </p>
          <h3 className="mt-4 text-2xl font-semibold">
            {selectedPlan?.name ?? "No plan selected yet"}
          </h3>
          <p className="mt-2 text-sm text-offwhite/75">
            {selectedBillingCycle === "yearly" ? "Yearly billing" : "Monthly billing"}
          </p>
          <p className="mt-8 text-4xl font-semibold tracking-tight">
            {selectedPrice ?? "Choose a plan first"}
          </p>
          <p className="mt-3 text-sm leading-6 text-offwhite/75">
            You can review pricing again by going back to the previous step.
          </p>
        </aside>
      </section>
    </div>
  );
}
