import type {
  BillingCycleApi,
  ManualBillingCheckoutStatus,
  ManualBillingPurpose,
} from "@/app/src/data/billing/BillingTypes";
import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

type CreateManualCheckoutInput = {
  amountLabel?: string | null;
  billingCycle: BillingCycleApi;
  companyId?: string | number | null;
  companyName?: string | null;
  planCode: string;
  planName?: string | null;
  purpose: ManualBillingPurpose;
  returnTo: string;
};

export type ManualCheckoutSession = {
  checkoutSessionId: string;
  checkoutUrl: string;
  paymentAttemptId: string | number;
  /** @deprecated Use paymentAttemptId. */
  paymentRequestId: string | number;
  status?: string;
};

export type ManualPaymentAttemptStatusResponse = {
  id: number;
  paymentAttemptId: number;
  /** @deprecated Use paymentAttemptId. */
  paymentRequestId: number;
  purpose: ManualBillingPurpose;
  status: string;
  applicationStatus: string;
  invoice: {
    id: number;
    status: string;
    amountDueInCents: number | null;
    amountPaidInCents: number | null;
    currency: string | null;
    paidAt: string | null;
  };
  amountInCents: number;
  currency: string;
  checkoutSessionId: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  failedAt: string | null;
  expiredAt: string | null;
  canceledAt: string | null;
  appliedAt: string | null;
  applicationAttempts: number;
  lastApplicationAttemptAt: string | null;
  applicationError: string | null;
  subscription: unknown | null;
};

function GetAbsoluteUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

function BuildManualPaymentStatusUrl(
  input: CreateManualCheckoutInput,
  status: ManualBillingCheckoutStatus,
) {
  const params = new URLSearchParams({
    amountLabel: input.amountLabel ?? "",
    billingCycle: input.billingCycle,
    companyId: input.companyId == null ? "" : String(input.companyId),
    companyName: input.companyName ?? "",
    planCode: input.planCode,
    planName: input.planName ?? input.planCode,
    purpose: input.purpose,
    returnTo: input.returnTo,
  });

  return GetAbsoluteUrl(`/billing/payment/${status}?${params.toString()}`);
}

export async function CreateManualCheckout(
  input: CreateManualCheckoutInput,
): Promise<ManualCheckoutSession> {
  const response = await ApiClient.post<ManualCheckoutSession>(
    "/billing/checkout-sessions",
    {
      billingCycle: input.billingCycle,
      cancelUrl: BuildManualPaymentStatusUrl(input, "cancelled"),
      companyId:
        input.companyId == null || input.companyId === ""
          ? undefined
          : Number(input.companyId),
      planCode: input.planCode,
      purpose: input.purpose,
      successUrl: BuildManualPaymentStatusUrl(input, "success"),
    },
  );

  return response.data;
}

export async function GetManualPaymentAttemptStatus(
  paymentAttemptId: string | number,
) {
  const response = await ApiClient.get<ManualPaymentAttemptStatusResponse>(
    `/billing/payment-attempts/${paymentAttemptId}`,
  );

  return response.data;
}

/** @deprecated Use GetManualPaymentAttemptStatus. */
export const GetManualPaymentRequestStatus = GetManualPaymentAttemptStatus;
