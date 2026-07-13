export type BillingCycle = "monthly" | "yearly";

export type BillingCycleApi = "MONTHLY" | "YEARLY";

export type BillingPlanScope = "ONBOARDING" | "ADDITIONAL_COMPANY";

export type BillingMode = "MANUAL" | "AUTO";

export type ManualBillingPurpose =
  | "ONBOARDING"
  | "RENEWAL"
  | "ADDITIONAL_COMPANY";

export type ManualBillingCheckoutStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "expired";

export type BillingPlanPrice = {
  amountInCents: number | null;
  compareAtInCents: number | null;
  isRemoteReady: boolean;
};

export type BillingPlan = {
  code: string;
  name: string;
  description: string | null;
  currency: string;
  scope: BillingPlanScope;
  trialDays: number;
  pricing: {
    monthly: BillingPlanPrice;
    yearly: BillingPlanPrice;
  };
};

export type BillingCustomer = {
  id: number;
  email: string | null;
  name: string | null;
  phone: string | null;
  externalCustomerId: string | null;
};

export type BillingPaymentMethod = {
  id: number;
  type: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
  externalPaymentMethodId: string;
  company?: {
    id: number;
    name: string;
  };
  subscription?: {
    id: number;
    status: string;
    plan: {
      code: string;
      name: string;
    };
  } | null;
};

export type BillingInvoice = {
  id: number;
  externalInvoiceId: string;
  externalPaymentIntentId: string | null;
  status: string;
  billingReason: string | null;
  currency: string | null;
  amountDueInCents: number | null;
  amountPaidInCents: number | null;
  dueAt: string | null;
  paidAt: string | null;
  finalizedAt: string | null;
  periodStartAt: string | null;
  periodEndAt: string | null;
};

export type CompanySubscription = {
  id: number;
  status: string;
  billingCycle: BillingCycleApi;
  billingProvider: string;
  startsAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStartAt: string | null;
  nextBillingAt: string | null;
  endsAt: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  failureCode: string | null;
  failureMessage: string | null;
  providerReferences: {
    customerId: string | null;
    subscriptionId: string | null;
    planId: string | null;
    paymentMethodId: string | null;
    latestInvoiceId: string | null;
    latestPaymentIntentId: string | null;
  };
  plan: {
    code: string;
    name: string;
    description: string | null;
    currency: string;
    trialDays: number;
    monthlyPriceInCents: number | null;
    yearlyPriceInCents: number | null;
  };
  billingCustomer: BillingCustomer | null;
  paymentMethods: BillingPaymentMethod[];
  invoices: BillingInvoice[];
};

export type BillingPlansResponse = {
  plans: BillingPlan[];
};

export type BillingPaymentMethodsResponse = {
  paymentMethods: BillingPaymentMethod[];
};

export type CurrentSubscriptionResponse = {
  subscription: CompanySubscription | null;
};

export type BillingSubscriptionSetupResponse = BillingPlansResponse &
  CurrentSubscriptionResponse;

export type SubscribeCompanyRequest = {
  planCode: string;
  billingCycle: BillingCycleApi;
};

export type SubscribeCompanyResponse = {
  message: string;
  subscription: CompanySubscription;
};

export type AttachPaymentMethodRequest = {
  paymentMethodId: string;
};

export type AttachPaymentMethodResponse = {
  message: string;
  subscription: CompanySubscription;
  paymentIntent: {
    id: string | null;
    status: string | null;
    redirectUrl: string | null;
  };
};

export type CancelSubscriptionRequest = {
  cancelAtPeriodEnd?: boolean;
};

export type CancelSubscriptionResponse = {
  message: string;
  subscription: CompanySubscription;
};

export type BillingPaymentFormValues = {
  cardholderName: string;
  billingEmail: string;
  contactNumber: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  billingAddress: string;
};

export type BillingPaymentFormErrors = Partial<
  Record<keyof BillingPaymentFormValues | "planCode", string[]>
>;

export const InitialBillingPaymentFormValues: BillingPaymentFormValues = {
  cardholderName: "",
  billingEmail: "",
  contactNumber: "+63 ",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvc: "",
  billingAddress: "",
};
