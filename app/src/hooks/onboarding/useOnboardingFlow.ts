"use client";

import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useOnboardingDraft } from "./useOnboardingDraft";
import { useOnboardingFormState } from "./useOnboardingFormState";
import { useOnboardingPlans } from "./useOnboardingPlans";
import { useOnboardingSubmission } from "./useOnboardingSubmission";

export function useOnboardingFlow() {
  const accessToken = useAppStore((state) => state.accessToken);
  const formState = useOnboardingFormState();
  const { plans, isPlansLoading } = useOnboardingPlans({ accessToken });
  const { resolvedAccessToken, isDraftLoading } = useOnboardingDraft({
    accessToken,
    setSelectedPlan: formState.setSelectedPlan,
    setSelectedBillingCycle: formState.setSelectedBillingCycle,
    setHasPersistedBillingSetup: formState.setHasPersistedBillingSetup,
    setStepIndex: formState.setStepIndex,
    setValues: formState.setValues,
    setPersistedLogoPreviewUrl: formState.setPersistedLogoPreviewUrl,
  });
  const { handlePlanSelection, handleNext, handleBack } =
    useOnboardingSubmission({
      resolvedAccessToken,
      stepIndex: formState.stepIndex,
      isSubmitting: formState.isSubmitting,
      isFirstStep: formState.isFirstStep,
      isLastStep: formState.isLastStep,
      values: formState.values,
      hasPersistedBillingSetup: formState.hasPersistedBillingSetup,
      setErrors: formState.setErrors,
      setIsSubmitting: formState.setIsSubmitting,
      setSubmittingPlanCode: formState.setSubmittingPlanCode,
      setStepIndex: formState.setStepIndex,
      setSelectedPlan: formState.setSelectedPlan,
      setSelectedBillingCycle: formState.setSelectedBillingCycle,
      setHasPersistedBillingSetup: formState.setHasPersistedBillingSetup,
    });

  return {
    currentStep: formState.currentStep,
    values: formState.values,
    errors: formState.errors,
    logoInputKey: formState.logoInputKey,
    logoPreviewUrl: formState.logoPreviewUrl,
    selectedPlan: formState.selectedPlan,
    selectedBillingCycle: formState.selectedBillingCycle,
    plans,
    isSubmitting: formState.isSubmitting,
    submittingPlanCode: formState.submittingPlanCode,
    furthestStepIndex: formState.furthestStepIndex,
    isDraftLoading: isDraftLoading || isPlansLoading,
    isFirstStep: formState.isFirstStep,
    isLastStep: formState.isLastStep,
    updateValue: formState.updateValue,
    setTaxpayerType: formState.setTaxpayerType,
    handleLogoChange: formState.handleLogoChange,
    handleLogoRemove: formState.handleLogoRemove,
    navigateToStep: formState.navigateToStep,
    handlePlanSelection,
    handleNext,
    handleBack,
  };
}
