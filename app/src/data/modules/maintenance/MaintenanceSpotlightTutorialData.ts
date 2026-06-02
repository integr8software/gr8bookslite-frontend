import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";
import { ChartsOfAccountsHref } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";

export const MaintenanceSpotlightTutorialOpenEvent =
  "gr8booksneo:maintenance-spotlight-open";

export const MaintenanceAddSpotlightTutorialOpenEvent =
  "gr8booksneo:maintenance-add-spotlight-open";
export const MaintenanceAddDrawerSpotlightTutorialOpenEvent =
  "gr8booksneo:maintenance-add-drawer-spotlight-open";
export const MaintenanceAddDrawerSpotlightTutorialCloseEvent =
  "gr8booksneo:maintenance-add-drawer-spotlight-close";

type MaintenanceSpotlightTutorialConfig = {
  addMode: "drawer" | "route";
  href: string;
  label: string;
};

export const MaintenanceSpotlightTutorialConfigs = [
  {
    href: "/maintenance/financial-management/discount-management",
    addMode: "drawer",
    label: "Discount management",
  },
  {
    href: "/maintenance/financial-management/responsibility-center",
    addMode: "drawer",
    label: "Responsibility center",
  },
  {
    href: "/maintenance/financial-management/term-management",
    addMode: "drawer",
    label: "Term management",
  },
  {
    href: "/maintenance/financial-management/transaction-type",
    addMode: "drawer",
    label: "Transaction type",
  },
  {
    href: "/maintenance/form-signatory",
    addMode: "route",
    label: "Form signatory",
  },
  {
    href: "/maintenance/item-management/items",
    addMode: "route",
    label: "Items",
  },
  {
    href: "/maintenance/item-management/item-category",
    addMode: "drawer",
    label: "Item category",
  },
  {
    href: "/maintenance/item-management/item-subcategory",
    addMode: "drawer",
    label: "Item subcategory",
  },
  {
    href: "/maintenance/item-management/item-type",
    addMode: "drawer",
    label: "Item type",
  },
  {
    href: "/maintenance/item-management/item-subtype",
    addMode: "drawer",
    label: "Item subtype",
  },
  {
    href: "/maintenance/party-management",
    addMode: "route",
    label: "Party management",
  },
  {
    href: "/maintenance/warehouse-management",
    addMode: "drawer",
    label: "Warehouse management",
  },
] as const satisfies readonly MaintenanceSpotlightTutorialConfig[];

export const MaintenanceAddSpotlightTutorialConfigs = [
  ...MaintenanceSpotlightTutorialConfigs,
  {
    href: ChartsOfAccountsHref,
    addMode: "route",
    label: "Chart of accounts",
  },
] as const satisfies readonly MaintenanceSpotlightTutorialConfig[];

export function getMaintenanceSpotlightTutorialConfig(href: string) {
  return (
    MaintenanceSpotlightTutorialConfigs.find((config) => config.href === href) ??
    null
  );
}

export function getMaintenanceAddSpotlightTutorialConfig(href: string) {
  return (
    MaintenanceAddSpotlightTutorialConfigs.find(
      (config) => href === `${config.href}/add`,
    ) ?? null
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

export function createMaintenanceAddSpotlightTutorialSteps(
  label: string,
): readonly SpotlightTourStep[] {
  return [
    {
      key: "header",
      title: `Add a new ${label} record`,
      description:
        "Use this form to create another maintenance record and keep your operational setup complete.",
      selectors: ["main h1", "main h2"],
    },
    {
      key: "form",
      title: "Complete the setup details",
      description:
        "Fill in the required fields and review the available options before saving the new record.",
      selectors: ["main form"],
    },
    {
      key: "fields",
      title: "Review the important fields",
      description:
        "Use the available inputs, selections, and notes to capture the information needed by this module.",
      selectors: [
        "main form input",
        "main form select",
        "main form textarea",
      ],
    },
    {
      key: "save",
      title: "Save the new record",
      description:
        "Submit the form when the setup details are ready. You can return to the list afterward to review the new entry.",
      selectors: [
        "main button[type='submit']",
        "main form button[type='submit']",
      ],
    },
  ];
}

export function createMaintenanceDrawerSpotlightTutorialSteps(
  label: string,
): readonly SpotlightTourStep[] {
  return [
    ...createMaintenanceSpotlightTutorialSteps(label),
    ...createMaintenanceAddDrawerSpotlightTutorialSteps(label),
  ];
}

export function createMaintenanceAddDrawerSpotlightTutorialSteps(
  label: string,
): readonly SpotlightTourStep[] {
  return [
    {
      key: "add-drawer",
      title: `Add a new ${label} record`,
      description:
        "The Add drawer keeps the new maintenance record close to the list so you can complete the setup without leaving the module.",
      selectors: ["[data-spotlight-id='maintenance-add-drawer']"],
    },
    {
      key: "add-drawer-fields",
      title: "Complete the setup details",
      description:
        "Fill in the required fields and review the available options for the new maintenance record.",
      selectors: ["[data-spotlight-id='maintenance-add-drawer-fields']"],
    },
    {
      key: "add-drawer-save",
      title: "Save the new record",
      description:
        "Save the drawer when the setup information is ready. The new entry will appear back in the maintenance list.",
      selectors: ["[data-spotlight-id='maintenance-add-drawer-save']"],
    },
  ];
}
