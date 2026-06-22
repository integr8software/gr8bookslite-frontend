"use client";

import type {
  OnboardingBillingStepProps,
} from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "@/app/src/ui/onboarding/OnboardingActionRow";
import { OnboardingBillingSummaryCard } from "@/app/src/ui/onboarding/OnboardingBillingSummaryCard";
import { OnboardingCardBrand } from "@/app/src/ui/onboarding/OnboardingCardBrand";
import { OnboardingField } from "@/app/src/ui/onboarding/OnboardingField";

export function OnboardingBillingStep({
  values,
  errors,
  selectedPlan,
  selectedBillingCycle,
  isSubmitting,
  updateValue,
  handleBack,
  handleNext,
}: OnboardingBillingStepProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <OnboardingField
              label="Cardholder Name"
              id="cardholderName"
              name="cardholderName"
              type="text"
              placeholder="John Doe"
              value={values.cardholderName}
              onChange={(event) =>
                updateValue("cardholderName", event.target.value)
              }
              errors={errors.cardholderName}
            />
            <OnboardingField
              label="Billing Email"
              id="billingEmail"
              name="billingEmail"
              type="email"
              placeholder="billing@company.com"
              value={values.billingEmail}
              onChange={(event) =>
                updateValue("billingEmail", event.target.value)
              }
              errors={errors.billingEmail}
            />
          </div>

          <OnboardingField
            label="Card Number"
            id="cardNumber"
            name="cardNumber"
            type="text"
            inputMode="numeric"
            maxLength={23}
            placeholder="1234 5678 9012 3456"
            value={values.cardNumber}
            onChange={(event) => updateValue("cardNumber", event.target.value)}
            errors={errors.cardNumber}
            endAdornment={<OnboardingCardBrand value={values.cardNumber} />}
          />

          <div className="grid gap-5 md:grid-cols-3">
            <OnboardingField
              label="Expiry Month"
              id="expiryMonth"
              name="expiryMonth"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="MM"
              value={values.expiryMonth}
              onChange={(event) =>
                updateValue("expiryMonth", event.target.value)
              }
              errors={errors.expiryMonth}
            />
            <OnboardingField
              label="Expiry Year"
              id="expiryYear"
              name="expiryYear"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY"
              value={values.expiryYear}
              onChange={(event) =>
                updateValue("expiryYear", event.target.value)
              }
              errors={errors.expiryYear}
            />
            <OnboardingField
              label="CVC"
              id="cvc"
              name="cvc"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="123"
              value={values.cvc}
              onChange={(event) => updateValue("cvc", event.target.value)}
              errors={errors.cvc}
            />
          </div>

          <OnboardingField
            label="Billing Address"
            id="billingAddress"
            name="billingAddress"
            type="text"
            placeholder="123 Main St, City, Province"
            value={values.billingAddress}
            onChange={(event) =>
              updateValue("billingAddress", event.target.value)
            }
            errors={errors.billingAddress}
          />

          <OnboardingActionRow
            showBack
            primaryLabel="Continue"
            isPending={isSubmitting}
            onPrimary={handleNext}
            onBack={handleBack}
          />
        </div>

        <OnboardingBillingSummaryCard
          selectedPlan={selectedPlan}
          selectedBillingCycle={selectedBillingCycle}
        />

    </div>
  );
}
