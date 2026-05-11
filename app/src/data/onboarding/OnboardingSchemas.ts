import { z } from "zod";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import {
  GetSyncedReportEndDate,
  IsValidOnboardingDateValue,
  OnboardingMaxImageSizeBytes,
  OnboardingNonIndividualTypeOptions,
  OnboardingReportYearBasisOptions,
  OnboardingRoleOptions,
} from "./OnboardingData";

const NamePattern = /^[A-Za-z]+(?:[ .'-]+[A-Za-z]+)*$/;

function IsValidWebsiteUrl(value: string) {
  const candidate = /^[A-Za-z][A-Za-z\d+\-.]*:\/\//.test(value)
    ? value
    : `https://${value}`;

  try {
    const url = new URL(candidate);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function RequiredNameSchema(label: string) {
  return z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters.`)
    .regex(NamePattern, `${label} must contain letters only.`);
}

function OptionalNameSchema(label: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 2,
      `${label} must be at least 2 characters when provided.`,
    )
    .refine(
      (value) => value === "" || NamePattern.test(value),
      `${label} must contain letters only.`,
    );
}

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least 1 uppercase letter.")
  .regex(/\d/, "Password must include at least 1 number.")
  .regex(/[a-z]/, "Password must include at least 1 lowercase letter.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least 1 special character.");

const TINSchema = z
  .string()
  .trim()
  .min(1, "TIN is required.")
  .regex(
    /^\d{3}-\d{3}-\d{3}-\d{3}$|^\d{9,12}$/,
    "Enter a valid TIN (e.g. 123-456-789-000).",
  );

const ContactNumberSchema = z
  .string()
  .trim()
  .min(1, "Contact number is required.")
  .refine(
    (value) => value === FormatPhilippineContactNumber(value),
    "Enter a valid contact number in the format.",
  );

const LogoSchema = z
  .instanceof(File, { message: "Upload a logo image." })
  .refine((file) => file.size > 0, "Upload a logo image.")
  .refine(
    (file) => file.type.startsWith("image/"),
    "Only image files are allowed.",
  )
  .refine(
    (file) => file.size <= OnboardingMaxImageSizeBytes,
    "Logo must be 5MB or smaller.",
  );

const ReportDateSchema = z
  .string()
  .refine(IsValidOnboardingDateValue, "Select a valid date.");

const SharedStepOneFields = {
  address: z.string().trim().min(5, "Address must be at least 5 characters."),
  tin: TINSchema,
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value === "" || IsValidWebsiteUrl(value),
      "Enter a valid website URL.",
    ),
  contactNumber: ContactNumberSchema,
  logo: LogoSchema,
  reportYearBasis: z.enum(OnboardingReportYearBasisOptions, {
    error: "Select a report year type.",
  }),
  reportStartDate: ReportDateSchema,
  reportEndDate: ReportDateSchema,
};

function ValidateReportYearRange(
  data: {
    reportStartDate: string;
    reportEndDate: string;
  },
  ctx: z.RefinementCtx,
) {
  const syncedEndDate = GetSyncedReportEndDate(data.reportStartDate);

  if (syncedEndDate && data.reportEndDate !== syncedEndDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must sync to a 1-year report period.",
      path: ["reportEndDate"],
    });
  }
}

export const OnboardingStepOneIndividualSchema = z.object({
  taxpayerType: z.literal("individual"),
  lastName: RequiredNameSchema("Last name"),
  firstName: RequiredNameSchema("First name"),
  middleName: OptionalNameSchema("Middle name"),
  ...SharedStepOneFields,
});

export const OnboardingStepOneNonIndividualSchema = z
  .object({
    taxpayerType: z.literal("non-individual"),
    companyName: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters."),
    nonIndividualType: z.enum(OnboardingNonIndividualTypeOptions, {
      error: "Select an organization type.",
    }),
    nonIndividualTypeOther: z.string().optional(),
    ...SharedStepOneFields,
  })
  .refine(
    (data) =>
      data.nonIndividualType !== "Others" ||
      (data.nonIndividualTypeOther &&
        data.nonIndividualTypeOther.trim().length >= 2),
    {
      message: "Please specify the organization type.",
      path: ["nonIndividualTypeOther"],
    },
  );

export const OnboardingStepOneSchema = z
  .discriminatedUnion("taxpayerType", [
    OnboardingStepOneIndividualSchema,
    OnboardingStepOneNonIndividualSchema,
  ])
  .superRefine(ValidateReportYearRange);

export const OnboardingStepTwoSchema = z
  .object({
    accountFirstName: RequiredNameSchema("First name"),
    accountLastName: RequiredNameSchema("Last name"),
    workEmail: z.string().trim().email("Enter a valid work email."),
    role: z.enum(OnboardingRoleOptions, {
      error: "Select a role.",
    }),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export type OnboardingStepOneInput =
  | z.infer<typeof OnboardingStepOneIndividualSchema>
  | z.infer<typeof OnboardingStepOneNonIndividualSchema>;
export type OnboardingStepTwoInput = z.infer<typeof OnboardingStepTwoSchema>;
