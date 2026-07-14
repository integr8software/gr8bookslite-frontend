"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  InitialBillingPaymentFormValues,
  type BillingMode,
  type BillingCycle,
  type BillingPaymentFormErrors,
  type BillingPaymentFormValues,
} from "@/app/src/data/billing/BillingTypes";
import { validateBillingPaymentForm } from "@/app/src/validations/billing/BillingValidation";
import { GetBillingCycleApiValue } from "@/app/src/data/billing/BillingUtils";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  AttachCompanySubscriptionPaymentMethod,
  CancelCompanySubscription,
  SubscribeCompanyToPlan,
} from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";
import { CreatePaymongoCardPaymentMethod } from "@/app/src/services/billing/PaymongoClient";
import { CreateManualCheckout } from "@/app/src/services/billing/ManualBillingApi";
import { useBillingSubscriptionSetupQuery } from "@/app/src/hooks/billing/useBillingSubscriptionSetupQuery";
import { FormatBillingPrice, GetPlanPriceForCycle } from "@/app/src/data/billing/BillingUtils";

function GetBlockingSubscriptionStatuses() {
  return new Set(["INCOMPLETE", "TRIALING", "ACTIVE", "PAST_DUE", "UNPAID"]);
}

export function useBillingSubscriptionManager() {
  const queryClient = useQueryClient();
  const storedAccessToken = useAppStore((state) => state.accessToken);
  const accessToken = storedAccessToken;
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("monthly");
  const [selectedBillingMode, setSelectedBillingMode] =
    useState<BillingMode>("MANUAL");
  const [paymentValues, setPaymentValues] = useState<BillingPaymentFormValues>(
    InitialBillingPaymentFormValues,
  );
  const [paymentErrors, setPaymentErrors] = useState<BillingPaymentFormErrors>(
    {},
  );

  const planScope = "ONBOARDING";
  const subscriptionSetupQuery = useBillingSubscriptionSetupQuery({
    accessToken,
    scope: planScope,
  });
  const resolvedSelectedPlanCode =
    selectedPlanCode || subscriptionSetupQuery.data?.plans[0]?.code || "";
  const currentSubscription =
    subscriptionSetupQuery.data?.subscription ?? null;
  const hasBlockingSubscription = currentSubscription
    ? GetBlockingSubscriptionStatuses().has(currentSubscription.status)
    : false;
  const selectedPlan = subscriptionSetupQuery.data?.plans.find(
    (plan) => plan.code === resolvedSelectedPlanCode,
  );

  const subscribeMutation = useMutation({
    mutationFn: async () => {
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

      const subscriptionResponse = await SubscribeCompanyToPlan({
        planCode: resolvedSelectedPlanCode,
        billingCycle: GetBillingCycleApiValue(selectedBillingCycle),
      });
      const paymentMethod = await CreatePaymongoCardPaymentMethod(
        paymentValidation.values ?? paymentValues,
      );

      return AttachCompanySubscriptionPaymentMethod(
        subscriptionResponse.subscription.id,
        {
          paymentMethodId: paymentMethod.paymentMethodId,
        },
      );
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.subscriptionSetup(planScope),
        }),
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.currentSubscription(),
        }),
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.plans(planScope),
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

  const manualCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedSelectedPlanCode || !selectedPlan) {
        setPaymentErrors({
          planCode: ["Select a billing plan before continuing."],
        });
        throw new Error("Select a billing plan before continuing.");
      }

      setPaymentErrors({});

      const selectedPrice = GetPlanPriceForCycle(
        selectedPlan,
        selectedBillingCycle,
      );

      return CreateManualCheckout({
        amountLabel: FormatBillingPrice(
          selectedPrice.amountInCents,
          selectedPlan.currency,
        ),
        billingCycle:
          selectedBillingCycle === "yearly" ? "YEARLY" : "MONTHLY",
        companyName: "Current company",
        planCode: selectedPlan.code,
        planName: selectedPlan.name,
        purpose: "RENEWAL",
        returnTo: "/workspace/billing-and-subscription",
      });
    },
    onSuccess: (session) => {
      toast.success("Opening PayMongo hosted checkout.");
      window.location.assign(session.checkoutUrl);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not start manual checkout right now.",
      );
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (cancelAtPeriodEnd: boolean) => {
      if (!currentSubscription) {
        throw new Error("There is no current subscription to cancel.");
      }

      return CancelCompanySubscription(currentSubscription.id, {
        cancelAtPeriodEnd,
      });
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.subscriptionSetup(planScope),
        }),
        queryClient.invalidateQueries({
          queryKey: BillingQueryKeys.currentSubscription(),
        }),
      ]);
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
    plans: subscriptionSetupQuery.data?.plans ?? [],
    selectedPlanCode: resolvedSelectedPlanCode,
    selectedBillingCycle,
    selectedBillingMode,
    paymentValues,
    paymentErrors,
    currentSubscription,
    isLoading:
      subscriptionSetupQuery.isLoading ||
      subscribeMutation.isPending ||
      manualCheckoutMutation.isPending ||
      cancelSubscriptionMutation.isPending,
    isPlansLoading: subscriptionSetupQuery.isLoading,
    isSubscriptionLoading: subscriptionSetupQuery.isLoading,
    isSubmitting: subscribeMutation.isPending || manualCheckoutMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
    hasBlockingSubscription,
    setSelectedPlanCode,
    setSelectedBillingCycle,
    setSelectedBillingMode,
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
      await subscriptionSetupQuery.refetch();
    },
    startSubscriptionSetup: () => {
      subscribeMutation.mutate();
    },
    startManualCheckout: () => {
      manualCheckoutMutation.mutate();
    },
    cancelSubscriptionNow: (cancelAtPeriodEnd: boolean) => {
      cancelSubscriptionMutation.mutate(cancelAtPeriodEnd);
    },
  };
}
