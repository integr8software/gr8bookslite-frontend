export const OnboardingSteps = [
  {
    title: "Company Details",
    description: "Tell us about your organisation",
    currentStep: 1,
    totalSteps: 3,
    progressPercent: 33,
  },
  {
    title: "Create your login",
    description: "This will be the user account for your company",
    currentStep: 2,
    totalSteps: 3,
    progressPercent: 67,
  },
  {
    title: "Review details",
    description: "Confirm your company and account details before continuing",
    currentStep: 3,
    totalSteps: 3,
    progressPercent: 100,
  },
] as const;

export const OnboardingNonIndividualTypeOptions = [
  "Partnership",
  "Corporation",
  "Association",
  "Non Stock",
  "Non Profit Organization",
  "Others",
] as const;

export const OnboardingDepartmentOptions = [
  "Administration",
  "Finance",
  "Human Resources",
  "Operations",
  "Sales",
  "Technology",
] as const;

export const OnboardingMaxImageSizeBytes = 5 * 1024 * 1024;
