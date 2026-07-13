import type {
  BillingCycleApi,
  ManualBillingCheckoutStatus,
  ManualBillingPurpose,
} from "@/app/src/data/billing/BillingTypes";

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
  paymentRequestId: string;
};

function CreateMockId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function BuildManualCheckoutUrl(
  input: CreateManualCheckoutInput,
  session: Pick<ManualCheckoutSession, "checkoutSessionId" | "paymentRequestId">,
) {
  const params = new URLSearchParams({
    amountLabel: input.amountLabel ?? "",
    billingCycle: input.billingCycle,
    checkoutSessionId: session.checkoutSessionId,
    companyId: input.companyId == null ? "" : String(input.companyId),
    companyName: input.companyName ?? "",
    paymentRequestId: session.paymentRequestId,
    planCode: input.planCode,
    planName: input.planName ?? input.planCode,
    purpose: input.purpose,
    returnTo: input.returnTo,
  });

  return `/billing/mock-checkout?${params.toString()}`;
}

export async function CreateManualCheckout(
  input: CreateManualCheckoutInput,
): Promise<ManualCheckoutSession> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));

  const session = {
    checkoutSessionId: CreateMockId("chk_mock"),
    paymentRequestId: CreateMockId("bpr_mock"),
  };

  return {
    ...session,
    checkoutUrl: BuildManualCheckoutUrl(input, session),
  };
}

export function BuildManualPaymentResultUrl(input: {
  amountLabel?: string | null;
  billingCycle?: string | null;
  checkoutSessionId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  paymentRequestId?: string | null;
  planCode?: string | null;
  planName?: string | null;
  purpose?: string | null;
  returnTo?: string | null;
  status: ManualBillingCheckoutStatus;
}) {
  const params = new URLSearchParams({
    amountLabel: input.amountLabel ?? "",
    billingCycle: input.billingCycle ?? "",
    checkoutSessionId: input.checkoutSessionId ?? "",
    companyId: input.companyId ?? "",
    companyName: input.companyName ?? "",
    paymentRequestId: input.paymentRequestId ?? "",
    planCode: input.planCode ?? "",
    planName: input.planName ?? "",
    purpose: input.purpose ?? "",
    returnTo: input.returnTo ?? "",
  });

  return `/billing/payment/${input.status}?${params.toString()}`;
}
