import { z } from "zod";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import {
  GetSyncedReportEndDate,
  IsValidOnboardingDateValue,
  OnboardingMaxImageSizeBytes,
  OnboardingNonIndividualTypeOptions,
  OnboardingReportYearBasisOptions,
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

function GetDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function GetCardBrand(value: string) {
  const digits = GetDigitsOnly(value);

  if (/^3[47]/.test(digits)) return "amex";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  if (/^(35(2[89]|[3-8]))/.test(digits)) return "jcb";
  if (/^(30[0-5]|36|38|39)/.test(digits)) return "diners";

  return "card";
}

function PassesLuhnCheck(value: string) {
  let checksum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    checksum += digit;
    shouldDouble = !shouldDouble;
  }

  return checksum % 10 === 0;
}

const TINSchema = z
  .string()
  .trim()
  .min(1, "TIN is required.")
  .regex(
    /^\d{3}-\d{3}-\d{3}-\d{3}$|^\d{4}-\d{4}-\d{5}$|^\d{9,13}$/,
    "Enter a valid TIN (e.g. 123-456-789-000 or 3242-3424-42432).",
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

export const OnboardingBillingStepSchema = z
  .object({
    cardholderName: RequiredNameSchema("Cardholder name"),
    billingEmail: z.string().trim().email("Enter a valid billing email."),
    cardNumber: z
      .string()
      .trim()
      .min(1, "Card number is required.")
      .refine(
        (value) => /^\d[\d -]*\d$|^\d$/.test(value),
        "Card number can only contain digits, spaces, and hyphens.",
      )
      .refine((value) => {
        const digits = GetDigitsOnly(value);
        return digits.length >= 12 && digits.length <= 19;
      }, "Enter a valid card number.")
      .refine((value) => PassesLuhnCheck(GetDigitsOnly(value)), {
        message: "Enter a valid card number.",
      }),
    expiryMonth: z
      .string()
      .trim()
      .min(1, "Expiry month is required.")
      .refine((value) => /^(0?[1-9]|1[0-2])$/.test(value), {
        message: "Enter a valid expiry month.",
      }),
    expiryYear: z
      .string()
      .trim()
      .min(1, "Expiry year is required.")
      .refine((value) => /^\d{4}$/.test(value), {
        message: "Enter a valid expiry year.",
      }),
    cvc: z
      .string()
      .trim()
      .min(1, "CVC is required.")
      .refine((value) => /^\d{3,4}$/.test(value), {
        message: "Enter a valid CVC.",
      }),
    billingAddress: z
      .string()
      .trim()
      .min(5, "Billing address must be at least 5 characters."),
  })
  .superRefine((data, ctx) => {
    const month = Number(data.expiryMonth);
    const year = Number(data.expiryYear);
    const cardBrand = GetCardBrand(data.cardNumber);
    const expectedCvcPattern =
      cardBrand === "amex" ? /^\d{4}$/ : /^\d{3}$/;

    if (Number.isNaN(month) || Number.isNaN(year)) {
      return;
    }

    if (!expectedCvcPattern.test(data.cvc.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          cardBrand === "amex"
            ? "American Express cards require a 4-digit CVC."
            : "This card requires a 3-digit CVC.",
        path: ["cvc"],
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Card expiry date cannot be in the past.",
        path: ["expiryYear"],
      });
    }
  });

export type OnboardingStepOneInput =
  | z.infer<typeof OnboardingStepOneIndividualSchema>
  | z.infer<typeof OnboardingStepOneNonIndividualSchema>;
export type OnboardingBillingStepInput = z.infer<
  typeof OnboardingBillingStepSchema
>;
