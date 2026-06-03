import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  AttachPaymentMethodRequest,
  AttachPaymentMethodResponse,
  BillingPaymentMethodsResponse,
  BillingPlansResponse,
  BillingPlanScope,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CurrentSubscriptionResponse,
  SubscribeCompanyRequest,
  SubscribeCompanyResponse,
} from "@/app/src/data/billing/BillingTypes";

export async function GetBillingPlans(scope?: BillingPlanScope) {
  const response = await ApiClient.get<BillingPlansResponse>("/billing/plans", {
    params: scope ? { scope } : undefined,
  });

  return response.data;
}

export async function GetBillingPaymentMethods() {
  const response = await ApiClient.get<BillingPaymentMethodsResponse>(
    "/billing/payment-methods",
  );

  return response.data;
}

export async function GetCurrentBillingSubscription() {
  const response = await ApiClient.get<CurrentSubscriptionResponse>(
    "/billing/subscriptions/current",
  );

  return response.data;
}

export async function SubscribeCompanyToPlan(
  payload: SubscribeCompanyRequest,
) {
  const response = await ApiClient.post<SubscribeCompanyResponse>(
    "/billing/subscriptions",
    payload,
  );

  return response.data;
}

export async function AttachCompanySubscriptionPaymentMethod(
  subscriptionId: number,
  payload: AttachPaymentMethodRequest,
) {
  const response = await ApiClient.post<AttachPaymentMethodResponse>(
    `/billing/subscriptions/${subscriptionId}/attach-payment-method`,
    payload,
  );

  return response.data;
}

export async function CancelCompanySubscription(
  subscriptionId: number,
  payload: CancelSubscriptionRequest,
) {
  const response = await ApiClient.post<CancelSubscriptionResponse>(
    `/billing/subscriptions/${subscriptionId}/cancel`,
    payload,
  );

  return response.data;
}
