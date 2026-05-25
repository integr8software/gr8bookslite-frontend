"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import {
  InitialBillingPaymentFormValues,
  type BillingCycle,
  type BillingPaymentFormErrors,
  type BillingPaymentFormValues,
} from "@/app/src/data/billing/BillingTypes";
import { validateBillingPaymentForm } from "@/app/src/validations/billing/BillingValidation";
import { GetBillingCycleApiValue } from "@/app/src/data/billing/BillingUtils";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import {
  AttachCompanySubscriptionPaymentMethod,
  CancelCompanySubscription,
  SubscribeCompanyToPlan,
} from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";
import { CreatePaymongoCardPaymentMethod } from "@/app/src/services/billing/PaymongoClient";
import { useBillingPlansQuery } from "@/app/src/hooks/billing/useBillingPlansQuery";
import { useCurrentBillingSubscriptionQuery } from "@/app/src/hooks/billing/useCurrentBillingSubscriptionQuery";

function GetBlockingSubscriptionStatuses() {
  return new Set(["INCOMPLETE", "TRIALING", "ACTIVE", "PAST_DUE", "UNPAID"]);
}

export function useBillingSubscriptionManager() {
  const queryClient = useQueryClient();
  const storedAccessToken = useAppStore((state) => state.accessToken);
  const accessToken = storedAccessToken ?? GetAccessToken();
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("monthly");
  const [paymentValues, setPaymentValues] = useState<BillingPaymentFormValues>(
    InitialBillingPaymentFormValues,
  );
  const [paymentErrors, setPaymentErrors] = useState<BillingPaymentFormErrors>(
    {},
  );

  const plansQuery = useBillingPlansQuery({ accessToken });
  const currentSubscriptionQuery = useCurrentBillingSubscriptionQuery({
    accessToken,
  });
  const resolvedSelectedPlanCode =
    selectedPlanCode || plansQuery.data?.plans[0]?.code || "";
  const currentSubscription = currentSubscriptionQuery.data?.subscription ?? null;
  const hasBlockingSubscription = currentSubscription
    ? GetBlockingSubscriptionStatuses().has(currentSubscription.status)
    : false;

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        throw new Error("You need to sign in before managing billing.");
      }

      const paymentValidation = validateBillingPaymentForm(paymentValues);

      if (!resolvedSelectedPlanCode) {
        setPaymentErrors({
          planCode: ["Select a billing plan before continuing."],
        });
        throw new Error("Select a billing plan before continuing.");
      }

      if (Object.keys(paymentValidation.errors).length > 0) {
        setPaymentErrors(paymentValidation.errors);
        throw new Error("Please fix the highlighted payment details.");
      }

      setPaymentErrors({});

      const subscriptionResponse = await SubscribeCompanyToPlan(accessToken, {
        planCode: resolvedSelectedPlanCode,
        billingCycle: GetBillingCycleApiValue(selectedBillingCycle),
      });
      const paymentMethod = await CreatePaymongoCardPaymentMethod(
        paymentValidation.values ?? paymentValues,
      );

      return AttachCompanySubscriptionPaymentMethod(
        accessToken,
        subscriptionResponse.subscription.id,
        {
          paymentMethodId: paymentMethod.paymentMethodId,
        },
      );
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.currentSubscription(),
        }),
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.plans(),
        }),
      ]);

      if (response.paymentIntent.redirectUrl) {
        toast.success(
          "Card details attached. We’re redirecting you to finish authentication.",
        );
        window.location.assign(response.paymentIntent.redirectUrl);
        return;
      }

      toast.success(
        "Payment method attached. Wait for PayMongo webhook confirmation before treating the subscription as active.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not start the subscription flow right now.",
      );
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (cancelAtPeriodEnd: boolean) => {
      if (!accessToken) {
        throw new Error("You need to sign in before managing billing.");
      }

      if (!currentSubscription) {
        throw new Error("There is no current subscription to cancel.");
      }

      return CancelCompanySubscription(accessToken, currentSubscription.id, {
        cancelAtPeriodEnd,
      });
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: BillingQueryKeys.currentSubscription(),
      });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not update the subscription right now.",
      );
    },
  });

  return {
    accessToken,
    plans: plansQuery.data?.plans ?? [],
    selectedPlanCode: resolvedSelectedPlanCode,
    selectedBillingCycle,
    paymentValues,
    paymentErrors,
    currentSubscription,
    isLoading:
      plansQuery.isLoading ||
      currentSubscriptionQuery.isLoading ||
      subscribeMutation.isPending ||
      cancelSubscriptionMutation.isPending,
    isPlansLoading: plansQuery.isLoading,
    isSubscriptionLoading: currentSubscriptionQuery.isLoading,
    isSubmitting: subscribeMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
    hasBlockingSubscription,
    setSelectedPlanCode,
    setSelectedBillingCycle,
    updatePaymentValue: (
      key: keyof BillingPaymentFormValues,
      value: string,
    ) => {
      setPaymentValues((current) => ({
        ...current,
        [key]: value,
      }));
      setPaymentErrors((current) => ({
        ...current,
        [key]: undefined,
      }));
    },
    retryQueries: async () => {
      await Promise.all([
        plansQuery.refetch(),
        currentSubscriptionQuery.refetch(),
      ]);
    },
    startSubscriptionSetup: () => {
      subscribeMutation.mutate();
    },
    cancelSubscriptionNow: (cancelAtPeriodEnd: boolean) => {
      cancelSubscriptionMutation.mutate(cancelAtPeriodEnd);
    },
  };
}
