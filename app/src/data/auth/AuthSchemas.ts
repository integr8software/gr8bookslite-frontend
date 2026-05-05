import { z } from "zod";

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

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
