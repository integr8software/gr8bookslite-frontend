import {
  GetCalendarYearReportDates,
  OnboardingReportYearBasisOptions,
} from "@/app/src/data/onboarding/OnboardingData";
import type { BillingCycle, PricingPlan } from "@/app/src/data/pricing/PricingData";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";

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
    | "countryCode"
    | "baseCurrencyCode"
    | "tin"
    | "companyEmail"
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
    | "billingAddress"
    | "billingMode",
    string[] | undefined
  >
>;

export type OnboardingValues = {
  taxpayerType: OnboardingTaxpayerType;
  lastName: string;
  firstName: string;
  middleName: string;
  companyName: string;
  nonIndividualType: string;
  nonIndividualTypeOther: string;
  address: string;
  countryCode: string;
  baseCurrencyCode: string;
  tin: string;
  companyEmail: string;
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
  billingMode: BillingMode;
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
  countryCode: "PH",
  baseCurrencyCode: "PHP",
  tin: "",
  companyEmail: "",
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
  billingMode: "MANUAL",
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
