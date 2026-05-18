"use client";

import { OnboardingSteps } from "@/app/src/data/onboarding/OnboardingData";
import { useOnboardingFlow } from "@/app/src/hooks/onboarding/useOnboardingFlow";
import { OnboardingBillingStep } from "./OnboardingBillingStep";
import { OnboardingFreeTrialStep } from "./OnboardingFreeTrialStep";
import { OnboardingProgressHeader } from "./OnboardingProgressHeader";
import { OnboardingReviewStep } from "./OnboardingReviewStep";
import { OnboardingStepOne } from "./OnboardingStepOne";
import { ImageCropDialog } from "@/app/src/ui/shared/ImageCropDialog";
import {
  AppSkeleton,
  AppSkeletonCard,
} from "@/app/src/ui/shared/AppSkeleton";

export function OnboardingFlow() {
  const {
    currentStep,
    values,
    errors,
    logoInputKey,
    logoPreviewUrl,
    pendingLogoCrop,
    selectedPlan,
    selectedBillingCycle,
    isSubmitting,
    submittingPlanCode,
    isDraftLoading,
    updateValue,
    setTaxpayerType,
    applyCroppedLogo,
    dismissLogoCropper,
    handleLogoChange,
    handleLogoRemove,
    handlePlanSelection,
    handleNext,
    handleBack,
  } = useOnboardingFlow();

  if (isDraftLoading) {
    return (
      <div className="mt-10 space-y-6">
        <AppSkeletonCard>
          <AppSkeleton className="h-3 w-32" />
          <AppSkeleton className="mt-5 h-10 w-72" />
          <AppSkeleton className="mt-4 h-4 w-full max-w-2xl" />
          <AppSkeleton className="mt-2 h-4 w-full max-w-xl" />
        </AppSkeletonCard>

        <AppSkeletonCard>
          <AppSkeleton className="h-5 w-48" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AppSkeleton className="h-14 rounded-2xl" />
            <AppSkeleton className="h-14 rounded-2xl" />
            <AppSkeleton className="h-14 rounded-2xl md:col-span-2" />
            <AppSkeleton className="h-14 rounded-2xl md:col-span-2" />
          </div>
        </AppSkeletonCard>
      </div>
    );
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

      <ImageCropDialog
        isOpen={Boolean(pendingLogoCrop)}
        title="Crop Logo"
        aspect={4 / 3}
        fileName={pendingLogoCrop?.fileName ?? "logo.png"}
        mimeType={pendingLogoCrop?.mimeType ?? "image/png"}
        sourceImageUrl={pendingLogoCrop?.sourceImageUrl ?? ""}
        onCancel={dismissLogoCropper}
        onConfirm={async (file) => {
          applyCroppedLogo(file);
        }}
      />
    </>
  );
}
