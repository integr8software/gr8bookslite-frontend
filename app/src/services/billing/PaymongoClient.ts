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

export async function CreatePaymongoCardPaymentMethod(
  values: BillingPaymentFormValues,
) {
  const publicKey = GetPaymongoPublicKey();
  const response = await axios.post(
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
