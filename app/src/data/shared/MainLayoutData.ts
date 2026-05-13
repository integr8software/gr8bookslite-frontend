export type MainAccessAction =
  | "view"
  | "add"
  | "edit"
  | "delete"
  | "cancel"
  | "uncancel";

export type MainAccessKey =
  | "workspace.overview"
  | "workspace.dashboard"
  | "workspace.companies"
  | "workspace.users"
  | "workspace.approval"
  | "workspace.mail"
  | "workspace.audit"
  | "dashboard"
  | "cashReceipt"
  | "cashDisbursement"
  | "accountsPayable"
  | "generalJournal"
  | "sales"
  | "inventory"
  | "purchasing"
  | "canvass"
  | "fixedAsset"
  | "maintenance.chartOfAccounts"
  | "maintenance.bank"
  | "maintenance.currency"
  | "maintenance.party"
  | "maintenance.discount"
  | "maintenance.transactionType"
  | "maintenance.responsibilityCenter"
  | "maintenance.term"
  | "maintenance.mail"
  | "maintenance.item"
  | "maintenance.warehouse"
  | "maintenance.approval"
  | "maintenance.workflow"
  | "maintenance.audit"
  | "maintenance.users"
  | "maintenance.reports"
  | "reports.accounting"
  | "reports.inventory"
  | "settings"
  | "settings.permissions"
  | "settings.notifications"
  | "settings.billing"
  | "branch.management"
  | "profile";

export type MainProductKey = "core" | "accounting" | "inventory";

export type MainNavigationScope = "workspace" | "company";

export type MainPermissionMap = Partial<
  Record<MainAccessKey, Partial<Record<MainAccessAction, boolean>>>
>;

export type MainIconName =
  | "approval"
  | "asset"
  | "branch"
  | "cashIn"
  | "cashOut"
  | "dashboard"
  | "favorite"
  | "inventory"
  | "journal"
  | "maintenance"
  | "payable"
  | "profile"
  | "purchasing"
  | "reports"
  | "sales"
  | "settings";

export type MainNavigationItem = {
  key: string;
  label: string;
  href: string;
  accessKey: MainAccessKey;
  productKey?: MainProductKey;
  productKeys?: MainProductKey[];
  requiredActions?: MainAccessAction[];
  children?: MainNavigationItem[];
};

export type MainNavigationSection = {
  key: string;
  title: string;
  href?: string;
  icon: MainIconName;
  accessKey: MainAccessKey;
  productKey?: MainProductKey;
  productKeys?: MainProductKey[];
  items: MainNavigationItem[];
};

export type MainSearchItem = {
  key: string;
  label: string;
  href: string;
  accessKey: MainAccessKey;
  productKey: MainProductKey;
  productKeys?: MainProductKey[];
  section: string;
  trail: string[];
};

export type MainCompany = {
  id: string;
  name: string;
  helperText?: string;
};

export type MainSubscriptionOption = {
  id: string;
  label: string;
  description: string;
  enabledProductKeys: MainProductKey[];
};

export type MainUserRole = "Super Admin" | "Admin" | "User";

export type MainUserType = {
  id: string;
  name: string;
  permissions: MainPermissionMap;
};

export type MainUserAccessContext = {
  userRole: MainUserRole;
  userType?: MainUserType;
};

export type MainBranch = {
  id: string;
  code: string;
  name: string;
  href: string;
  isMain?: boolean;
  access: Partial<Record<MainAccessAction, boolean>>;
};

export type MainNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  time: string;
  isRead: boolean;
};

export type MainDashboardWidget = {
  id: string;
  title: string;
  value: string;
  supportingText: string;
  tone: "sky" | "citron" | "coral" | "dark";
};

const MainSubscriptionPlans: MainSubscriptionOption[] = [
  {
    id: "lite-suite",
    label: "Lite Suite",
    description: "Core workspace with accounting and inventory enabled.",
    enabledProductKeys: ["core", "accounting", "inventory"],
  },
  {
    id: "core",
    label: "Core",
    description: "Dashboards and maintenance workspace.",
    enabledProductKeys: ["core"],
  },
  {
    id: "accounting",
    label: "Accounting",
    description: "Core workspace plus accounting workflows.",
    enabledProductKeys: ["core", "accounting"],
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Core workspace plus inventory workflows.",
    enabledProductKeys: ["core", "inventory"],
  },
];

