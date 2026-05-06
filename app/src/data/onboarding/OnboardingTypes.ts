export type OnboardingFieldErrors = Partial<
  Record<
    | "companyName"
    | "industry"
    | "companySize"
    | "website"
    | "contactNumber"
    | "attachment"
    | "firstName"
    | "lastName"
    | "workEmail"
    | "department"
    | "password"
    | "confirmPassword",
    string[] | undefined
  >
>;

export type OnboardingValues = {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  contactNumber: string;
  attachmentName: string;
  attachmentFile: File | null;
  firstName: string;
  lastName: string;
  workEmail: string;
  department: string;
  password: string;
  confirmPassword: string;
};

export const InitialOnboardingValues: OnboardingValues = {
  companyName: "",
  industry: "",
  companySize: "",
  website: "",
  contactNumber: "",
  attachmentName: "",
  attachmentFile: null,
  firstName: "",
  lastName: "",
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
