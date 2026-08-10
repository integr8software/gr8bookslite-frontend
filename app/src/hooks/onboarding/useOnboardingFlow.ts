"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useOnboardingDraft } from "./useOnboardingDraft";
import { useOnboardingFormState } from "./useOnboardingFormState";
import { useOnboardingPlans } from "./useOnboardingPlans";
import { useOnboardingSubmission } from "./useOnboardingSubmission";

export function useOnboardingFlow() {
  const searchParams = useSearchParams();
  const hasAppliedManualBillingReturnRef = useRef(false);
  const accessToken = useAppStore((state) => state.accessToken);
  const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
  const formState = useOnboardingFormState();
  const { plans, isPlansLoading } = useOnboardingPlans({
    accessToken,
    isAuthSessionReady,
  });
  const { resolvedAccessToken, isDraftLoading } = useOnboardingDraft({
    accessToken,
    isAuthSessionReady,
    setSelectedPlan: formState.setSelectedPlan,
    setSelectedBillingCycle: formState.setSelectedBillingCycle,
    setHasPersistedBillingSetup: formState.setHasPersistedBillingSetup,
    setStepIndex: formState.setStepIndex,
    setValues: formState.setValues,
    markDraftCurrencySelectionAsExplicit:
      formState.markDraftCurrencySelectionAsExplicit,
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
      selectedBillingCycle: formState.selectedBillingCycle,
      selectedPlan: formState.selectedPlan,
      hasPersistedBillingSetup: formState.hasPersistedBillingSetup,
      setErrors: formState.setErrors,
      setIsSubmitting: formState.setIsSubmitting,
      setSubmittingPlanCode: formState.setSubmittingPlanCode,
      setStepIndex: formState.setStepIndex,
      setSelectedPlan: formState.setSelectedPlan,
      setSelectedBillingCycle: formState.setSelectedBillingCycle,
      setHasPersistedBillingSetup: formState.setHasPersistedBillingSetup,
    });

  const manualBillingStatus = searchParams.get("manualBillingStatus");
  const {
    setHasPersistedBillingSetup,
    setStepIndex,
    setValues,
  } = formState;

  useEffect(() => {
    if (
      manualBillingStatus !== "success" ||
      hasAppliedManualBillingReturnRef.current
    ) {
      return;
    }

    hasAppliedManualBillingReturnRef.current = true;
    setValues((current) =>
      current.billingMode === "MANUAL"
        ? current
        : {
            ...current,
            billingMode: "MANUAL",
          },
    );
    setHasPersistedBillingSetup(true);
    setStepIndex(3);
  }, [manualBillingStatus, setHasPersistedBillingSetup, setStepIndex, setValues]);

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
    updateCountry: formState.updateCountry,
    updateBaseCurrency: formState.updateBaseCurrency,
    setTaxpayerType: formState.setTaxpayerType,
    handleLogoChange: formState.handleLogoChange,
    handleLogoRemove: formState.handleLogoRemove,
    navigateToStep: formState.navigateToStep,
    handlePlanSelection,
    handleNext,
    handleBack,
  };
}
