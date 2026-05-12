"use client";

import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import { useOnboardingDraft } from "./useOnboardingDraft";
import { useOnboardingFormState } from "./useOnboardingFormState";
import { useOnboardingSubmission } from "./useOnboardingSubmission";

export function useOnboardingFlow() {
  const accessToken = useAppStore((state) => state.accessToken);
  const formState = useOnboardingFormState();
  const { resolvedAccessToken, isDraftLoading } = useOnboardingDraft({
    accessToken,
    setSelectedPlan: formState.setSelectedPlan,
    setSelectedBillingCycle: formState.setSelectedBillingCycle,
    setStepIndex: formState.setStepIndex,
    setValues: formState.setValues,
  });
  const { handlePlanSelection, handleNext, handleBack } =
    useOnboardingSubmission({
      resolvedAccessToken,
      stepIndex: formState.stepIndex,
      isSubmitting: formState.isSubmitting,
      isFirstStep: formState.isFirstStep,
      isLastStep: formState.isLastStep,
      values: formState.values,
      setErrors: formState.setErrors,
      setIsSubmitting: formState.setIsSubmitting,
      setSubmittingPlanCode: formState.setSubmittingPlanCode,
      setStepIndex: formState.setStepIndex,
      setSelectedPlan: formState.setSelectedPlan,
      setSelectedBillingCycle: formState.setSelectedBillingCycle,
    });

  return {
    currentStep: formState.currentStep,
    values: formState.values,
    errors: formState.errors,
    logoInputKey: formState.logoInputKey,
    logoPreviewUrl: formState.logoPreviewUrl,
    selectedPlan: formState.selectedPlan,
    selectedBillingCycle: formState.selectedBillingCycle,
    isSubmitting: formState.isSubmitting,
    submittingPlanCode: formState.submittingPlanCode,
    isDraftLoading,
    isFirstStep: formState.isFirstStep,
    isLastStep: formState.isLastStep,
    updateValue: formState.updateValue,
    setTaxpayerType: formState.setTaxpayerType,
    handleLogoChange: formState.handleLogoChange,
    handleLogoRemove: formState.handleLogoRemove,
    handlePlanSelection,
    handleNext,
    handleBack,
  };
}
