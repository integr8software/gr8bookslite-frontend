import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";
import { ChartsOfAccountsHref } from "@/app/src/constants/modules/maintenance/charts-of-accounts/ChartsOfAccountsConstants";

export const MaintenanceSpotlightTutorialOpenEvent =
  "gr8booksneo:maintenance-spotlight-open";

export const MaintenanceAddSpotlightTutorialOpenEvent =
  "gr8booksneo:maintenance-add-spotlight-open";
export const MaintenanceAddDrawerSpotlightTutorialOpenEvent =
  "gr8booksneo:module-drawer-spotlight-open";
export const MaintenanceAddDrawerSpotlightTutorialCloseEvent =
  "gr8booksneo:module-drawer-spotlight-close";

type MaintenanceSpotlightTutorialConfig = {
  readonly addMode: "drawer" | "none" | "route";
  readonly href: string;
  readonly includeCreateStep?: boolean;
  readonly includeFiltersStep?: boolean;
  readonly includeImportStep?: boolean;
  readonly includeRecordActionSteps?: boolean;
  readonly includeTableStep?: boolean;
  readonly label: string;
};

export const MaintenanceSpotlightTutorialConfigs: readonly MaintenanceSpotlightTutorialConfig[] = [
  {
    href: "/maintenance/discount-management",
    addMode: "drawer",
    label: "Discount management",
  },
  {
    href: "/maintenance/responsibility-center",
    addMode: "drawer",
    label: "Responsibility center",
  },
  {
    href: "/maintenance/term-management",
    addMode: "drawer",
    includeImportStep: true,
    includeRecordActionSteps: true,
    label: "Term management",
  },
  {
    href: "/maintenance/inventory-transaction-type",
    addMode: "drawer",
    label: "Inventory transaction type",
  },
  {
    href: "/maintenance/payment-type",
    addMode: "drawer",
    label: "Payment type",
  },
  {
    href: "/maintenance/items",
    addMode: "route",
    label: "Items",
  },
  {
    href: "/maintenance/item-bundles",
    addMode: "route",
    label: "Item bundles",
  },
  {
    href: "/maintenance/item-category",
    addMode: "drawer",
    label: "Item category",
  },
  {
    href: "/maintenance/party-management",
    addMode: "route",
    label: "Party management",
  },
  {
    href: "/maintenance/warehouses",
    addMode: "drawer",
    label: "Warehouse management",
  },
  {
    href: "/maintenance/item-variations",
    addMode: "none",
    label: "Item variations",
  },
  {
    href: "/maintenance/unit-of-measurement",
    addMode: "none",
    label: "Unit of measurement",
  },
  {
    href: "/maintenance/item-promotions",
    addMode: "none",
    label: "Item promotions",
  },
  {
    href: "/maintenance/price-lists",
    addMode: "none",
    label: "Price lists",
  },
  {
    href: "/maintenance/warehouse-access",
    addMode: "none",
    label: "Warehouse access",
  },
  {
    href: "/maintenance/warehouse-storage",
    addMode: "none",
    label: "Warehouse storages",
  },
  {
    href: "/maintenance/warehouse-transfers",
    addMode: "none",
    label: "Warehouse transfers",
  },
  {
    href: "/maintenance/warehouse-stock-inquiry",
    addMode: "none",
    includeCreateStep: false,
    label: "Warehouse stock inquiry",
  },
  {
    href: "/cash-disbursement/disbursement-voucher",
    addMode: "none",
    label: "Disbursement voucher",
  },
  {
    href: "/cash-disbursement/cash-advance",
    addMode: "none",
    label: "Cash advance",
  },
  {
    href: "/cash-disbursement/petty-cash-voucher",
    addMode: "none",
    label: "Petty cash voucher",
  },
  {
    href: "/cash-disbursement/petty-cash-fund-replenishment",
    addMode: "none",
    label: "Petty cash fund replenishment",
  },
  {
    href: "/cash-disbursement/petty-cash-advance-replenishment",
    addMode: "none",
    includeFiltersStep: false,
    includeTableStep: false,
    label: "Petty cash advance replenishment",
  },
  {
    href: "/sales/sales-journal",
    addMode: "none",
    label: "Sales journal",
  },
  {
    href: "/inventory/material-request",
    addMode: "none",
    label: "Material request",
  },
  {
    href: "/purchasing/purchase-request",
    addMode: "none",
    label: "Purchase request",
  },
  {
    href: "/system-administration/approval-management",
    addMode: "none",
    label: "Approval management",
  },
  {
    href: "/system-administration/audit-trail",
    addMode: "none",
    includeCreateStep: false,
    label: "Audit trail",
  },
  {
    href: "/system-administration/transaction-number-setup",
    addMode: "none",
    label: "Transaction number setup",
  },
  {
    href: "/system-administration/multi-currency-setup",
    addMode: "none",
    label: "Multi-currency setup",
  },
];

