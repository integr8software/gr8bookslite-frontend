import { CreditCard } from "lucide-react";

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

  switch (brand) {
    case "visa":
      return <CardLogo label={label} background="#1434CB" text="VISA" />;
    case "mastercard":
      return <MastercardLogo />;
    case "amex":
      return <AmericanExpressLogo />;
    case "discover":
      return <CardLogo label={label} background="#F58220" text="DISC" />;
    case "jcb":
      return <CardLogo label={label} background="#0B6CB8" text="JCB" />;
    case "dinersclub":
      return <CardLogo label={label} background="#0079BE" text="DINERS" />;
  }
}

function CardLogo({
  background,
  label,
  text,
}: {
  background: string;
  label: string;
  text: string;
}) {
  return (
    <svg
      viewBox="0 0 64 40"
      role="img"
      aria-label={label}
      className="h-8 w-12 drop-shadow-sm"
    >
      <rect width="64" height="40" rx="5" fill={background} />
      <rect
        x="2"
        y="2"
        width="60"
        height="36"
        rx="4"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="25"
        fill="#fff"
        fontSize={text.length > 4 ? "10" : "14"}
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="0"
      >
        {text}
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg
      viewBox="0 0 64 40"
      role="img"
      aria-label="Mastercard"
      className="h-8 w-12 drop-shadow-sm"
    >
      <rect width="64" height="40" rx="5" fill="#252525" />
      <circle cx="27" cy="20" r="11" fill="#EB001B" />
      <circle cx="37" cy="20" r="11" fill="#F79E1B" fillOpacity="0.9" />
      <text
        x="32"
        y="34"
        fill="#fff"
        fontSize="6"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="0"
      >
        Mastercard
      </text>
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
        letterSpacing="0"
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
        letterSpacing="0"
      >
        EXPRESS
      </text>
    </svg>
  );
}
