import type { ReactNode } from "react";
import { CreditCard } from "lucide-react";
import cardImages from "react-payment-inputs/images";

type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "jcb"
  | "dinersclub"
  | "unknown";

export function GetOnboardingCardBrand(value: string): CardBrand {
  const digits = value.replace(/\D/g, "");

  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return "discover";
  if (/^35/.test(digits)) return "jcb";
  if (/^(30[0-5]|36|38|39)/.test(digits)) return "dinersclub";

  return "unknown";
}

const CardBrandLabels: Record<Exclude<CardBrand, "unknown">, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  jcb: "JCB",
  dinersclub: "Diners Club",
};

export function OnboardingCardBrand({ value }: { value: string }) {
  const brand = GetOnboardingCardBrand(value);

  if (brand === "unknown") {
    return (
      <span
        className="flex h-7 w-10 items-center justify-center rounded border border-darknavy/10 bg-offwhite text-darknavy/35"
        aria-label="Card type"
        title="Card type"
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  const label = CardBrandLabels[brand];

  if (brand === "amex") {
    return <AmericanExpressLogo />;
  }

  return (
    <svg
      viewBox="0 0 24 16"
      role="img"
      aria-label={label}
      className="h-8 w-12 drop-shadow-sm"
    >
      {cardImages[brand] as ReactNode}
    </svg>
  );
}

function AmericanExpressLogo() {
  return (
    <svg
      viewBox="0 0 64 40"
      role="img"
      aria-label="American Express"
      className="h-8 w-13 drop-shadow-sm"
    >
      <rect width="64" height="40" rx="5" fill="#006FCF" />
      <rect
        x="2"
        y="2"
        width="60"
        height="36"
        rx="4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="18"
        fill="#fff"
        fontSize="9"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="-0.4"
      >
        AMERICAN
      </text>
      <text
        x="32"
        y="29"
        fill="#fff"
        fontSize="10"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}
