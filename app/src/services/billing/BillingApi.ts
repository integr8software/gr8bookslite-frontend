import { ApiClient } from "@/app/src/services/shared/ApiClient";
import type {
  AttachPaymentMethodRequest,
  AttachPaymentMethodResponse,
  BillingPlansResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CurrentSubscriptionResponse,
  SubscribeCompanyRequest,
  SubscribeCompanyResponse,
} from "@/app/src/data/billing/BillingTypes";

function GetAuthorizationHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function GetBillingPlans(accessToken: string) {
  const response = await ApiClient.get<BillingPlansResponse>("/billing/plans", {
    headers: GetAuthorizationHeaders(accessToken),
  });

  return response.data;
}

export async function GetCurrentBillingSubscription(accessToken: string) {
  const response = await ApiClient.get<CurrentSubscriptionResponse>(
    "/billing/subscriptions/current",
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function SubscribeCompanyToPlan(
  accessToken: string,
  payload: SubscribeCompanyRequest,
) {
  const response = await ApiClient.post<SubscribeCompanyResponse>(
    "/billing/subscriptions",
    payload,
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function AttachCompanySubscriptionPaymentMethod(
  accessToken: string,
  subscriptionId: number,
  payload: AttachPaymentMethodRequest,
) {
  const response = await ApiClient.post<AttachPaymentMethodResponse>(
    `/billing/subscriptions/${subscriptionId}/attach-payment-method`,
    payload,
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function CancelCompanySubscription(
  accessToken: string,
  subscriptionId: number,
  payload: CancelSubscriptionRequest,
) {
  const response = await ApiClient.post<CancelSubscriptionResponse>(
    `/billing/subscriptions/${subscriptionId}/cancel`,
    payload,
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}
