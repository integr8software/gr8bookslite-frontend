"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import {
  AppMaxFileUploadSizeBytes,
  AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import {
  GetSyncedReportEndDate,
  GetSyncedReportStartDate,
  IsValidOnboardingDateValue,
  OnboardingSteps,
} from "@/app/src/data/onboarding/OnboardingData";
import {
  InitialOnboardingValues,
  type OnboardingFieldErrors,
  type OnboardingTaxpayerType,
  type OnboardingValues,
} from "@/app/src/types/onboarding/OnboardingTypes";
import type {
  BillingCycle,
  PricingPlan,
} from "@/app/src/types/pricing/PricingTypes";

function RevokeObjectUrlIfNeeded(value: string) {
  if (value.startsWith("blob:")) {
    URL.revokeObjectURL(value);
  }
}

function GetDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function FormatCardNumber(value: string) {
  return GetDigitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function useOnboardingFormState() {
  const [{ stepIndex, furthestStepIndex }, setStepNavigation] = useState({
    stepIndex: 0,
    furthestStepIndex: 0,
  });
  const [values, setValues] = useState<OnboardingValues>(
    InitialOnboardingValues,
  );
  const [errors, setErrors] = useState<OnboardingFieldErrors>({});
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("monthly");
  const [hasPersistedBillingSetup, setHasPersistedBillingSetup] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPlanCode, setSubmittingPlanCode] = useState<string | null>(
    null,
  );
  const logoPreviewUrlRef = useRef("");
  const previousStepIndexRef = useRef(stepIndex);
  const baseCurrencyWasManuallySelectedRef = useRef(false);

  const currentStep = OnboardingSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === OnboardingSteps.length - 1;

  useEffect(() => {
    return () => {
      RevokeObjectUrlIfNeeded(logoPreviewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (previousStepIndexRef.current === stepIndex) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    previousStepIndexRef.current = stepIndex;
  }, [stepIndex]);

  function setStepIndex(action: SetStateAction<number>) {
    setStepNavigation((current) => {
      const next =
        typeof action === "function" ? action(current.stepIndex) : action;

      if (next === current.stepIndex) {
        return current;
      }

      return {
        stepIndex: next,
        furthestStepIndex: Math.max(current.furthestStepIndex, next),
      };
    });
  }

  function navigateToStep(nextStepIndex: number) {
    if (
      isSubmitting ||
      nextStepIndex < 0 ||
      nextStepIndex > furthestStepIndex
    ) {
      return;
    }

    setErrors({});
    setStepIndex(nextStepIndex);
  }

  function updateValue(key: keyof OnboardingValues, value: string) {
    if (key === "cardNumber") {
      setValues((current) => ({
        ...current,
        cardNumber: FormatCardNumber(value),
      }));
      setErrors((current) => ({
        ...current,
        cardNumber: undefined,
      }));
      return;
    }

    if (key === "expiryMonth") {
      setValues((current) => ({
        ...current,
        expiryMonth: GetDigitsOnly(value).slice(0, 2),
      }));
      setErrors((current) => ({
        ...current,
        expiryMonth: undefined,
      }));
      return;
    }

    if (key === "expiryYear") {
      setValues((current) => ({
        ...current,
        expiryYear: GetDigitsOnly(value).slice(0, 4),
      }));
      setErrors((current) => ({
        ...current,
        expiryYear: undefined,
      }));
      return;
    }

    if (key === "cvc") {
      setValues((current) => ({
        ...current,
        cvc: GetDigitsOnly(value).slice(0, 4),
      }));
      setErrors((current) => ({
        ...current,
        cvc: undefined,
      }));
      return;
    }

    if (key === "reportStartDate") {
      setValues((current) => {
        if (!IsValidOnboardingDateValue(value)) {
          return {
            ...current,
            reportYearBasis: "Calendar Year",
          };
        }

        const reportEndDate = GetSyncedReportEndDate(value);

        return {
          ...current,
          reportStartDate: value,
          reportEndDate: reportEndDate || current.reportEndDate,
          reportYearBasis: "Calendar Year",
        };
      });
      setErrors((current) => ({
        ...current,
        reportYearBasis: undefined,
        reportStartDate: undefined,
        reportEndDate: undefined,
      }));
      return;
    }

    if (key === "reportEndDate") {
      setValues((current) => {
        if (!IsValidOnboardingDateValue(value)) {
          return {
            ...current,
            reportYearBasis: "Calendar Year",
          };
        }

        const reportStartDate = GetSyncedReportStartDate(value);

        return {
          ...current,
          reportStartDate: reportStartDate || current.reportStartDate,
          reportEndDate: value,
          reportYearBasis: "Calendar Year",
        };
      });
      setErrors((current) => ({
        ...current,
        reportYearBasis: undefined,
        reportStartDate: undefined,
        reportEndDate: undefined,
      }));
      return;
    }

    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  function updateCountry(countryCode: string, defaultCurrencyCode: string) {
    setValues((current) => ({
      ...current,
      countryCode,
      ...(baseCurrencyWasManuallySelectedRef.current
        ? {}
        : { baseCurrencyCode: defaultCurrencyCode }),
    }));
    setErrors((current) => ({
      ...current,
      countryCode: undefined,
      baseCurrencyCode: undefined,
    }));
  }

  function updateBaseCurrency(value: string) {
    baseCurrencyWasManuallySelectedRef.current = true;
    updateValue("baseCurrencyCode", value);
  }

  const markDraftCurrencySelectionAsExplicit = useCallback(() => {
    baseCurrencyWasManuallySelectedRef.current = true;
  }, []);

  function setTaxpayerType(type: OnboardingTaxpayerType) {
    setValues((current) => ({
      ...current,
      taxpayerType: type,
    }));
    setErrors({});
  }

  function updateLogoPreviewUrl(nextPreviewUrl: string) {
    if (logoPreviewUrlRef.current) {
      RevokeObjectUrlIfNeeded(logoPreviewUrlRef.current);
    }

    logoPreviewUrlRef.current = nextPreviewUrl;
    setLogoPreviewUrl(nextPreviewUrl);
  }

  function handleLogoChange(file: File | undefined) {
    if (!file) {
      setValues((current) => ({
        ...current,
        logoFile: null,
        logoName: "",
        logoStoragePath: "",
        logoPublicUrl: "",
      }));
      updateLogoPreviewUrl("");
      setErrors((current) => ({ ...current, logo: undefined }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setValues((current) => ({
        ...current,
        logoFile: null,
        logoName: "",
        logoStoragePath: "",
        logoPublicUrl: "",
      }));
      updateLogoPreviewUrl("");
      setErrors((current) => ({
        ...current,
        logo: ["Only image files are allowed."],
      }));
      setLogoInputKey((current) => current + 1);
      return;
    }

    if (file.size > AppMaxFileUploadSizeBytes) {
      setValues((current) => ({
        ...current,
        logoFile: null,
        logoName: "",
        logoStoragePath: "",
        logoPublicUrl: "",
      }));
      updateLogoPreviewUrl("");
      setErrors((current) => ({
        ...current,
        logo: [`Logo must be ${AppMaxFileUploadSizeLabel} or smaller.`],
      }));
      setLogoInputKey((current) => current + 1);
      return;
    }

    setValues((current) => ({
      ...current,
      logoFile: file,
      logoName: file.name,
      logoStoragePath: "",
      logoPublicUrl: "",
    }));
    updateLogoPreviewUrl(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, logo: undefined }));
  }

  function handleLogoRemove() {
    setValues((current) => ({
      ...current,
      logoFile: null,
      logoName: "",
      logoStoragePath: "",
      logoPublicUrl: "",
    }));
    updateLogoPreviewUrl("");
    setLogoInputKey((current) => current + 1);
  }

  function setPersistedLogoPreviewUrl(nextPreviewUrl: string) {
    updateLogoPreviewUrl(nextPreviewUrl);
  }

  return {
    stepIndex,
    setStepIndex,
    furthestStepIndex,
    navigateToStep,
    values,
    setValues,
    errors,
    setErrors,
    logoInputKey,
    setLogoInputKey,
    logoPreviewUrl,
    selectedPlan,
    setSelectedPlan,
    selectedBillingCycle,
    setSelectedBillingCycle,
    hasPersistedBillingSetup,
    setHasPersistedBillingSetup,
    isSubmitting,
    setIsSubmitting,
    submittingPlanCode,
    setSubmittingPlanCode,
    currentStep,
    isFirstStep,
    isLastStep,
    updateValue,
    updateCountry,
    updateBaseCurrency,
    markDraftCurrencySelectionAsExplicit,
    setTaxpayerType,
    handleLogoChange,
    handleLogoRemove,
    setPersistedLogoPreviewUrl,
  };
}
