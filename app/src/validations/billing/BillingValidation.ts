import { z } from "zod";
import type {
  BillingPaymentFormErrors,
  BillingPaymentFormValues,
} from "@/app/src/data/billing/BillingTypes";

export const BillingPaymentFormSchema = z.object({
  cardholderName: z.string().trim().min(2, "Cardholder name is required."),
  billingEmail: z.email("Enter a valid billing email address."),
  contactNumber: z
    .string()
    .trim()
    .min(10, "Enter a valid contact number."),
  cardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^\d{13,19}$/.test(value), {
      message: "Enter a valid card number.",
    }),
  expiryMonth: z
    .string()
    .trim()
    .refine((value) => /^(0[1-9]|1[0-2])$/.test(value), {
      message: "Use a valid month in MM format.",
    }),
  expiryYear: z
    .string()
    .trim()
    .refine((value) => /^\d{4}$/.test(value), {
      message: "Use a valid year in YYYY format.",
    }),
  cvc: z
    .string()
    .trim()
    .refine((value) => /^\d{3,4}$/.test(value), {
      message: "Enter a valid CVC.",
    }),
  billingAddress: z
    .string()
    .trim()
    .min(5, "Billing address is required."),
});

export function validateBillingPaymentForm(
  values: BillingPaymentFormValues,
): {
  errors: BillingPaymentFormErrors;
  values?: BillingPaymentFormValues;
} {
  const parsedValues = BillingPaymentFormSchema.safeParse(values);

  if (parsedValues.success) {
    return {
      errors: {},
      values: parsedValues.data,
    };
  }

  return {
    errors: mapZodErrorsToBillingErrors(parsedValues.error.flatten().fieldErrors),
  };
}

function mapZodErrorsToBillingErrors(
  fieldErrors: Record<string, string[] | undefined>,
): BillingPaymentFormErrors {
  return fieldErrors;
}
