export const OnboardingSteps = [
  {
    title: "Choose your free trial",
    description: "Review the plans available after your free trial starts",
    currentStep: 1,
    totalSteps: 4,
    progressPercent: 25,
  },
  {
    title: "Company Details",
    description: "Tell us about your organization",
    currentStep: 2,
    totalSteps: 4,
    progressPercent: 50,
  },
  {
    title: "Set up billing",
    description: "Choose how you want to pay once your free trial ends",
    currentStep: 3,
    totalSteps: 4,
    progressPercent: 75,
  },
  {
    title: "Review details",
    description: "Confirm your company details before continuing",
    currentStep: 4,
    totalSteps: 4,
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

export const OnboardingReportYearBasisOptions = ["Calendar Year"] as const;

export const OnboardingPlanComparisonRows = [
  {
    label: "Best for",
    values: [
      "Accounting teams and service businesses",
      "Companies that need accounting plus stock control",
      "Adding another tenant company",
    ],
  },
  {
    label: "Included users",
    values: ["1 user included", "1 user included", "Uses company plan users"],
  },
  {
    label: "Additional users",
    values: [
      "PHP 100/user/month",
      "PHP 100/user/month",
      "Configured per company",
    ],
  },
  {
    label: "Priority support",
    values: [true, true, true],
  },
  {
    label: "Inventory workflows",
    values: [false, true, false],
  },
  {
    label: "Multi-company management",
    values: [false, false, true],
  },
  {
    label: "Branch and satellite add-ons",
    values: ["Configurable", "Configurable", "Configurable"],
  },
] as const;

export const OnboardingMaxImageSizeBytes = 5 * 1024 * 1024;

const OnboardingMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function PadDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function GetOnboardingDateValue(date: Date) {
  return `${date.getFullYear()}-${PadDatePart(
    date.getMonth() + 1,
  )}-${PadDatePart(date.getDate())}`;
}

export function GetOnboardingDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { date, day, month, year };
}

export function IsValidOnboardingDateValue(value: string) {
  return Boolean(GetOnboardingDateParts(value));
}

export function GetCalendarYearReportDates(year = new Date().getFullYear()) {
  return {
    reportStartDate: `${year}-01-01`,
    reportEndDate: `${year}-12-31`,
  };
}

export function GetSyncedReportEndDate(startDate: string) {
  const start = GetOnboardingDateParts(startDate);

  if (!start) return "";

  const endDate = new Date(start.date);
  endDate.setFullYear(endDate.getFullYear() + 1);
  endDate.setDate(endDate.getDate() - 1);

  return GetOnboardingDateValue(endDate);
}

export function GetSyncedReportStartDate(endDate: string) {
  const end = GetOnboardingDateParts(endDate);

  if (!end) return "";

  const startDate = new Date(end.date);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setFullYear(startDate.getFullYear() - 1);

  return GetOnboardingDateValue(startDate);
}

export function IsCalendarYearReportRange(startDate: string, endDate: string) {
  const start = GetOnboardingDateParts(startDate);
  const end = GetOnboardingDateParts(endDate);

  return Boolean(
    start &&
    end &&
    start.month === 1 &&
    start.day === 1 &&
    end.month === 12 &&
    end.day === 31 &&
    start.year === end.year,
  );
}

export function FormatOnboardingReportDateLabel(value: string) {
  const parts = GetOnboardingDateParts(value);

  if (!parts) return "";

  return `${OnboardingMonthNames[parts.month - 1]} ${parts.day}, ${parts.year}`;
}
