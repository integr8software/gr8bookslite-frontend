"use client";

import { OnboardingSteps } from "@/app/src/data/onboarding/OnboardingData";
import { useOnboardingFlow } from "@/app/src/hooks/onboarding/useOnboardingFlow";
import { OnboardingProgressHeader } from "./OnboardingProgressHeader";
import { OnboardingReviewStep } from "./OnboardingReviewStep";
import { OnboardingStepOne } from "./OnboardingStepOne";
import { OnboardingStepTwo } from "./OnboardingStepTwo";

export function OnboardingFlow() {
  const {
    currentStep,
    values,
    errors,
    attachmentInputKey,
    passwordStrength,
    updateValue,
    handleAttachmentChange,
    handleAttachmentRemove,
    handleNext,
    handleBack,
  } = useOnboardingFlow();

  return (
    <main className="min-h-screen bg-offwhite px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="mx-auto w-full max-w-[1120px] rounded-sm bg-white px-5 py-8 shadow-[0_18px_60px_rgba(33,39,56,0.12)] ring-1 ring-darknavy/10 sm:px-8 lg:px-14 lg:py-12">
        <OnboardingProgressHeader
          currentStep={currentStep.currentStep}
          totalSteps={currentStep.totalSteps}
          progressPercent={currentStep.progressPercent}
          title={currentStep.title}
          description={currentStep.description}
        />

        {currentStep.currentStep === OnboardingSteps[0].currentStep ? (
          <OnboardingStepOne
            values={values}
            errors={errors}
            attachmentInputKey={attachmentInputKey}
            updateValue={updateValue}
            handleAttachmentChange={handleAttachmentChange}
            handleAttachmentRemove={handleAttachmentRemove}
            handleNext={handleNext}
          />
        ) : null}

        {currentStep.currentStep === OnboardingSteps[1].currentStep ? (
          <OnboardingStepTwo
            values={values}
            errors={errors}
            passwordStrength={passwordStrength}
            updateValue={updateValue}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        ) : null}

        {currentStep.currentStep === OnboardingSteps[2].currentStep ? (
          <OnboardingReviewStep
            values={values}
            handleBack={handleBack}
            handleFinish={handleNext}
          />
        ) : null}
      </section>
    </main>
  );
}