export const MainWorkspaceNavigationSections: MainNavigationSection[] = [
  {
    key: "workspace",
    title: "Work Space",
    href: "/workspace",
    icon: "settings",
    accessKey: "workspace.overview",
    items: [
      item(
        "workspace-overview",
        "Overview",
        "/workspace",
        "workspace.overview",
      ),
      item(
        "workspace-dashboard",
        "Dashboard",
        "/workspace/dashboard",
        "workspace.dashboard",
      ),
      item(
        "workspace-companies",
        "Companies",
        "/workspace/companies",
        "workspace.companies",
      ),
      item(
        "workspace-users",
        "User Management",
        "/workspace/user-management",
        "workspace.users",
      ),
      item(
        "workspace-approval",
        "Approval Management",
        "/workspace/approval-management",
        "workspace.approval",
      ),
      item(
        "workspace-mail",
        "Mail Maintenance",
        "/workspace/mail-maintenance",
        "workspace.mail",
      ),
      item(
        "workspace-audit",
        "Audit Logs",
        "/workspace/audit-logs",
        "workspace.audit",
      ),
    ],
  },
];

export const MainCompanyNavigationSections: MainNavigationSection[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    accessKey: "dashboard",
    items: [
      item(
        "dashboard-management",
        "Dashboard Management",
        "/dashboard",
        "dashboard",
      ),
    ],
  },
  {
    key: "maintenance",
    title: "Maintenance",
    href: "/maintenance",
    icon: "maintenance",
    accessKey: "maintenance.chartOfAccounts",
    items: [
      navGroup(
        "maintenance-financial",
        "Financial Management",
        "/maintenance/financial-management",
        "maintenance.chartOfAccounts",
        "accounting",
        [
          child(
            "maintenance-charts-of-accounts",
            "Charts of Accounts",
            "/maintenance/charts-of-accounts",
            "maintenance.chartOfAccounts",
            "accounting",
          ),
          child(
            "maintenance-bank",
            "Bank Management",
            "/maintenance/bank-management",
            "maintenance.bank",
            "accounting",
          ),
          child(
            "maintenance-currency",
            "Multi Currency Setup",
            "/maintenance/multi-currency-setup",
            "maintenance.currency",
            "accounting",
          ),
          multiProductChild(
            "maintenance-discount",
            "Discount Management",
            "/maintenance/discount-management",
            "maintenance.discount",
            ["accounting", "inventory"],
          ),
          child(
            "maintenance-term",
            "Term Management",
            "/maintenance/term-management",
            "maintenance.term",
            "accounting",
          ),
          child(
            "maintenance-transaction-type",
            "Transaction Type",
            "/maintenance/transaction-type",
            "maintenance.transactionType",
            "accounting",
          ),
        ],
      ),
      navGroup(
        "maintenance-inventory-warehouse",
        "Inventory & Warehouse Management",
        "/maintenance/inventory-warehouse-management",
        "maintenance.warehouse",
        "inventory",
        [
          child(
            "maintenance-warehouse",
            "Warehouse Management",
            "/maintenance/warehouse-management",
            "maintenance.warehouse",
            "inventory",
          ),
          child(
            "maintenance-item",
            "Item Management",
            "/maintenance/item-management",
            "maintenance.item",
            "inventory",
          ),
          child(
            "maintenance-item-category",
            "Category",
            "/maintenance/item-management/category",
            "maintenance.item",
            "inventory",
          ),
          child(
            "maintenance-item-sub-category",
            "Sub Category",
            "/maintenance/item-management/sub-category",
            "maintenance.item",
            "inventory",
          ),
          child(
            "maintenance-item-type",
            "Item Type",
            "/maintenance/item-management/item-type",
            "maintenance.item",
            "inventory",
          ),
          child(
            "maintenance-item-sub-type",
            "Sub Item Type",
            "/maintenance/item-management/sub-item-type",
            "maintenance.item",
            "inventory",
          ),
          child(
            "maintenance-item-unit",
            "Unit of Measurement",
            "/maintenance/item-management/unit-of-measurement",
            "maintenance.item",
            "inventory",
          ),
        ],
      ),
      navGroup(
        "maintenance-party-management",
        "Party Management",
        "/maintenance/party-management",
        "maintenance.party",
        "accounting",
        [
          multiProductChild(
            "maintenance-party",
            "Party Management",
            "/maintenance/party-management",
            "maintenance.party",
            ["accounting", "inventory"],
          ),
        ],
        ["accounting", "inventory"],
      ),
    ],
  },
  {
    key: "cash-receipt",
    title: "Cash Receipt",
    icon: "cashIn",
    accessKey: "cashReceipt",
    productKey: "accounting",
    items: [
      item(
        "cash-receipt-official-receipt",
        "Official Receipt",
        "/cash-receipt/official-receipt",
        "cashReceipt",
        "accounting",
      ),
      item(
        "cash-receipt-collection-receipt",
        "Collection Receipt",
        "/cash-receipt/collection-receipt",
        "cashReceipt",
        "accounting",
      ),
      item(
        "cash-receipt-acknowledgement-receipt",
        "Acknowledgement Receipt",
        "/cash-receipt/acknowledgement-receipt",
        "cashReceipt",
        "accounting",
      ),
      item(
        "cash-receipt-provisional-receipt",
        "Provisional Receipt",
        "/cash-receipt/provisional-receipt",
        "cashReceipt",
        "accounting",
      ),
      item(
        "cash-receipt-bank-reconciliation",
        "Bank Reconciliation",
        "/cash-receipt/bank-reconciliation",
        "cashReceipt",
        "accounting",
      ),
      item(
        "cash-receipt-pdc-warehouse",
        "Product Distribution Center Warehouse",
        "/cash-receipt/product-distribution-center-warehouse",
        "cashReceipt",
        "accounting",
      ),
    ],
  },
  {
    key: "cash-disbursement",
    title: "Cash Disbursement",
    icon: "cashOut",
    accessKey: "cashDisbursement",
    productKey: "accounting",
    items: [
      item(
        "cash-disbursement-voucher",
        "Disbursement Voucher",
        "/cash-disbursement/disbursement-voucher",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-cash-advance",
        "Cash Advance",
        "/cash-disbursement/cash-advance",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-cash-advance-multiple",
        "Cash Advance Multiple Entry",
        "/cash-disbursement/cash-advance-multiple-entry",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-petty-cash",
        "Petty Cash Disbursement",
        "/cash-disbursement/petty-cash-disbursement",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-petty-cash-fund",
        "Petty Cash Fund",
        "/cash-disbursement/petty-cash-fund",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-petty-cash-replenishment",
        "Petty Cash Replenishment",
        "/cash-disbursement/petty-cash-replenishment",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-petty-cash-advance",
        "Petty Cash Advance",
        "/cash-disbursement/petty-cash-advance",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-request-payment",
        "Request For Payment",
        "/cash-disbursement/request-for-payment",
        "cashDisbursement",
        "accounting",
      ),
      item(
        "cash-disbursement-advances-to-supplier",
        "Advances To Supplier",
        "/cash-disbursement/advances-to-supplier",
        "cashDisbursement",
        "accounting",
      ),
    ],
  },
  {
    key: "accounts-payable",
    title: "Accounts Payable",
    icon: "payable",
    accessKey: "accountsPayable",
    productKey: "accounting",
    items: [
      item(
        "accounts-payable-voucher",
        "Accounts Payable Voucher",
        "/accounts-payable/voucher",
        "accountsPayable",
        "accounting",
      ),
    ],
  },
  {
    key: "general-journal",
    title: "General Journal",
    icon: "journal",
    accessKey: "generalJournal",
    productKey: "accounting",
    items: [
      item(
        "general-journal-voucher",
        "Journal Voucher",
        "/general-journal/journal-voucher",
        "generalJournal",
        "accounting",
      ),
    ],
  },
  {
    key: "sales",
    title: "Sales",
    icon: "sales",
    accessKey: "sales",
    productKey: "accounting",
    items: [
      item(
        "sales-debit-memo",
        "Debit Memo",
        "/sales/debit-memo",
        "sales",
        "accounting",
      ),
      item(
        "sales-credit-memo",
        "Credit Memo",
        "/sales/credit-memo",
        "sales",
        "accounting",
      ),
      multiProductItem(
        "sales-quotation",
        "Sales Quotation",
        "/sales/sales-quotation",
        "sales",
        ["accounting", "inventory"],
      ),
      multiProductItem(
        "sales-order",
        "Sales Order",
        "/sales/sales-order",
        "sales",
        ["accounting", "inventory"],
      ),
      multiProductItem(
        "sales-invoice",
        "Sales Invoice",
        "/sales/sales-invoice",
        "sales",
        ["accounting", "inventory"],
      ),
      item("sales-billing", "Billing", "/sales/billing", "sales", "accounting"),
      item(
        "sales-billing-statement",
        "Billing Statement",
        "/sales/billing-statement",
        "sales",
        "accounting",
      ),
      item(
        "sales-billing-invoice",
        "Billing Invoice",
        "/sales/billing-invoice",
        "sales",
        "accounting",
      ),
      item(
        "sales-service-invoice",
        "Service Invoice",
        "/sales/service-invoice",
        "sales",
        "accounting",
      ),
      multiProductItem(
        "sales-cash-sales-invoice",
        "Cash Sales Invoice",
        "/sales/cash-sales-invoice",
        "sales",
        ["accounting", "inventory"],
      ),
      multiProductItem(
        "sales-journal",
        "Sales Journal",
        "/sales/sales-journal",
        "sales",
        ["accounting", "inventory"],
      ),
      item(
        "sales-statement-account",
        "Statement of Account",
        "/sales/statement-of-account",
        "sales",
        "accounting",
      ),
    ],
  },
  {
    key: "inventory",
    title: "Inventory",
    icon: "inventory",
    accessKey: "inventory",
    productKey: "inventory",
    items: [
      item(
        "inventory-receiving-report",
        "Receiving Report",
        "/inventory/receiving-report",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-goods-receipt",
        "Goods Receipt",
        "/inventory/goods-receipt",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-account",
        "Inventory Account",
        "/inventory/inventory-account",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-material-request",
        "Material Request",
        "/inventory/material-request",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-pick-list",
        "Pick List",
        "/inventory/pick-list",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-goods-issue",
        "Goods Issue",
        "/inventory/goods-issue",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-delivery-receipt",
        "Delivery Receipt",
        "/inventory/delivery-receipt",
        "inventory",
        "inventory",
      ),
    ],
  },
  {
    key: "purchasing",
    title: "Purchasing",
    icon: "purchasing",
    accessKey: "purchasing",
    productKey: "inventory",
    items: [
      item(
        "purchasing-request",
        "Purchase Request",
        "/purchasing/purchase-request",
        "purchasing",
        "inventory",
      ),
      item(
        "purchasing-canvass-form",
        "Canvass Form",
        "/purchasing/canvass-form",
        "canvass",
        "inventory",
      ),
      item(
        "purchasing-order",
        "Purchase Order",
        "/purchasing/purchase-order",
        "purchasing",
        "inventory",
      ),
      item(
        "purchasing-journal",
        "Purchase Journal",
        "/purchasing/purchase-journal",
        "purchasing",
        "inventory",
      ),
    ],
  },
  {
    key: "others",
    title: "Others",
    icon: "asset",
    accessKey: "fixedAsset",
    productKey: "accounting",
    items: [
      item(
        "fixed-asset-default",
        "Fixed Asset",
        "/fixed-asset",
        "fixedAsset",
        "accounting",
      ),
    ],
  },
  {
    key: "system-administration",
    title: "System Administration",
    icon: "settings",
    accessKey: "maintenance.users",
    items: [
      item(
        "maintenance-users",
        "User Management",
        "/system-administration/user-management",
        "maintenance.users",
      ),
      item(
        "maintenance-approval",
        "Approval Management",
        "/system-administration/approval-management",
        "maintenance.approval",
      ),
      item(
        "maintenance-audit",
        "Audit Trail",
        "/system-administration/audit-trail",
        "maintenance.audit",
      ),
      item(
        "maintenance-mail",
        "Mail Maintenance",
        "/system-administration/mail-maintenance",
        "maintenance.mail",
      ),
    ],
  },
  {
    key: "reporting-analytics",
    title: "Reporting & Analytics",
    icon: "reports",
    accessKey: "reports.accounting",
    items: [
      item(
        "reports-maintenance",
        "Report Maintenance",
        "/reports/maintenance",
        "maintenance.reports",
      ),
      navGroup(
        "reports-financial",
        "Financial Reports",
        "/reports/financial",
        "reports.accounting",
        "accounting",
        [
          child(
            "reports-books-of-accounts",
            "Books of Accounts",
            "/reports/financial/books-of-accounts",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-general-ledger",
            "General Ledger",
            "/reports/financial/general-ledger",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-journal-ledger",
            "Journal Ledger",
            "/reports/financial/journal-ledger",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-trial-balance",
            "Trial Balance",
            "/reports/financial/trial-balance",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-balance-sheet",
            "Balance Sheet",
            "/reports/financial/balance-sheet",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-income-statement",
            "Income Statement",
            "/reports/financial/income-statement",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-cash-flow",
            "Cash Flow Statement",
            "/reports/financial/cash-flow-statement",
            "reports.accounting",
            "accounting",
          ),
          navGroup(
            "reports-accounts-receivable",
            "Accounts Receivable",
            "/reports/financial/accounts-receivable",
            "reports.accounting",
            "accounting",
            [
              child(
                "reports-ar-aging",
                "Aging of Accounts Receivable",
                "/reports/financial/accounts-receivable/aging",
                "reports.accounting",
                "accounting",
              ),
              child(
                "reports-ar-statement",
                "Statement of Account",
                "/reports/financial/accounts-receivable/statement-of-account",
                "reports.accounting",
                "accounting",
              ),
            ],
          ),
        ],
      ),
      navGroup(
        "reports-inventory",
        "Inventory Reports",
        "/reports/inventory",
        "reports.inventory",
        "inventory",
        [
          child(
            "reports-inventory-audit",
            "Inventory Audit",
            "/reports/inventory/audit",
            "reports.inventory",
            "inventory",
          ),
          child(
            "reports-inventory-item-query",
            "Item Query Generator",
            "/reports/inventory/item-query-generator",
            "reports.inventory",
            "inventory",
          ),
          child(
            "reports-inventory-stock-movement",
            "Stock Movement Report",
            "/reports/inventory/stock-movement",
            "reports.inventory",
            "inventory",
          ),
          child(
            "reports-inventory-valuation",
            "Inventory Valuation",
            "/reports/inventory/valuation",
            "reports.inventory",
            "inventory",
          ),
        ],
      ),
      navGroup(
        "reports-bir",
        "BIR Reports",
        "/reports/bir",
        "reports.accounting",
        "accounting",
        [
          child(
            "reports-bir-vat-relief",
            "VAT Relief",
            "/reports/bir/vat-relief",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-bir-alpha-list",
            "Alpha list",
            "/reports/bir/alpha-list",
            "reports.accounting",
            "accounting",
          ),
        ],
      ),
    ],
  },
];

