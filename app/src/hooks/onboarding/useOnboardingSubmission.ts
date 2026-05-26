"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ClearAccessToken,
  GetAccessToken,
  SaveAccessToken,
} from "@/app/src/data/auth/AuthSessionStorage";
import {
  type OnboardingFieldErrors,
  type OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import {
  validateOnboardingBillingValues,
  validateOnboardingStepOneValues,
} from "@/app/src/validations/onboarding/OnboardingValidation";
import type { BillingCycle, PricingPlan } from "@/app/src/data/pricing/PricingData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  CompleteOnboarding,
  SaveOnboardingBilling,
  SaveOnboardingCompanyDetails,
  SelectOnboardingPlan,
  UploadOnboardingCompanyLogo,
} from "@/app/src/services/onboarding/OnboardingApi";
import { CreatePaymongoCardPaymentMethod } from "@/app/src/services/billing/PaymongoClient";
import {
  GetFallbackPostAuthRedirectPath,
  ResolvePostAuthDestination,
} from "@/app/src/services/auth/AuthRedirects";
import { GetAuthProfileCompanyId } from "@/app/src/services/auth/AuthProfileAccess";

function GetOnboardingApiBillingCycle(value: BillingCycle) {
  return value === "yearly" ? "YEARLY" : "MONTHLY";
}

function GetDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function GetCardBrand(value: string) {
  const digits = GetDigitsOnly(value);

  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  if (/^(35(2[89]|[3-8]))/.test(digits)) return "jcb";
  if (/^(30[0-5]|36|38|39)/.test(digits)) return "diners";

  return "card";
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

  function canContinueFromStepOne() {
    const nextErrors = validateOnboardingStepOneValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields.");
      return false;
    }

    setErrors({});
    return true;
  }

  function canContinueFromBillingStep() {
    const nextErrors = validateOnboardingBillingValues(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
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

    if (stepIndex === 1 && !canContinueFromStepOne()) return;
    if (stepIndex === 2 && !canContinueFromBillingStep()) return;

    setIsSubmitting(true);

    try {
      const token = resolvedAccessToken ?? GetAccessToken();

      if (stepIndex === 1) {
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

      if (stepIndex === 2) {
        const cardDigits = GetDigitsOnly(values.cardNumber);
        const paymentMethod = await CreatePaymongoCardPaymentMethod({
          cardholderName: values.cardholderName.trim(),
          billingEmail: values.billingEmail.trim(),
          cardNumber: values.cardNumber.trim(),
          expiryMonth: values.expiryMonth.trim(),
          expiryYear: values.expiryYear.trim(),
          cvc: values.cvc.trim(),
          billingAddress: values.billingAddress.trim(),
          contactNumber: values.contactNumber.trim(),
        });

        const billingResponse = await SaveOnboardingBilling(token, {
          cardholderName: values.cardholderName.trim(),
          billingEmail: values.billingEmail.trim(),
          cardLast4: cardDigits.slice(-4),
          cardBrand: GetCardBrand(cardDigits),
          expiryMonth: Number(values.expiryMonth),
          expiryYear: Number(values.expiryYear),
          billingAddress: values.billingAddress.trim(),
          paymentMethodId: paymentMethod.paymentMethodId,
        });

        if (billingResponse.paymentIntent?.redirectUrl) {
          toast.success(
            "Card details attached. Redirecting you to complete PayMongo authentication.",
          );
          window.location.assign(billingResponse.paymentIntent.redirectUrl);
          return;
        }

        setStepIndex((current) => current + 1);
        toast.success(
          billingResponse.pendingProviderActivation
            ? "Billing setup is pending while PayMongo subscription billing is being activated."
            : billingResponse.message || "Billing details saved.",
        );
        return;
      }

      if (isLastStep) {
        const response = await CompleteOnboarding(token);

        toast.success(response.message);

        if (response.accessToken) {
          SaveAccessToken(response.accessToken, false);
          useAppStore.setState({ accessToken: response.accessToken });

          try {
            const { profile, redirectPath } = await ResolvePostAuthDestination(
              response.accessToken,
            );

            useAppStore.setState({
              accessToken: response.accessToken,
              activeCompanyId: GetAuthProfileCompanyId(profile),
            });
            router.replace(redirectPath);
          } catch {
            router.replace(
              GetFallbackPostAuthRedirectPath(response.accessToken),
            );
          }
          return;
        }

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
