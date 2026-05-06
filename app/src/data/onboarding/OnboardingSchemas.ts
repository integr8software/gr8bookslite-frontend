import { z } from "zod";
import {
  OnboardingCompanySizeOptions,
  OnboardingDepartmentOptions,
  OnboardingIndustryOptions,
  OnboardingMaxImageSizeBytes,
} from "./OnboardingData";

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least 1 uppercase letter.")
  .regex(/[a-z]/, "Password must include at least 1 lowercase letter.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least 1 special character.");

export const OnboardingStepOneSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters."),
  industry: z.enum(OnboardingIndustryOptions, {
    error: "Select an industry.",
  }),
  companySize: z.enum(OnboardingCompanySizeOptions, {
    error: "Select a company size.",
  }),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) =>
        value === "" ||
        z.url({ protocol: /^https?$/ }).safeParse(value).success,
      "Enter a valid website URL.",
    ),
  contactNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid contact number."),
  attachment: z
    .instanceof(File, { message: "Upload an image attachment." })
    .refine((file) => file.size > 0, "Upload an image attachment.")
    .refine((file) => file.type.startsWith("image/"), "Only image files are allowed.")
    .refine(
      (file) => file.size <= OnboardingMaxImageSizeBytes,
      "Image must be 5MB or smaller.",
    ),
});

export const OnboardingStepTwoSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
    workEmail: z.string().trim().email("Enter a valid work email."),
    department: z.enum(OnboardingDepartmentOptions, {
      error: "Select a department.",
    }),
    password: PasswordSchema,
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export type OnboardingStepOneInput = z.infer<typeof OnboardingStepOneSchema>;
export type OnboardingStepTwoInput = z.infer<typeof OnboardingStepTwoSchema>;
