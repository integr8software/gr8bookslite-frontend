import {
  GetCalendarYearReportDates,
  OnboardingReportYearBasisOptions,
} from "@/app/src/data/onboarding/OnboardingData";
import type { BillingCycle, PricingPlan } from "@/app/src/data/pricing/PricingData";

export type OnboardingTaxpayerType = "individual" | "non-individual";
export type OnboardingReportYearBasis =
  (typeof OnboardingReportYearBasisOptions)[number];

export type OnboardingFieldErrors = Partial<
  Record<
    | "taxpayerType"
    | "lastName"
    | "firstName"
    | "middleName"
    | "companyName"
    | "nonIndividualType"
    | "nonIndividualTypeOther"
    | "address"
    | "tin"
    | "website"
    | "logo"
    | "contactNumber"
    | "reportYearBasis"
    | "reportStartDate"
    | "reportEndDate"
    | "cardholderName"
    | "billingEmail"
    | "cardNumber"
    | "expiryMonth"
    | "expiryYear"
    | "cvc"
    | "billingAddress",
    string[] | undefined
  >
>;

export type OnboardingValues = {
  // Step 1 - taxpayer identity
  taxpayerType: OnboardingTaxpayerType;
  // Individual fields
  lastName: string;
  firstName: string;
  middleName: string;
  // Non-individual fields
  companyName: string;
  nonIndividualType: string;
  nonIndividualTypeOther: string;
  // Shared step 1 fields
  address: string;
  tin: string;
  website: string;
  contactNumber: string;
  logoName: string;
  logoFile: File | null;
  logoStoragePath: string;
  logoPublicUrl: string;
  reportYearBasis: OnboardingReportYearBasis;
  reportStartDate: string;
  reportEndDate: string;
  cardholderName: string;
  billingEmail: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  billingAddress: string;
};

export type OnboardingBillingStepProps = {
  values: OnboardingValues;
  errors: OnboardingFieldErrors;
  selectedPlan: PricingPlan | null;
  selectedBillingCycle: BillingCycle;
  isSubmitting: boolean;
  updateValue: (key: keyof OnboardingValues, value: string) => void;
  handleBack: () => void;
  handleNext: () => void;
};

const DefaultReportYear = GetCalendarYearReportDates();

export const InitialOnboardingValues: OnboardingValues = {
  taxpayerType: "individual",
  lastName: "",
  firstName: "",
  middleName: "",
  companyName: "",
  nonIndividualType: "",
  nonIndividualTypeOther: "",
  address: "",
  tin: "",
  website: "",
  contactNumber: "+63 ",
  logoName: "",
  logoFile: null,
  logoStoragePath: "",
  logoPublicUrl: "",
  reportYearBasis: "Calendar Year",
  reportStartDate: DefaultReportYear.reportStartDate,
  reportEndDate: DefaultReportYear.reportEndDate,
  cardholderName: "",
  billingEmail: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvc: "",
  billingAddress: "",
};

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: OnboardingFieldErrors;
};

export const InitialOnboardingActionState: OnboardingActionState = {
  status: "idle",
  message: "",
};
