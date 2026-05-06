"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { OnboardingSteps } from "@/app/src/data/onboarding/OnboardingData";
import {
  InitialOnboardingValues,
  type OnboardingFieldErrors,
  type OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import {
  OnboardingStepOneSchema,
  OnboardingStepTwoSchema,
} from "@/app/src/data/onboarding/OnboardingSchemas";

export function useOnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<OnboardingValues>(InitialOnboardingValues);
  const [errors, setErrors] = useState<OnboardingFieldErrors>({});
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  const currentStep = OnboardingSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === OnboardingSteps.length - 1;

  const passwordStrength = useMemo(() => {
    const password = values.password;
    let score = 0;

    if (!password) {
      return 0;
    }

    if (password.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    return score;
  }, [values.password]);

  function updateValue(key: keyof OnboardingValues, value: string) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleAttachmentChange(file: File | undefined) {
    setValues((current) => ({
      ...current,
      attachmentFile: file || null,
      attachmentName: file?.name || "",
    }));
  }

  function handleAttachmentRemove() {
    setValues((current) => ({
      ...current,
      attachmentFile: null,
      attachmentName: "",
    }));
    setAttachmentInputKey((current) => current + 1);
  }

  function validateStepOne() {
    const parsed = OnboardingStepOneSchema.safeParse({
      companyName: values.companyName,
      industry: values.industry,
      companySize: values.companySize,
      website: values.website,
      contactNumber: values.contactNumber,
      attachment: values.attachmentFile,
    });

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
      firstName: values.firstName,
      lastName: values.lastName,
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
    if (stepIndex === 0 && !validateStepOne()) {
      return;
    }

    if (stepIndex === 1 && !validateStepTwo()) {
      return;
    }

    if (isLastStep) {
      toast.success("Onboarding complete.");
      router.push("/");
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleBack() {
    if (isFirstStep) {
      return;
    }

    setErrors({});
    setStepIndex((current) => current - 1);
  }

  return {
    currentStep,
    values,
    errors,
    attachmentInputKey,
    passwordStrength,
    isFirstStep,
    isLastStep,
    updateValue,
    handleAttachmentChange,
    handleAttachmentRemove,
    handleNext,
    handleBack,
  };
}
