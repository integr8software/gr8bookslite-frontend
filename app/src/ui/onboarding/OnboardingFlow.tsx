"use client";

import { OnboardingSteps } from "@/app/src/data/onboarding/OnboardingData";
import { useOnboardingFlow } from "@/app/src/hooks/onboarding/useOnboardingFlow";
import { OnboardingBillingStep } from "./OnboardingBillingStep";
import { OnboardingFreeTrialStep } from "./OnboardingFreeTrialStep";
import { OnboardingProgressHeader } from "./OnboardingProgressHeader";
import { OnboardingReviewStep } from "./OnboardingReviewStep";
import { OnboardingStepOne } from "./OnboardingStepOne";

export function OnboardingFlow() {
  const {
    currentStep,
    values,
    errors,
    logoInputKey,
    logoPreviewUrl,
    selectedPlan,
    selectedBillingCycle,
    updateValue,
    setTaxpayerType,
    handleLogoChange,
    handleLogoRemove,
    handlePlanSelection,
    handleNext,
    handleBack,
  } = useOnboardingFlow();

  return (
    <>
      <OnboardingProgressHeader
        currentStep={currentStep.currentStep}
        totalSteps={currentStep.totalSteps}
        progressPercent={currentStep.progressPercent}
        title={currentStep.title}
        description={currentStep.description}
      />

      {currentStep.currentStep === OnboardingSteps[0].currentStep ? (
        <OnboardingFreeTrialStep handlePlanSelection={handlePlanSelection} />
      ) : null}

      {currentStep.currentStep === OnboardingSteps[1].currentStep ? (
        <OnboardingBillingStep
          values={values}
          errors={errors}
          selectedPlan={selectedPlan}
          selectedBillingCycle={selectedBillingCycle}
          updateValue={updateValue}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ) : null}

      {currentStep.currentStep === OnboardingSteps[2].currentStep ? (
        <OnboardingStepOne
          values={values}
          errors={errors}
          logoInputKey={logoInputKey}
          logoPreviewUrl={logoPreviewUrl}
          updateValue={updateValue}
          setTaxpayerType={setTaxpayerType}
          handleLogoChange={handleLogoChange}
          handleLogoRemove={handleLogoRemove}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ) : null}

      {currentStep.currentStep === OnboardingSteps[3].currentStep ? (
        <OnboardingReviewStep
          values={values}
          logoPreviewUrl={logoPreviewUrl}
          handleBack={handleBack}
          handleFinish={handleNext}
        />
      ) : null}
    </>
  );
}
