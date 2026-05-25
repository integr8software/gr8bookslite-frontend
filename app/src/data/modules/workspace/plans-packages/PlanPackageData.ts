import { MainCompanyNavigationSections } from "@/app/src/data/shared/main-layout/sidebar/SidebarNavigationData";
import type {
  MainNavigationItem,
  MainNavigationSection,
  MainProductKey,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type {
  PlanPackageAddOnPricingRecord,
  PlanPackageBillingPreviewResult,
  PlanPackageBillingPreviewValues,
  PlanPackageModuleGroup,
  PlanPackageModuleOption,
  PlanPackagePlanFormValues,
  PlanPackagePlanRecord,
} from "@/app/src/types/modules/workspace/plans-packages/PlanPackageTypes";

export const PlanPackageModuleGroups = createModuleGroupsFromNavigation(
  MainCompanyNavigationSections,
);

export const InitialPlanPackagePlans: PlanPackagePlanRecord[] = [
  {
    id: "plan-accounting",
    code: "ACCOUNTING",
    name: "Accounting",
    description:
      "Accounting workflows for cash, payable, journal, sales, financial maintenance, and reports.",
    productKeys: ["core", "accounting"],
    monthlyPrice: 399,
    yearlyPrice: 3990,
    includedUsers: 1,
    status: "Active",
    enabledModuleKeys: getDefaultPlanModuleKeys(["core", "accounting"]),
  },
  {
    id: "plan-inventory",
    code: "INVENTORY",
    name: "Inventory",
    description:
      "Inventory, purchasing, warehouse maintenance, stock movement, and inventory reporting.",
    productKeys: ["core", "inventory"],
    monthlyPrice: 399,
    yearlyPrice: 3990,
    includedUsers: 1,
    status: "Active",
    enabledModuleKeys: getDefaultPlanModuleKeys(["core", "inventory"]),
  },
  {
    id: "plan-accounting-inventory",
    code: "ACCOUNTING_INVENTORY",
    name: "Accounting + Inventory",
    description:
      "Full operating package with accounting, inventory, purchasing, reports, and shared maintenance.",
    productKeys: ["core", "accounting", "inventory"],
    monthlyPrice: 499,
    yearlyPrice: 4990,
    includedUsers: 1,
    status: "Active",
    enabledModuleKeys: getDefaultPlanModuleKeys([
      "core",
      "accounting",
      "inventory",
    ]),
  },
];

export const InitialPlanPackageAddOns: PlanPackageAddOnPricingRecord[] = [
  {
    id: "addon-company",
    code: "ADDITIONAL_COMPANY",
    name: "Additional Company",
    description: "Tenant company expansion under the same subscriber account.",
    unitLabel: "company",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    isActive: true,
  },
  {
    id: "addon-branch",
    code: "ADDITIONAL_BRANCH",
    name: "Additional Branch",
    description: "Operating branch with its own TIN, records, and users.",
    unitLabel: "branch",
    monthlyPrice: 75,
    yearlyPrice: 750,
    isActive: true,
  },
  {
    id: "addon-satellite",
    code: "ADDITIONAL_SATELLITE",
    name: "Additional Satellite",
    description: "Satellite site linked to a main branch.",
    unitLabel: "satellite",
    monthlyPrice: 50,
    yearlyPrice: 500,
    isActive: true,
  },
  {
    id: "addon-user",
    code: "ADDITIONAL_USER",
    name: "Additional User",
    description: "User seats beyond the included plan user.",
    unitLabel: "user",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    isActive: true,
  },
];

export const InitialPlanPackageBillingPreviewValues: PlanPackageBillingPreviewValues =
  {
    branches: 2,
    companies: 1,
    satellites: 1,
    users: 3,
  };

export function createPlanPackagePlanFormValues(
  plan: PlanPackagePlanRecord,
): PlanPackagePlanFormValues {
  return {
    description: plan.description,
    enabledModuleKeys: plan.enabledModuleKeys,
    includedUsers: plan.includedUsers,
    monthlyPrice: plan.monthlyPrice,
    status: plan.status,
    yearlyPrice: plan.yearlyPrice,
  };
}

export function updatePlanPackagePlanFromForm(
  plan: PlanPackagePlanRecord,
  values: PlanPackagePlanFormValues,
): PlanPackagePlanRecord {
  return {
    ...plan,
    description: values.description.trim(),
    enabledModuleKeys: values.enabledModuleKeys,
    includedUsers: values.includedUsers,
    monthlyPrice: values.monthlyPrice,
    status: values.status,
    yearlyPrice: values.yearlyPrice,
  };
}

export function formatPlanPackageCurrency(value: number) {
  return `PHP ${value.toLocaleString("en-PH", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

export function calculateBillingPreview({
  addOns,
  plan,
  values,
}: {
  addOns: PlanPackageAddOnPricingRecord[];
  plan: PlanPackagePlanRecord;
  values: PlanPackageBillingPreviewValues;
}): PlanPackageBillingPreviewResult {
  const addOnMap = new Map(addOns.map((addOn) => [addOn.code, addOn]));
  const lineItems = [
    createPreviewLineItem(
      "Additional companies",
      Math.max(0, values.companies - 1),
      addOnMap.get("ADDITIONAL_COMPANY"),
    ),
    createPreviewLineItem(
      "Branches",
      values.branches,
      addOnMap.get("ADDITIONAL_BRANCH"),
    ),
    createPreviewLineItem(
      "Satellites",
      values.satellites,
      addOnMap.get("ADDITIONAL_SATELLITE"),
    ),
    createPreviewLineItem(
      "Additional users",
      Math.max(0, values.users - plan.includedUsers),
      addOnMap.get("ADDITIONAL_USER"),
    ),
  ].filter((lineItem) => lineItem.quantity > 0);
  const addOnTotal = lineItems.reduce(
    (total, lineItem) => total + lineItem.total,
    0,
  );

  return {
    addOnTotal,
    basePrice: plan.monthlyPrice,
    lineItems,
    total: plan.monthlyPrice + addOnTotal,
  };
}

function createModuleGroupsFromNavigation(
  sections: MainNavigationSection[],
): PlanPackageModuleGroup[] {
  return sections
    .map((section) => ({
      key: section.key,
      title: section.title,
      options: flattenModuleItems(section.items, [section.title]),
    }))
    .filter((group) => group.options.length > 0);
}

function flattenModuleItems(
  items: MainNavigationItem[],
  trail: string[],
): PlanPackageModuleOption[] {
  return items.flatMap((item) => {
    const nextTrail = [...trail, item.label];

    if (item.children?.length) {
      return flattenModuleItems(item.children, nextTrail);
    }

    return [
      {
        groupLabel: trail.slice(1).join(" / ") || trail[0] || "Modules",
        href: item.href,
        key: item.key,
        label: item.label,
        productKeys: getNavigationProductKeys(item),
        sectionTitle: trail[0] ?? "Modules",
      },
    ];
  });
}

function getNavigationProductKeys(item: MainNavigationItem): MainProductKey[] {
  return item.productKeys?.length
    ? item.productKeys
    : [item.productKey ?? "core"];
}

function getDefaultPlanModuleKeys(productKeys: MainProductKey[]) {
  return PlanPackageModuleGroups.flatMap((group) =>
    group.options
      .filter((option) =>
        option.productKeys.some((productKey) => productKeys.includes(productKey)),
      )
      .map((option) => option.key),
  );
}

function createPreviewLineItem(
  label: string,
  quantity: number,
  addOn: PlanPackageAddOnPricingRecord | undefined,
) {
  const unitPrice = addOn?.isActive ? addOn.monthlyPrice : 0;

  return {
    label,
    quantity,
    total: quantity * unitPrice,
    unitPrice,
  };
}
