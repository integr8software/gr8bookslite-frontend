"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  GetSyncedReportEndDate,
  GetSyncedReportStartDate,
  OnboardingMaxImageSizeBytes,
  OnboardingSteps,
} from "@/app/src/data/onboarding/OnboardingData";
import {
  InitialOnboardingValues,
  type OnboardingFieldErrors,
  type OnboardingTaxpayerType,
  type OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import {
  OnboardingStepOneSchema,
  OnboardingStepTwoSchema,
} from "@/app/src/data/onboarding/OnboardingSchemas";
import type {
  BillingCycle,
  PricingPlan,
} from "@/app/src/data/pricing/PricingData";

export function useOnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<OnboardingValues>(
    InitialOnboardingValues,
  );
  const [errors, setErrors] = useState<OnboardingFieldErrors>({});
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("monthly");
  const logoPreviewUrlRef = useRef("");
  const previousStepIndexRef = useRef(stepIndex);

  const currentStep = OnboardingSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === OnboardingSteps.length - 1;

  useEffect(() => {
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
      }
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

  const passwordStrength = useMemo(() => {
    const password = values.password;
    let score = 0;

    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return score;
  }, [values.password]);

  function updateValue(key: keyof OnboardingValues, value: string) {
    if (key === "reportStartDate") {
      setValues((current) => {
        const reportEndDate = GetSyncedReportEndDate(value);

        return {
          ...current,
          reportStartDate: value,
          reportEndDate,
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
        const reportStartDate = GetSyncedReportStartDate(value);

        return {
          ...current,
          reportStartDate,
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

  function setTaxpayerType(type: OnboardingTaxpayerType) {
    setValues((current) => ({
      ...current,
      taxpayerType: type,
      // Clear identity fields when switching type
      lastName: "",
      firstName: "",
      middleName: "",
      companyName: "",
      nonIndividualType: "",
      nonIndividualTypeOther: "",
    }));
    setErrors({});
  }

  function updateLogoPreviewUrl(nextPreviewUrl: string) {
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
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
      }));
      updateLogoPreviewUrl("");
      setErrors((current) => ({
        ...current,
        logo: ["Only image files are allowed."],
      }));
      setLogoInputKey((current) => current + 1);
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > OnboardingMaxImageSizeBytes) {
      setValues((current) => ({
        ...current,
        logoFile: null,
        logoName: "",
      }));
      updateLogoPreviewUrl("");
      setErrors((current) => ({
        ...current,
        logo: ["Logo must be 5MB or smaller."],
      }));
      setLogoInputKey((current) => current + 1);
      toast.error("Logo must be 5MB or smaller.");
      return;
    }

    setValues((current) => ({
      ...current,
      logoFile: file,
      logoName: file.name,
    }));
    updateLogoPreviewUrl(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, logo: undefined }));
  }

  function handleLogoRemove() {
    setValues((current) => ({
      ...current,
      logoFile: null,
      logoName: "",
    }));
    updateLogoPreviewUrl("");
    setLogoInputKey((current) => current + 1);
  }

  function handlePlanSelection(plan: PricingPlan, billingCycle: BillingCycle) {
    setSelectedPlan(plan);
    setSelectedBillingCycle(billingCycle);
    setStepIndex(1);
  }

  function validateStepOne() {
    const isIndividual = values.taxpayerType === "individual";

    const payload = isIndividual
      ? {
          taxpayerType: "individual" as const,
          lastName: values.lastName,
          firstName: values.firstName,
          middleName: values.middleName,
          address: values.address,
          tin: values.tin,
          website: values.website,
          contactNumber: values.contactNumber,
          logo: values.logoFile,
          reportYearBasis: values.reportYearBasis,
          reportStartDate: values.reportStartDate,
          reportEndDate: values.reportEndDate,
        }
      : {
          taxpayerType: "non-individual" as const,
          companyName: values.companyName,
          nonIndividualType: values.nonIndividualType,
          nonIndividualTypeOther: values.nonIndividualTypeOther,
          address: values.address,
          tin: values.tin,
          website: values.website,
          contactNumber: values.contactNumber,
          logo: values.logoFile,
          reportYearBasis: values.reportYearBasis,
          reportStartDate: values.reportStartDate,
          reportEndDate: values.reportEndDate,
        };

    const parsed = OnboardingStepOneSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return false;
    }

    setErrors({});
    return true;
  }

  function validateStepTwo() {
    const parsed = OnboardingStepTwoSchema.safeParse({
      accountFirstName: values.accountFirstName,
      accountLastName: values.accountLastName,
      workEmail: values.workEmail,
      role: values.role,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return false;
    }

    setErrors({});
    return true;
  }

  function handleNext() {
    if (stepIndex === 2 && !validateStepOne()) return;
    if (stepIndex === 3 && !validateStepTwo()) return;

    if (isLastStep) {
      toast.success("Onboarding complete.");
      router.push("/");
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleBack() {
    if (isFirstStep) return;
    setErrors({});
    setStepIndex((current) => current - 1);
  }

  return {
    currentStep,
    values,
    errors,
    logoInputKey,
    logoPreviewUrl,
    selectedPlan,
    selectedBillingCycle,
    passwordStrength,
    isFirstStep,
    isLastStep,
    updateValue,
    setTaxpayerType,
    handleLogoChange,
    handleLogoRemove,
    handlePlanSelection,
    handleNext,
    handleBack,
  };
}