export const MainNavigationSections = MainCompanyNavigationSections;

export const MainLayoutMockData = {
  currentUser: {
    id: "usr-001",
    name: "John Dela Cruz",
    shortName: "John D.",
    initials: "JD",
    userRole: "Super Admin" as MainUserRole,
    userType: {
      id: "user-type-operations-admin",
      name: "Operations Admin",
      permissions: {
        dashboard: { view: true, add: true, edit: true },
        cashReceipt: {
          view: true,
          add: true,
          edit: true,
          cancel: true,
          uncancel: true,
        },
        cashDisbursement: { view: true, add: true, edit: true },
        accountsPayable: { view: true, add: true },
        generalJournal: { view: true, add: true, edit: true },
        sales: { view: true, add: true, edit: true },
        inventory: { view: true, add: true, edit: true },
        purchasing: { view: true, add: true },
        canvass: { view: true },
        fixedAsset: { view: true },
        "maintenance.chartOfAccounts": { view: true, add: true, edit: true },
        "maintenance.bank": { view: true, add: true, edit: true },
        "maintenance.currency": { view: true, edit: true },
        "maintenance.party": { view: true, add: true, edit: true },
        "maintenance.discount": { view: true, add: true, edit: true },
        "maintenance.transactionType": { view: true, edit: true },
        "maintenance.responsibilityCenter": {
          view: true,
          add: true,
          edit: true,
        },
        "maintenance.term": { view: true, add: true, edit: true },
        "maintenance.mail": { view: true, edit: true },
        "maintenance.item": { view: true, add: true, edit: true },
        "maintenance.warehouse": { view: true, add: true },
        "maintenance.approval": { view: true, edit: true },
        "maintenance.workflow": { view: true },
        "maintenance.audit": { view: true },
        "maintenance.users": {
          view: true,
          add: true,
          edit: true,
          delete: false,
        },
        "maintenance.reports": { view: true, edit: true },
        "reports.accounting": { view: true },
        "reports.inventory": { view: true },
        settings: { view: true },
        "settings.permissions": { view: true, edit: true },
        "settings.notifications": { view: true, edit: true },
        "settings.billing": { view: true },
        "branch.management": { view: true, add: true, edit: true },
        profile: { view: true, edit: true },
      } satisfies MainPermissionMap,
    } satisfies MainUserType,
  },
  currentCompany: {
    id: "cmp-001",
    name: "Gr8Books Lite",
  },
  availableCompanies: [
    { id: "cmp-001", name: "Gr8Books Lite", helperText: "Primary company" },
    { id: "cmp-002", name: "Demo Trading Corp.", helperText: "Trading group" },
  ] satisfies MainCompany[],
  activeBranchId: "branch-main",
  activeSubscription: MainSubscriptionPlans[0],
  branches: [
    {
      id: "branch-main",
      code: "MAIN",
      name: "Main Branch",
      href: "/dashboard",
      isMain: true,
      access: { view: true, edit: true },
    },
    {
      id: "branch-north",
      code: "NORTH",
      name: "North Branch",
      href: "/dashboard",
      access: { view: true },
    },
    {
      id: "branch-south",
      code: "SOUTH",
      name: "South Branch",
      href: "/dashboard",
      access: { view: false },
    },
  ] satisfies MainBranch[],
  favoriteNavigationKeys: [
    "dashboard-management",
    "cash-receipt-official-receipt",
    "inventory-receiving-report",
    "maintenance-item",
  ],
  recentlyVisitedNavigationKeys: [
    "maintenance-approval",
    "reports-financial",
    "maintenance-users",
    "dashboard-management",
  ],
  quickListSettings: {
    favorites: true,
    recently: true,
  },
  notifications: [
    {
      id: "notif-001",
      title: "Dashboard Management updated",
      body: "Dashboard widget settings were updated for your role.",
      href: "/dashboard",
      time: "Just now",
      isRead: false,
    },
    {
      id: "notif-002",
      title: "Branch access updated",
      body: "North Branch view access is now available for your role.",
      href: "/settings/branches",
      time: "18m ago",
      isRead: false,
    },
    {
      id: "notif-003",
      title: "Approval rule changed",
      body: "A maintenance approval workflow was updated.",
      href: "/maintenance/approval-management/settings",
      time: "1h ago",
      isRead: true,
    },
    {
      id: "notif-004",
      title: "Subscription reviewed",
      body: "Your Lite Suite subscription details are ready for billing review.",
      href: "/settings/billing",
      time: "Yesterday",
      isRead: true,
    },
  ] satisfies MainNotification[],
  dashboardWidgets: [
    {
      id: "dashboard-widget-001",
      title: "Open approvals",
      value: "14",
      supportingText: "Across all active workflows",
      tone: "coral",
    },
    {
      id: "dashboard-widget-002",
      title: "Shared dashboards",
      value: "6",
      supportingText: "Available to your role",
      tone: "sky",
    },
    {
      id: "dashboard-widget-003",
      title: "Branch scope",
      value: "2",
      supportingText: "Branches visible to you",
      tone: "citron",
    },
    {
      id: "dashboard-widget-004",
      title: "Saved views",
      value: "21",
      supportingText: "Personal and team views",
      tone: "dark",
    },
  ] satisfies MainDashboardWidget[],
};

