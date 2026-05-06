export type OnboardingTaxpayerType = "individual" | "non-individual";

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
    | "accountFirstName"
    | "accountLastName"
    | "workEmail"
    | "department"
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
  // Step 2 - account
  accountFirstName: string;
  accountLastName: string;
  workEmail: string;
  department: string;
  password: string;
  confirmPassword: string;
};

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
  accountFirstName: "",
  accountLastName: "",
  workEmail: "",
  department: "",
  password: "",
  confirmPassword: "",
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
