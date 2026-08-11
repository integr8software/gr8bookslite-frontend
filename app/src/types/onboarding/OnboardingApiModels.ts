export type OnboardingApiBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY";

export type OnboardingLogoPayload = {
  message: string;
  logo: {
    fileName: string;
    mimeType: string;
    storagePath: string;
    publicUrl: string;
  };
};

export type OnboardingPlanPriceSummary = {
  amountInCents: number;
  display: string;
};

export type OnboardingPlan = {
  code: string;
  name: string;
  description: string | null;
  trialDays: number;
  pricing: {
    monthly: OnboardingPlanPriceSummary;
    yearly: OnboardingPlanPriceSummary;
    monthlyCompareAt: OnboardingPlanPriceSummary | null;
    yearlyCompareAt: OnboardingPlanPriceSummary | null;
  };
  prices: Array<{
    id: number;
    billingCycle: OnboardingApiBillingCycle;
    intervalCount: number;
    intervalUnit: string;
    amountInCents: number;
    display: string;
    compareAtInCents: number | null;
    compareAtDisplay: string | null;
    isActive: boolean;
  }>;
  usageRules: Array<{
    id: number;
    metric: string;
    freeCount: number;
    unitPriceInCents: number;
    unitPriceDisplay: string;
    isActive: boolean;
  }>;
  discountTiers: Array<{
    id: number;
    metric: string;
    thresholdCount: number;
    discountPercent: number;
    isActive: boolean;
  }>;
  moduleKeys: string[];
  modules: Array<{
    id: number;
    moduleKey: string;
    name: string;
    isEnabled: boolean;
  }>;
};

export type OnboardingPlansPayload = {
  plans: OnboardingPlan[];
};

export type OnboardingDraftCompanyDetails = {
  taxpayerType: "individual" | "non-individual" | null;
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  companyName: string | null;
  nonIndividualType: string | null;
  nonIndividualTypeOther: string | null;
  logoName: string | null;
  logoMimeType: string | null;
  logoStoragePath: string | null;
  logoPublicUrl: string | null;
  address: string | null;
  countryCode: string | null;
  baseCurrencyCode: string | null;
  tin: string | null;
  companyEmail: string | null;
  website: string | null;
  contactNumber: string | null;
  reportStartDate: string | null;
  reportEndDate: string | null;
};

export type OnboardingDraft = {
  plan: OnboardingPlan | null;
  billingCycle: OnboardingApiBillingCycle | null;
  cardholderName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  cardExpiryMonth: number | null;
  cardExpiryYear: number | null;
  hasBillingSetup: boolean;
  hasCompanyDetails: boolean;
  planSelectedAt: string | null;
  billingCompletedAt: string | null;
  companyDetails: OnboardingDraftCompanyDetails;
};

export type OnboardingDraftPayload = {
  draft: OnboardingDraft | null;
};

export type OnboardingBillingPayload = {
  message: string;
  billing: {
    planCode: string | null;
    billingCycle: OnboardingApiBillingCycle | null;
    cardholderName: string | null;
    billingEmail: string | null;
    billingAddress: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    cardExpiryMonth: number | null;
    cardExpiryYear: number | null;
    plan: OnboardingPlan | null;
    trialDays: number;
  };
  pendingProviderActivation?: boolean;
  paymentSetupState?:
    | "pending_provider_activation"
    | "ready_for_confirmation";
  paymentIntent?: {
    id: string | null;
    status: string | null;
    redirectUrl: string | null;
  } | null;
  nextStep: string;
};

export type OnboardingCompletionPayload = {
  message: string;
  company: {
    id: number;
    name: string;
    status: string;
  };
  subscription: {
    id: number;
    status: string;
    trialEndsAt: string | null;
  };
  nextStep: "APP_READY";
  requiresReauthentication: boolean;
  accessToken?: string;
};