export const MainWorkspaceSearchItems = flattenSections(
  MainWorkspaceNavigationSections,
);
export const MainCompanySearchItems = flattenSections(
  MainCompanyNavigationSections,
);
export const MainSearchItems = MainCompanySearchItems;

export function hasAccess(
  accessContext: MainUserAccessContext,
  accessKey: MainAccessKey,
  requiredActions?: MainAccessAction[],
) {
  if (accessContext.userRole === "Super Admin") {
    return true;
  }

  const access = accessContext.userType?.permissions[accessKey];

  if (!access) {
    return false;
  }

  if (requiredActions?.length) {
    return requiredActions.every((action) => Boolean(access[action]));
  }

  return Object.values(access).some(Boolean);
}

export function isProductEnabled(
  productKey: MainProductKey | undefined,
  subscription: MainSubscriptionOption,
  productKeys?: MainProductKey[],
) {
  if (productKeys?.length) {
    return productKeys.some((key) =>
      subscription.enabledProductKeys.includes(key),
    );
  }

  return subscription.enabledProductKeys.includes(productKey ?? "core");
}

export function filterMainNavigationSections(
  sections: MainNavigationSection[],
  accessContext: MainUserAccessContext,
  subscription: MainSubscriptionOption,
) {
  return sections
    .map((section) => ({
      ...section,
      items: filterMainNavigationItems(
        section.items,
        accessContext,
        subscription,
      ),
    }))
    .filter(
      (section) =>
        (hasAccess(accessContext, section.accessKey) &&
          isProductEnabled(
            section.productKey,
            subscription,
            section.productKeys,
          )) ||
        section.items.length > 0,
    )
    .filter((section) => section.items.length > 0);
}

