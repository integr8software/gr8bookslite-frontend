"use client";

import { OnboardingSteps } from "@/app/src/data/onboarding/OnboardingData";
import { useOnboardingFlow } from "@/app/src/hooks/onboarding/useOnboardingFlow";
import { OnboardingBillingStep } from "@/app/src/ui/onboarding/OnboardingBillingStep";
import { OnboardingFreeTrialStep } from "@/app/src/ui/onboarding/OnboardingFreeTrialStep";
import { OnboardingProgressHeader } from "@/app/src/ui/onboarding/OnboardingProgressHeader";
import { OnboardingReviewStep } from "@/app/src/ui/onboarding/OnboardingReviewStep";
import { OnboardingStepOne } from "@/app/src/ui/onboarding/OnboardingStepOne";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";

export function OnboardingFlow() {
  const {
    currentStep,
    values,
    errors,
    logoInputKey,
    logoPreviewUrl,
    selectedPlan,
    selectedBillingCycle,
    isSubmitting,
    submittingPlanCode,
    isDraftLoading,
    updateValue,
    setTaxpayerType,
    handleLogoChange,
    handleLogoRemove,
    handlePlanSelection,
    handleNext,
    handleBack,
  } = useOnboardingFlow();

  if (isDraftLoading) {
    return <OnboardingDraftLoadingScreen isFullScreen />;
  }

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
        <OnboardingFreeTrialStep
          handlePlanSelection={handlePlanSelection}
          isSubmitting={isSubmitting}
          submittingPlanCode={submittingPlanCode}
        />
      ) : null}

      {currentStep.currentStep === OnboardingSteps[1].currentStep ? (
        <OnboardingStepOne
          values={values}
          errors={errors}
          logoInputKey={logoInputKey}
          logoPreviewUrl={logoPreviewUrl}
          isSubmitting={isSubmitting}
          updateValue={updateValue}
          setTaxpayerType={setTaxpayerType}
          handleLogoChange={handleLogoChange}
          handleLogoRemove={handleLogoRemove}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ) : null}

      {currentStep.currentStep === OnboardingSteps[2].currentStep ? (
        <OnboardingBillingStep
          values={values}
          errors={errors}
          selectedPlan={selectedPlan}
          selectedBillingCycle={selectedBillingCycle}
          isSubmitting={isSubmitting}
          updateValue={updateValue}
          handleBack={handleBack}
          handleNext={handleNext}
        />
      ) : null}

      {currentStep.currentStep === OnboardingSteps[3].currentStep ? (
        <OnboardingReviewStep
          values={values}
          logoPreviewUrl={logoPreviewUrl}
          isSubmitting={isSubmitting}
          handleBack={handleBack}
          handleFinish={handleNext}
        />
      ) : null}
    </>
  );
}
