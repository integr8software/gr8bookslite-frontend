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
    plans,
    isSubmitting,
    submittingPlanCode,
    furthestStepIndex,
    isDraftLoading,
    updateValue,
    setTaxpayerType,
    handleLogoChange,
    handleLogoRemove,
    navigateToStep,
    handlePlanSelection,
    handleNext,
    handleBack,
  } = useOnboardingFlow();

  if (isDraftLoading) {
    return <OnboardingDraftLoadingScreen isFullScreen />;
  }

  return (
    <div className="space-y-8">
      <OnboardingProgressHeader
        currentStep={currentStep.currentStep}
        totalSteps={currentStep.totalSteps}
        progressPercent={currentStep.progressPercent}
        title={currentStep.title}
        description={currentStep.description}
        furthestStep={furthestStepIndex + 1}
        onStepSelect={(step) => navigateToStep(step - 1)}
      />

      <div className="min-w-0">
        {currentStep.currentStep === OnboardingSteps[0].currentStep ? (
          <OnboardingFreeTrialStep
            plans={plans}
            handlePlanSelection={handlePlanSelection}
            isSubmitting={isSubmitting}
            submittingPlanCode={submittingPlanCode}
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

        {currentStep.currentStep === OnboardingSteps[1].currentStep ||
        currentStep.currentStep === OnboardingSteps[3].currentStep ? (
          <section className="rounded-2xl border border-darknavy/10 bg-white p-5 shadow-[0_20px_60px_rgba(33,39,56,0.09)] sm:p-8 lg:p-10">
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

            {currentStep.currentStep === OnboardingSteps[3].currentStep ? (
              <OnboardingReviewStep
                values={values}
                logoPreviewUrl={logoPreviewUrl}
                isSubmitting={isSubmitting}
                handleBack={handleBack}
                handleFinish={handleNext}
              />
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
