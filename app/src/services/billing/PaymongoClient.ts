import axios from "axios";
import type { BillingPaymentFormValues } from "@/app/src/data/billing/BillingTypes";

const DEFAULT_PAYMONGO_API_BASE_URL = "https://api.paymongo.com/v1";

function GetPaymongoPublicKey() {
  const publicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY?.trim();

  if (!publicKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY. Add your PayMongo public key to the frontend env before testing card setup.",
    );
  }

  return publicKey;
}

function GetPaymongoApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_PAYMONGO_API_BASE_URL?.trim() ??
    DEFAULT_PAYMONGO_API_BASE_URL
  );
}

function CreatePaymongoBasicAuthHeader(publicKey: string) {
  return `Basic ${btoa(`${publicKey}:`)}`;
}

function GetPaymongoErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "We could not create the PayMongo payment method right now.";
  }

  const errors = error.response?.data?.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    const primaryError = errors[0];
    const detail =
      typeof primaryError?.detail === "string" ? primaryError.detail : null;
    const sourcePointer =
      typeof primaryError?.source?.pointer === "string"
        ? primaryError.source.pointer
        : null;

    if (
      sourcePointer?.includes("exp_year") ||
      detail?.toLowerCase().includes("exp_year")
    ) {
      return "Expiry year must be this year or no later than 50 years from now.";
    }

    if (detail && sourcePointer) {
      return `${detail} (${sourcePointer})`;
    }

    if (detail) {
      return detail;
    }
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "We could not create the PayMongo payment method right now."
  );
}

export async function CreatePaymongoCardPaymentMethod(
  values: BillingPaymentFormValues,
) {
  const publicKey = GetPaymongoPublicKey();
  let response;

  try {
    response = await axios.post(
      `${GetPaymongoApiBaseUrl()}/payment_methods`,
      {
        data: {
          attributes: {
            type: "card",
            details: {
              card_number: values.cardNumber.replace(/\s+/g, ""),
              exp_month: Number(values.expiryMonth),
              exp_year: Number(values.expiryYear),
              cvc: values.cvc.trim(),
            },
            billing: {
              name: values.cardholderName.trim(),
              email: values.billingEmail.trim(),
              phone: values.contactNumber.trim(),
              // PayMongo billing address requirements can vary by payment method.
              // Confirm the accepted address shape against test-mode responses.
              address: {
                line1: values.billingAddress.trim(),
                country: "PH",
              },
            },
          },
        },
      },
      {
        headers: {
          Authorization: CreatePaymongoBasicAuthHeader(publicKey),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    throw new Error(GetPaymongoErrorMessage(error));
  }

  const paymentMethodId = response.data?.data?.id;

  if (typeof paymentMethodId !== "string" || paymentMethodId.length === 0) {
    throw new Error(
      "PayMongo did not return a payment method id. Please verify the test card details and public key.",
    );
  }

  return {
    paymentMethodId,
    rawResponse: response.data,
  };
}
