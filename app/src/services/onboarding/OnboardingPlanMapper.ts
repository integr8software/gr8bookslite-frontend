import type { PricingPlan } from "@/app/src/data/pricing/PricingTypes";
import type { OnboardingDraftPlan } from "@/app/src/services/onboarding/OnboardingApiTypes";

function getUserRule(plan: OnboardingDraftPlan) {
  return plan.usageRules.find((rule) => rule.metric === "USER");
}

function getModuleFeature(plan: OnboardingDraftPlan) {
  const moduleKeys = plan.moduleKeys.map((moduleKey) =>
    moduleKey.toLowerCase(),
  );
  const hasAccounting = moduleKeys.some((moduleKey) =>
    moduleKey.includes("account"),
  );
  const hasInventory = moduleKeys.some((moduleKey) =>
    moduleKey.includes("inventory"),
  );

  if (hasAccounting && hasInventory) {
    return "Accounting and inventory modules";
  }

  if (hasAccounting) {
    return "Accounting modules";
  }

  if (hasInventory) {
    return "Inventory modules";
  }

  return plan.description || "Configured modules";
}

function getBillingLabel(plan: OnboardingDraftPlan, cycle: "month" | "year") {
  const freeUsers = getUserRule(plan)?.freeCount ?? 0;
  const userLabel =
    freeUsers > 0
      ? `${freeUsers} user${freeUsers === 1 ? "" : "s"} included`
      : "Users billed as add-ons";

  return `Per company/${cycle}, ${userLabel}`;
}

function getFeatures(plan: OnboardingDraftPlan) {
  const userRule = getUserRule(plan);
  const features = [
    { label: getModuleFeature(plan) },
    {
      label:
        userRule && userRule.freeCount > 0
          ? `${userRule.freeCount} included user${
              userRule.freeCount === 1 ? "" : "s"
            }`
          : "User access configured by plan",
    },
  ];

  if (userRule && userRule.unitPriceInCents > 0) {
    features.push({
      label: `Additional users at ${userRule.unitPriceDisplay}/user/month`,
    });
  }

  features.push({ label: "Branch and satellite add-ons" });

  return features;
}

export function MapOnboardingPlanToPricingPlan(
  plan: OnboardingDraftPlan,
  index = 0,
): PricingPlan {
  return {
    code: plan.code,
    name: plan.name,
    monthlyPrice: plan.pricing.monthly.display,
    yearlyPrice: plan.pricing.yearly.display,
    monthlyCompareAtPrice: plan.pricing.monthlyCompareAt?.display,
    yearlyCompareAtPrice: plan.pricing.yearlyCompareAt?.display,
    billingLabel: {
      monthly: getBillingLabel(plan, "month"),
      yearly: getBillingLabel(plan, "year"),
    },
    ctaLabel: "Get started",
    ctaHref: "/signup",
    features: getFeatures(plan),
    highlighted:
      plan.code === "ACCOUNTING_INVENTORY" ||
      plan.name.toLowerCase().includes("inventory") ||
      index === 1,
    trialDays: plan.trialDays,
  };
}
