"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AuthenticatedSessionMarker,
  ClearLegacyAuthStorage,
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
  GetOnboardingDraft,
  SaveOnboardingBilling,
  SaveOnboardingCompanyDetails,
  SelectOnboardingPlan,
  UploadOnboardingCompanyLogo,
} from "@/app/src/services/onboarding/OnboardingApi";
import { CreatePaymongoCardPaymentMethod } from "@/app/src/services/billing/PaymongoClient";
import {
  CreateFrontendAuthSession,
  GetAuthProfile,
  SwitchCompanyContext,
} from "@/app/src/services/auth/AuthApi";
import {
  AuthQueryKeys,
  CreateAuthAccessTokenQueryScope,
} from "@/app/src/services/auth/AuthQueryKeys";
import {
  GetFallbackPostAuthRedirectPath,
  GetPostAuthRedirectPathFromProfile,
} from "@/app/src/services/auth/AuthRedirects";
import { GetAuthProfileCompanyId } from "@/app/src/services/auth/AuthProfileAccess";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";

const CompanyNameTakenMessage = "Company name is already taken.";

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

function Wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function DidBillingPersist(accessToken: string | null) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await GetOnboardingDraft(accessToken);

    if (response.draft?.hasBillingSetup) {
      return true;
    }

    if (attempt < 2) {
      await Wait(500);
    }
  }

  return false;
}

async function GetCompletedOnboardingProfile(accessToken: string | null) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const profile = await GetAuthProfile(accessToken);

    if (!profile.onboarding.requiresCompanySetup) {
      return profile;
    }

    if (attempt < 3) {
      await Wait(750);
    }
  }

  return null;
}

function IsRequestTimeout(error: unknown) {
  return (
    error instanceof Error &&
    error.message.trim().toLowerCase() === "the request timed out."
  );
}

function IsCompanyNameTakenError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.status === 409 &&
    error.message === CompanyNameTakenMessage
  );
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
  hasPersistedBillingSetup: boolean;
  setErrors: React.Dispatch<React.SetStateAction<OnboardingFieldErrors>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmittingPlanCode: React.Dispatch<React.SetStateAction<string | null>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedPlan: React.Dispatch<React.SetStateAction<PricingPlan | null>>;
  setSelectedBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
  setHasPersistedBillingSetup: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useOnboardingSubmission({
  resolvedAccessToken,
  stepIndex,
  isSubmitting,
  isFirstStep,
  isLastStep,
  values,
  hasPersistedBillingSetup,
  setErrors,
  setIsSubmitting,
  setSubmittingPlanCode,
  setStepIndex,
  setSelectedPlan,
  setSelectedBillingCycle,
  setHasPersistedBillingSetup,
}: UseOnboardingSubmissionParams) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetAppStore = useAppStore((state) => state.resetAppStore);

  async function prepareCompletedAuthProfile(profile: Awaited<ReturnType<typeof GetAuthProfile>>) {
    await queryClient.cancelQueries({
      queryKey: AuthQueryKeys.profiles(),
    });
    queryClient.setQueryData(
      AuthQueryKeys.profile(
        CreateAuthAccessTokenQueryScope(AuthenticatedSessionMarker),
      ),
      profile,
    );
    await queryClient.invalidateQueries({
      queryKey: AuthQueryKeys.profiles(),
      refetchType: "inactive",
    });
  }

  async function redirectToCompletedOnboarding(
    accessToken: string | null,
  ) {
    const profile = await GetCompletedOnboardingProfile(accessToken);

    if (!profile) {
      return false;
    }

    const companyId = GetAuthProfileCompanyId(profile);

    if (companyId != null) {
      const context = await SwitchCompanyContext(accessToken, companyId);
      await CreateFrontendAuthSession(context.accessToken, false);
    }

    useAppStore.setState({
      accessToken: AuthenticatedSessionMarker,
      activeCompanyId: companyId,
    });
    await prepareCompletedAuthProfile(profile);
    router.replace(GetPostAuthRedirectPathFromProfile(profile));
    return true;
  }

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
      const token = resolvedAccessToken;

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
    const isUsingPersistedBilling =
      stepIndex === 2 &&
      hasPersistedBillingSetup &&
      values.cardNumber.trim() === "" &&
      values.cvc.trim() === "";

    if (stepIndex === 2 && !isUsingPersistedBilling && !canContinueFromBillingStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = resolvedAccessToken;

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
          companyEmail: values.companyEmail.trim(),
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
        if (isUsingPersistedBilling) {
          setStepIndex((current) => current + 1);
          return;
        }

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
        setHasPersistedBillingSetup(true);
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
          await CreateFrontendAuthSession(response.accessToken, false);
          useAppStore.setState({ accessToken: AuthenticatedSessionMarker });

          try {
            const profile = await GetAuthProfile();
            const companyId = GetAuthProfileCompanyId(profile);

            useAppStore.setState({
              accessToken: AuthenticatedSessionMarker,
              activeCompanyId: companyId,
            });
            await prepareCompletedAuthProfile(profile);
            router.replace(GetPostAuthRedirectPathFromProfile(profile));
          } catch {
            await queryClient.invalidateQueries({
              queryKey: AuthQueryKeys.profiles(),
            });
            router.replace(
              GetFallbackPostAuthRedirectPath(response.accessToken),
            );
          }
          return;
        }

        if (response.requiresReauthentication) {
          ClearLegacyAuthStorage();
          resetAppStore();
          router.replace("/login");
          return;
        }

        router.replace("/");
        return;
      }

      setStepIndex((current) => current + 1);
    } catch (error) {
      if (stepIndex === 1 && IsCompanyNameTakenError(error)) {
        setErrors((current) => ({
          ...current,
          companyName: [CompanyNameTakenMessage],
        }));
        toast.error(CompanyNameTakenMessage);
        return;
      }

      if (stepIndex === 2 && IsRequestTimeout(error)) {
        const token = resolvedAccessToken;

        try {
          if (await DidBillingPersist(token)) {
            setStepIndex(3);
            toast.success("Billing details saved.");
            return;
          }
        } catch {
          // Fall through to the original timeout message when draft recovery fails.
        }
      }

      if (isLastStep && IsRequestTimeout(error)) {
        try {
          if (await redirectToCompletedOnboarding(resolvedAccessToken)) {
            toast.success("Onboarding completed successfully.");
            return;
          }
        } catch {
          // Preserve the timeout error when completion recovery is inconclusive.
        }
      }

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
