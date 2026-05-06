import { z } from "zod";
import { OTP_LENGTH } from "./OtpData";

export const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const SignUpSchema = LoginSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  confirmPassword: z
    .string()
    .min(8, "Confirm password must be at least 8 characters."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match.",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

const SecurePasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/\d/, "Password must include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one symbol.");

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
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type OtpInput = z.infer<typeof OtpSchema>;
