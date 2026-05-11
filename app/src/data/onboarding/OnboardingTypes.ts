import {
  GetCalendarYearReportDates,
  OnboardingReportYearBasisOptions,
} from "./OnboardingData";

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
    | "accountFirstName"
    | "accountLastName"
    | "workEmail"
    | "role"
    | "password"
    | "confirmPassword",
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
  reportYearBasis: OnboardingReportYearBasis;
  reportStartDate: string;
  reportEndDate: string;
  // Step 2 - account
  accountFirstName: string;
  accountLastName: string;
  workEmail: string;
  role: string;
  password: string;
  confirmPassword: string;
  cardholderName: string;
  billingEmail: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  billingAddress: string;
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
  reportYearBasis: "Calendar Year",
  reportStartDate: DefaultReportYear.reportStartDate,
  reportEndDate: DefaultReportYear.reportEndDate,
  accountFirstName: "",
  accountLastName: "",
  workEmail: "",
  role: "",
  password: "",
  confirmPassword: "",
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
