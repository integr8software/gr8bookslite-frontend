"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ClearAccessToken, GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import {
  type OnboardingFieldErrors,
  type OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import {
  OnboardingBillingStepSchema,
  OnboardingStepOneSchema,
} from "@/app/src/data/onboarding/OnboardingSchemas";
import type { BillingCycle, PricingPlan } from "@/app/src/data/pricing/PricingData";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import {
  CompleteOnboarding,
  SaveOnboardingBilling,
  SaveOnboardingCompanyDetails,
  SelectOnboardingPlan,
  UploadOnboardingCompanyLogo,
} from "@/app/src/services/onboarding/OnboardingApi";

function GetOnboardingApiBillingCycle(value: BillingCycle) {
  return value === "yearly" ? "YEARLY" : "MONTHLY";
}

function GetOnboardingIdentityPayload(values: OnboardingValues) {
  if (values.taxpayerType === "individual") {
    return {
      taxpayerType: "individual" as const,
      lastName: values.lastName,
      firstName: values.firstName,
      middleName: values.middleName,
      companyName: "",
      nonIndividualType: "",
      nonIndividualTypeOther: "",
    };
  }

  return {
    taxpayerType: "non-individual" as const,
    lastName: "",
    firstName: "",
    middleName: "",
    companyName: values.companyName,
    nonIndividualType: values.nonIndividualType,
    nonIndividualTypeOther:
      values.nonIndividualType === "Others"
        ? values.nonIndividualTypeOther
        : "",
  };
}

type UseOnboardingSubmissionParams = {
  resolvedAccessToken: string | null;
  stepIndex: number;
  isSubmitting: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  values: OnboardingValues;
  setErrors: React.Dispatch<React.SetStateAction<OnboardingFieldErrors>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmittingPlanCode: React.Dispatch<React.SetStateAction<string | null>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedPlan: React.Dispatch<React.SetStateAction<PricingPlan | null>>;
  setSelectedBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
};

export function useOnboardingSubmission({
  resolvedAccessToken,
  stepIndex,
  isSubmitting,
  isFirstStep,
  isLastStep,
  values,
  setErrors,
  setIsSubmitting,
  setSubmittingPlanCode,
  setStepIndex,
  setSelectedPlan,
  setSelectedBillingCycle,
}: UseOnboardingSubmissionParams) {
  const router = useRouter();
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  function validateStepOne() {
    const payload = {
      ...GetOnboardingIdentityPayload(values),
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

  function validateBillingStep() {
    const parsed = OnboardingBillingStepSchema.safeParse({
      cardholderName: values.cardholderName,
      billingEmail: values.billingEmail,
      cardNumber: values.cardNumber,
      expiryMonth: values.expiryMonth,
      expiryYear: values.expiryYear,
      cvc: values.cvc,
      billingAddress: values.billingAddress,
    });

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return false;
    }

    setErrors({});
    return true;
  }

  async function handlePlanSelection(
    plan: PricingPlan,
    billingCycle: BillingCycle,
  ) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmittingPlanCode(plan.code);

    try {
      const token = resolvedAccessToken ?? GetAccessToken();

      await SelectOnboardingPlan(token, {
        planCode: plan.code,
        billingCycle: GetOnboardingApiBillingCycle(billingCycle),
      });

      setSelectedPlan(plan);
      setSelectedBillingCycle(billingCycle);
      setErrors({});
      setStepIndex(1);
      toast.success("Plan saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not save your selected plan right now.",
      );
    } finally {
      setSubmittingPlanCode(null);
      setIsSubmitting(false);
    }
  }

  async function handleNext() {
    if (isSubmitting) {
      return;
    }

    if (stepIndex === 1 && !validateBillingStep()) return;
    if (stepIndex === 2 && !validateStepOne()) return;

    setIsSubmitting(true);

    try {
      const token = resolvedAccessToken ?? GetAccessToken();

      if (stepIndex === 1) {
        await SaveOnboardingBilling(token, {
          cardholderName: values.cardholderName.trim(),
          billingEmail: values.billingEmail.trim(),
          cardNumber: values.cardNumber.trim(),
          expiryMonth: Number(values.expiryMonth),
          expiryYear: Number(values.expiryYear),
          cvc: values.cvc.trim(),
          billingAddress: values.billingAddress.trim(),
        });

        setStepIndex((current) => current + 1);
        toast.success("Billing details saved.");
        return;
      }

      if (stepIndex === 2) {
        let logoName = values.logoName.trim();
        let logoMimeType = values.logoFile?.type || undefined;
        let logoStoragePath = values.logoStoragePath.trim();
        let logoPublicUrl = values.logoPublicUrl.trim();

        if (values.logoFile) {
          const uploadResponse = await UploadOnboardingCompanyLogo(
            token,
            values.logoFile,
          );

          logoName = uploadResponse.logo.fileName;
          logoMimeType = uploadResponse.logo.mimeType;
          logoStoragePath = uploadResponse.logo.storagePath;
          logoPublicUrl = uploadResponse.logo.publicUrl;
        }

        await SaveOnboardingCompanyDetails(token, {
          ...GetOnboardingIdentityPayload(values),
          logoName,
          logoMimeType,
          logoStoragePath: logoStoragePath || undefined,
          logoPublicUrl: logoPublicUrl || undefined,
          address: values.address.trim(),
          tin: values.tin.trim(),
          website: values.website.trim() || undefined,
          contactNumber: values.contactNumber.trim(),
          reportStartDate: values.reportStartDate,
          reportEndDate: values.reportEndDate,
        });

        setStepIndex((current) => current + 1);
        toast.success("Company details saved.");
        return;
      }

      if (isLastStep) {
        const response = await CompleteOnboarding(token);

        toast.success(response.message);

        if (response.requiresReauthentication) {
          ClearAccessToken();
          resetAppStore();
          router.replace("/login");
          return;
        }

        router.replace("/");
        return;
      }

      setStepIndex((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not save your onboarding details right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (isFirstStep || isSubmitting) return;
    setErrors({});
    setStepIndex((current) => current - 1);
  }

  return {
    handlePlanSelection,
    handleNext,
    handleBack,
  };
}
