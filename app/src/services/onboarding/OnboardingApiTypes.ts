export type OnboardingApiBillingCycle = "MONTHLY" | "YEARLY";

export type OnboardingDraftPlan = {
  code: string;
  name: string;
  description: string | null;
  trialDays: number;
  pricing: {
    currency: string;
    monthly: {
      amountInCents: number;
      display: string;
    };
    yearly: {
      amountInCents: number;
      display: string;
    };
    monthlyCompareAt: {
      amountInCents: number;
      display: string;
    } | null;
    yearlyCompareAt: {
      amountInCents: number;
      display: string;
    } | null;
  };
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
  tin: string | null;
  website: string | null;
  contactNumber: string | null;
  reportStartDate: string | null;
  reportEndDate: string | null;
};

export type OnboardingDraft = {
  plan: OnboardingDraftPlan | null;
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

export type GetOnboardingDraftResponse = {
  draft: OnboardingDraft | null;
};

export type SelectOnboardingPlanRequest = {
  planCode: string;
  billingCycle: OnboardingApiBillingCycle;
};

export type SaveOnboardingBillingRequest = {
  cardholderName: string;
  billingEmail: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  billingAddress: string;
  paymentMethodId: string;
};

export type SaveOnboardingBillingResponse = {
  message: string;
  pendingProviderActivation?: boolean;
  paymentSetupState?: "pending_provider_activation" | "ready_for_confirmation";
  paymentIntent?: {
    id: string | null;
    status: string | null;
    redirectUrl: string | null;
  };
};

export type SaveOnboardingCompanyDetailsRequest = {
  taxpayerType: "individual" | "non-individual";
  lastName?: string;
  firstName?: string;
  middleName?: string;
  companyName?: string;
  nonIndividualType?: string;
  nonIndividualTypeOther?: string;
  logoName: string;
  logoMimeType?: string;
  logoStoragePath?: string;
  logoPublicUrl?: string;
  address: string;
  tin: string;
  website?: string;
  contactNumber: string;
  reportStartDate: string;
  reportEndDate: string;
};

export type CompleteOnboardingResponse = {
  message: string;
  nextStep: "APP_READY";
  requiresReauthentication: boolean;
};

export type UploadOnboardingCompanyLogoResponse = {
  message: string;
  logo: {
    fileName: string;
    mimeType: string;
    storagePath: string;
    publicUrl: string;
  };
};
