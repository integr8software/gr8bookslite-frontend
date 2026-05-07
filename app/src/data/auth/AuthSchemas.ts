import { z } from "zod";
import { OTP_LENGTH } from "./OtpData";

const SignUpPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least 1 uppercase letter.")
  .regex(/\d/, "Password must include at least 1 number.")
  .regex(/[a-z]/, "Password must include at least 1 lowercase letter.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least 1 special character.");

const EmailSchema = z.string().trim().email("Enter a valid email address.");

export const LoginSchema = z.object({
  email: z.string().trim().email("Email or Password is incorrect."),
  password: z.string().min(1, "Email or Password is incorrect."),
});

export const SignUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .regex(
      /^[A-Za-z][A-Za-z\s.'-]*$/,
      "Name must contain letters only.",
    ),
  email: EmailSchema,
  contactNumber: z
    .string()
    .trim()
    .min(1, "Contact number is required.")
    .regex(
      /^\+63\s\d{3}\s\d{3}\s\d{4}$/,
      "Enter a valid contact number in the format.",
    ),
  password: SignUpPasswordSchema,
  confirmPassword: z
    .string()
    .min(8, "Confirm password must be at least 8 characters."),
  termsAccepted: z.boolean(),
})
  .refine((data) => data.termsAccepted, {
    message: "You must agree to the Terms of Service and Privacy Policy.",
    path: ["termsAccepted"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ChangeVerificationEmailSchema = z
  .object({
    currentEmail: z.string().trim().email("Enter a valid email address."),
    newEmail: z.string().trim().email("Enter a valid email address."),
  })
  .refine((data) => data.currentEmail !== data.newEmail, {
    message: "New email must be different.",
    path: ["newEmail"],
  });

const SecurePasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/\d/, "Password must include at least one number.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character.");

export const ResetPasswordSchema = z
  .object({
    password: SecurePasswordSchema,
    confirmPassword: SecurePasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const OtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(OTP_LENGTH, `OTP must be exactly ${OTP_LENGTH} digits.`)
    .regex(/^\d+$/, "OTP must contain only numbers."),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ChangeVerificationEmailInput = z.infer<
  typeof ChangeVerificationEmailSchema
>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type OtpInput = z.infer<typeof OtpSchema>;