export function filterMainSearchItems(
  items: MainSearchItem[],
  accessContext: MainUserAccessContext,
  subscription: MainSubscriptionOption,
) {
  return items.filter(
    (item) =>
      hasAccess(accessContext, item.accessKey) &&
      isProductEnabled(item.productKey, subscription, item.productKeys),
  );
}

export function getAccessibleBranches(branches: MainBranch[]) {
  return branches.filter((branch) =>
    Object.values(branch.access).some(Boolean),
  );
}

function filterMainNavigationItems(
  items: MainNavigationItem[],
  accessContext: MainUserAccessContext,
  subscription: MainSubscriptionOption,
): MainNavigationItem[] {
  return items
    .map((navigationItem) => ({
      ...navigationItem,
      children: navigationItem.children
        ? filterMainNavigationItems(
            navigationItem.children,
            accessContext,
            subscription,
          )
        : undefined,
    }))
    .filter(
      (navigationItem) =>
        (hasAccess(
          accessContext,
          navigationItem.accessKey,
          navigationItem.requiredActions,
        ) &&
          isProductEnabled(
            navigationItem.productKey,
            subscription,
            navigationItem.productKeys,
          )) ||
        Boolean(navigationItem.children?.length),
    );
}

function flattenSections(sections: MainNavigationSection[]) {
  return sections.flatMap((section) =>
    flattenItems(section.items, section.title, [section.title]),
  );
}

