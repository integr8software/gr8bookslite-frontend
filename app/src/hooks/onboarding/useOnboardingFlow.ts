"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { OnboardingSteps } from "@/app/src/data/onboarding/OnboardingData";
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

export function useOnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<OnboardingValues>(
    InitialOnboardingValues,
  );
  const [errors, setErrors] = useState<OnboardingFieldErrors>({});
  const [logoInputKey, setLogoInputKey] = useState(0);

  const currentStep = OnboardingSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === OnboardingSteps.length - 1;

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
    setValues((current) => ({
      ...current,
      [key]: value,
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

  function handleLogoChange(file: File | undefined) {
    setValues((current) => ({
      ...current,
      logoFile: file || null,
      logoName: file?.name || "",
    }));
  }

  function handleLogoRemove() {
    setValues((current) => ({
      ...current,
      logoFile: null,
      logoName: "",
    }));
    setLogoInputKey((current) => current + 1);
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
      department: values.department,
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
    if (stepIndex === 0 && !validateStepOne()) return;
    if (stepIndex === 1 && !validateStepTwo()) return;

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
    passwordStrength,
    isFirstStep,
    isLastStep,
    updateValue,
    setTaxpayerType,
    handleLogoChange,
    handleLogoRemove,
    handleNext,
    handleBack,
  };
}