export const MaintenanceAddSpotlightTutorialConfigs: readonly MaintenanceSpotlightTutorialConfig[] = [
  ...MaintenanceSpotlightTutorialConfigs.filter(
    (config) => config.addMode !== "none",
  ),
  {
    href: ChartsOfAccountsHref,
    addMode: "route",
    label: "Chart of accounts",
  },
];

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
  includeCreateStep = true,
  includeFiltersStep = true,
  includeTableStep = true,
  includeImportStep = false,
  includeRecordActionSteps = false,
  hasRecordActions = false,
  hasRecordEditAction = false,
  hasRecordStatusAction = false,
): readonly SpotlightTourStep[] {
  const steps: SpotlightTourStep[] = [
    {
      key: "header",
      title: `Start with ${label}`,
      description:
        "Use this page to review the module purpose and keep its main actions close at hand.",
      selectors: ["main h1"],
    },
  ];

  if (includeCreateStep) {
    steps.push({
      key: "create",
      title: "Start a new record",
      description:
        "Use the primary action to add another record when your operational setup changes.",
      selectors: [
        "[data-spotlight-id='maintenance-create-record']",
        "main a[href$='/add']",
        "main button[class*='bg-coralpink']",
        "main button[class*='bg-darknavy']",
        "main button",
      ],
    });
  }

  if (includeImportStep) {
    steps.push({
      key: "import",
      title: "Import existing records",
      description:
        "Use Import when you need to bring in prepared records from a spreadsheet or copied table data.",
      selectors: [
        "[data-spotlight-id='maintenance-import-records']",
        "main button[aria-label='Import']",
      ],
    });
  }

  if (includeFiltersStep) {
    steps.push({
      key: "filters",
      title: "Narrow the records quickly",
      description:
        "Use search and filters to focus the list before reviewing or updating records.",
      selectors: [
        "[data-spotlight-id='maintenance-table-filters']",
        "main input[type='search']",
        "main select",
      ],
    });

    steps.push({
      key: "table-options",
      title: "Use additional table options",
      description:
        "Save column visibility preferences, export records, or refresh the list when you need the latest setup data.",
      selectors: [
        "[data-spotlight-id='maintenance-table-options']",
        "main button[aria-label='Columns']",
        "main button[aria-label='Export']",
        "main button[aria-label='Refresh']",
      ],
    });
  }

  if (includeTableStep) {
    steps.push({
      key: "table",
      title: "Manage records from the table",
      description:
        "Review the available setup records and use their actions to open, edit, or update the entries you need.",
      selectors: ["main table"],
    });
  }

  if (includeRecordActionSteps) {
    if (hasRecordActions) {
      steps.push({
        key: "record-view",
        title: "Review a record",
        description:
          "Use View to inspect an existing record without changing its saved details.",
        selectors: [
          "[data-spotlight-id='maintenance-record-view']",
          "[data-spotlight-id='maintenance-record-actions']",
        ],
      });

      if (hasRecordEditAction) {
        steps.push({
          key: "record-edit",
          title: "Edit an existing record",
          description:
            "Use Edit when the selected record needs updated setup details.",
          selectors: [
            "[data-spotlight-id='maintenance-record-edit']",
            "[data-spotlight-id='maintenance-record-actions']",
          ],
        });
      }

      if (hasRecordStatusAction) {
        steps.push({
          key: "record-status",
          title: "Activate or deactivate records",
          description:
            "Use the status action to activate records that should be available, or deactivate records that should no longer be selected.",
          selectors: [
            "[data-spotlight-id='maintenance-record-status']",
            "[data-spotlight-id='maintenance-record-actions']",
          ],
        });
      }
    } else {
      steps.push({
        key: "empty-records",
        title: "Start with your first record",
        description:
          "There are no rows to edit or activate yet. Add a record first, or import prepared records when you already have setup data.",
        selectors: [
          "[data-spotlight-id='maintenance-create-record']",
          "[data-spotlight-id='maintenance-import-records']",
          "[data-spotlight-id='maintenance-empty-records']",
          "main table",
        ],
      });
    }
  }

  return steps;
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
  includeImportStep = false,
  includeRecordActionSteps = false,
  hasRecordActions = false,
  hasRecordEditAction = false,
  hasRecordStatusAction = false,
): readonly SpotlightTourStep[] {
  return [
    ...createMaintenanceSpotlightTutorialSteps(
      label,
      true,
      true,
      true,
      includeImportStep,
      includeRecordActionSteps,
      hasRecordActions,
      hasRecordEditAction,
      hasRecordStatusAction,
    ),
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
      selectors: ["[data-spotlight-id='module-drawer']"],
    },
    {
      key: "add-drawer-fields",
      title: "Complete the setup details",
      description:
        "Fill in the required fields and review the available options for the new maintenance record.",
      selectors: ["[data-spotlight-id='module-drawer-fields']"],
    },
    {
      key: "add-drawer-save",
      title: "Save the new record",
      description:
        "Save the drawer when the setup information is ready. The new entry will appear back in the maintenance list.",
      selectors: ["[data-spotlight-id='module-drawer-save']"],
    },
  ];
}