function flattenItems(
  items: MainNavigationItem[],
  section: string,
  trail: string[],
): MainSearchItem[] {
  return items.flatMap((navigationItem) => {
    const currentTrail = [...trail, navigationItem.label];
    const current: MainSearchItem = {
      key: navigationItem.key,
      label: navigationItem.label,
      href: navigationItem.href,
      accessKey: navigationItem.accessKey,
      productKey: navigationItem.productKey ?? "core",
      productKeys: navigationItem.productKeys,
      section,
      trail,
    };

    return [
      current,
      ...(navigationItem.children
        ? flattenItems(navigationItem.children, section, currentTrail)
        : []),
    ];
  });
}

function item(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKey: MainProductKey = "core",
  requiredActions?: MainAccessAction[],
) {
  return {
    key,
    label,
    href,
    accessKey,
    productKey,
    requiredActions,
  };
}

function multiProductItem(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKeys: MainProductKey[],
  requiredActions?: MainAccessAction[],
) {
  return {
    ...item(
      key,
      label,
      href,
      accessKey,
      productKeys[0] ?? "core",
      requiredActions,
    ),
    productKeys,
  };
}

function child(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKey: MainProductKey = "core",
) {
  return item(key, label, href, accessKey, productKey);
}

function multiProductChild(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKeys: MainProductKey[],
) {
  return multiProductItem(key, label, href, accessKey, productKeys);
}

function navGroup(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKey: MainProductKey,
  children: MainNavigationItem[],
  productKeys?: MainProductKey[],
) {
  return {
    key,
    label,
    href,
    accessKey,
    productKey,
    productKeys,
    children,
  };
}
