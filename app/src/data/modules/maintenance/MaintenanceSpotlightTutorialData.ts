import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const MaintenanceSpotlightTutorialOpenEvent =
  "gr8booksneo:maintenance-spotlight-open";

type MaintenanceSpotlightTutorialConfig = {
  href: string;
  label: string;
};

export const MaintenanceSpotlightTutorialConfigs = [
  {
    href: "/maintenance/financial-management/discount-management",
    label: "Discount management",
  },
  {
    href: "/maintenance/financial-management/responsibility-center",
    label: "Responsibility center",
  },
  {
    href: "/maintenance/financial-management/term-management",
    label: "Term management",
  },
  {
    href: "/maintenance/financial-management/transaction-type",
    label: "Transaction type",
  },
  {
    href: "/maintenance/form-signatory",
    label: "Form signatory",
  },
  {
    href: "/maintenance/item-management/items",
    label: "Items",
  },
  {
    href: "/maintenance/item-management/item-category",
    label: "Item category",
  },
  {
    href: "/maintenance/item-management/item-subcategory",
    label: "Item subcategory",
  },
  {
    href: "/maintenance/item-management/item-type",
    label: "Item type",
  },
  {
    href: "/maintenance/item-management/item-subtype",
    label: "Item subtype",
  },
  {
    href: "/maintenance/party-management",
    label: "Party management",
  },
  {
    href: "/maintenance/warehouse-management",
    label: "Warehouse management",
  },
] as const satisfies readonly MaintenanceSpotlightTutorialConfig[];

export function getMaintenanceSpotlightTutorialConfig(href: string) {
  return (
    MaintenanceSpotlightTutorialConfigs.find((config) => config.href === href) ??
    null
  );
}

export function createMaintenanceSpotlightTutorialStorageKey(href: string) {
  return `gr8booksneo.spotlightTutorial.v1.${href}`;
}

export function createMaintenanceSpotlightTutorialSteps(
  label: string,
): readonly SpotlightTourStep[] {
  return [
    {
      key: "header",
      title: `Start with ${label}`,
      description:
        "Use this maintenance page to review the module purpose and keep its main setup actions close at hand.",
      selectors: ["main h1"],
    },
    {
      key: "create",
      title: "Create a new setup record",
      description:
        "Use the primary action to add another maintenance record when your operational setup changes.",
      selectors: [
        "main a[href$='/add']",
        "main button[class*='bg-coralpink']",
        "main button[class*='bg-darknavy']",
        "main button",
      ],
    },
    {
      key: "filters",
      title: "Narrow the records quickly",
      description:
        "Use search and filters to focus the list before reviewing or updating maintenance records.",
      selectors: [
        "main input[type='search']",
        "main select",
      ],
    },
    {
      key: "table",
      title: "Manage records from the table",
      description:
        "Review the available setup records and use their actions to open, edit, or update the entries you need.",
      selectors: ["main table"],
    },
  ];
}
