import {
  billingControllerAttachPaymentMethodV1,
  billingControllerCancelSubscriptionV1,
  billingControllerGetCurrentSubscriptionV1,
  billingControllerGetSubscriptionSetupV1,
  billingControllerListPaymentMethodsV1,
  billingControllerListPlansV1,
  billingControllerSubscribeCompanyV1,
} from "@/app/src/generated/api/billing/billing";
import type {
  AttachPaymentMethodRequest,
  AttachPaymentMethodResponse,
  BillingPaymentMethodsResponse,
  BillingPlansResponse,
  BillingPlanScope,
  BillingSubscriptionSetupResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CurrentSubscriptionResponse,
  SubscribeCompanyRequest,
  SubscribeCompanyResponse,
} from "@/app/src/data/billing/BillingTypes";

export async function GetBillingPlans(scope?: BillingPlanScope) {
  return billingControllerListPlansV1(
    scope ? { scope } : undefined,
  ) as Promise<BillingPlansResponse>;
}

export async function GetBillingSubscriptionSetup(scope?: BillingPlanScope) {
  return billingControllerGetSubscriptionSetupV1(
    scope ? { scope } : undefined,
  ) as Promise<BillingSubscriptionSetupResponse>;
}

export async function GetBillingPaymentMethods() {
  return billingControllerListPaymentMethodsV1() as Promise<BillingPaymentMethodsResponse>;
}

export async function GetCurrentBillingSubscription() {
  return billingControllerGetCurrentSubscriptionV1() as Promise<CurrentSubscriptionResponse>;
}

export async function SubscribeCompanyToPlan(
  payload: SubscribeCompanyRequest,
) {
  return billingControllerSubscribeCompanyV1(payload) as Promise<SubscribeCompanyResponse>;
}

export async function AttachCompanySubscriptionPaymentMethod(
  subscriptionId: number,
  payload: AttachPaymentMethodRequest,
) {
  return billingControllerAttachPaymentMethodV1(
    subscriptionId,
    payload,
  ) as Promise<AttachPaymentMethodResponse>;
}

export async function CancelCompanySubscription(
  subscriptionId: number,
  payload: CancelSubscriptionRequest,
) {
  return billingControllerCancelSubscriptionV1(
    subscriptionId,
    payload,
  ) as Promise<CancelSubscriptionResponse>;
}
