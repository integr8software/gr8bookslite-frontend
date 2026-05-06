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

export const OnboardingIndustryOptions = [
  "Accounting",
  "Construction",
  "Education",
  "Healthcare",
  "Information Technology",
  "Manufacturing",
  "Retail",
] as const;

export const OnboardingCompanySizeOptions = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
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
