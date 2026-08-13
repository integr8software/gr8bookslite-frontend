export type OnboardingApiBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY";

export type OnboardingLogo = {
  fileName: string;
  mimeType: string;
  storagePath: string;
  publicUrl: string;
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

export type OnboardingBilling = {
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

export type OnboardingPaymentSetupState = "ready_for_confirmation";

export type OnboardingPaymentIntent = {
  id: string | null;
  status: string | null;
  redirectUrl: string | null;
};
