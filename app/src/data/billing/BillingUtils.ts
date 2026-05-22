import type {
  BillingCycle,
  BillingCycleApi,
  BillingPlan,
  BillingPlanPrice,
} from "./BillingTypes";

export function GetBillingCycleApiValue(
  billingCycle: BillingCycle,
): BillingCycleApi {
  return billingCycle === "yearly" ? "YEARLY" : "MONTHLY";
}

export function GetBillingCycleLabel(billingCycle: BillingCycle) {
  return billingCycle === "yearly" ? "Yearly" : "Monthly";
}

export function GetBillingCycleFromApiValue(
  billingCycle: BillingCycleApi | null | undefined,
): BillingCycle {
  return billingCycle === "YEARLY" ? "yearly" : "monthly";
}

export function FormatBillingPrice(
  amountInCents: number | null | undefined,
  currency = "PHP",
) {
  if (amountInCents == null) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

export function FormatBillingDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function GetPlanPriceForCycle(
  plan: BillingPlan,
  billingCycle: BillingCycle,
): BillingPlanPrice {
  return billingCycle === "yearly" ? plan.pricing.yearly : plan.pricing.monthly;
}

export function GetStatusTone(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-citron/25 text-darknavy";
    case "trialing":
      return "bg-skyblue/20 text-darknavy";
    case "past_due":
    case "unpaid":
      return "bg-coralpink/18 text-darknavy";
    default:
      return "bg-darknavy/8 text-darknavy";
  }
}
