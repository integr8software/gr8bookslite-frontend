import { AppName } from "@/app/src/data/shared/AppConstants";

export type MainAccessAction =
  | "view"
  | "add"
  | "edit"
  | "delete"
  | "cancel"
  | "uncancel";

export type MainAccessKey =
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
  items: MainNavigationItem[];
};

export type MainSearchItem = {
  key: string;
  label: string;
  href: string;
  accessKey: MainAccessKey;
  productKey: MainProductKey;
  section: string;
  trail: string[];
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

export type MainHelpArticle = {
  key: string;
  title: string;
  path: string;
  summary: string;
  content: string[];
  relatedKeys: string[];
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

export const MainNavigationSections: MainNavigationSection[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    accessKey: "dashboard",
    items: [
      item("dashboard-default", "Default Dashboard", "/dashboard", "dashboard"),
      item(
        "dashboard-sales",
        "Sales Overview",
        "/dashboard/sales-overview",
        "dashboard",
      ),
      item(
        "dashboard-operations",
        "Operations Overview",
        "/dashboard/operations-overview",
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
        "maintenance-charts-of-accounts",
        "Charts of Accounts",
        "/maintenance/charts-of-accounts",
        "maintenance.chartOfAccounts",
        "core",
        [
          child(
            "charts-assets",
            "Assets",
            "/maintenance/charts-of-accounts/assets",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-liabilities",
            "Liabilities",
            "/maintenance/charts-of-accounts/liabilities",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-equity",
            "Equity",
            "/maintenance/charts-of-accounts/equity",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-revenues",
            "Revenues",
            "/maintenance/charts-of-accounts/revenues",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-expenses",
            "Expenses",
            "/maintenance/charts-of-accounts/expenses",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-cost-of-sales",
            "Cost of Sales",
            "/maintenance/charts-of-accounts/cost-of-sales",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-other-income",
            "Other Income",
            "/maintenance/charts-of-accounts/other-income",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-other-expenses",
            "Other Expenses",
            "/maintenance/charts-of-accounts/other-expenses",
            "maintenance.chartOfAccounts",
          ),
          child(
            "charts-tax",
            "Tax",
            "/maintenance/charts-of-accounts/tax",
            "maintenance.chartOfAccounts",
          ),
        ],
      ),
      item(
        "maintenance-bank",
        "Bank Management",
        "/maintenance/bank-management",
        "maintenance.bank",
      ),
      item(
        "maintenance-currency",
        "Multi Currency Setup",
        "/maintenance/multi-currency-setup",
        "maintenance.currency",
      ),
      item(
        "maintenance-party",
        "Party Management",
        "/maintenance/party-management",
        "maintenance.party",
      ),
      item(
        "maintenance-discount",
        "Discount Management",
        "/maintenance/discount-management",
        "maintenance.discount",
      ),
      item(
        "maintenance-transaction-type",
        "Transaction Type",
        "/maintenance/transaction-type",
        "maintenance.transactionType",
      ),
      item(
        "maintenance-responsibility-center",
        "Responsibility Center",
        "/maintenance/responsibility-center",
        "maintenance.responsibilityCenter",
      ),
      item(
        "maintenance-term",
        "Term Management",
        "/maintenance/term-management",
        "maintenance.term",
      ),
      item(
        "maintenance-mail",
        "Mail Maintenance",
        "/maintenance/mail-maintenance",
        "maintenance.mail",
      ),
      item(
        "maintenance-warehouse",
        "Warehouse Management",
        "/maintenance/warehouse-management",
        "maintenance.warehouse",
        "inventory",
      ),
      navGroup(
        "maintenance-item",
        "Item Management",
        "/maintenance/item-management",
        "maintenance.item",
        "core",
        [
          child(
            "maintenance-item-category",
            "Category",
            "/maintenance/item-management/category",
            "maintenance.item",
          ),
          child(
            "maintenance-item-sub-category",
            "Sub Category",
            "/maintenance/item-management/sub-category",
            "maintenance.item",
          ),
          child(
            "maintenance-item-type",
            "Item Type",
            "/maintenance/item-management/item-type",
            "maintenance.item",
          ),
          child(
            "maintenance-item-sub-type",
            "Sub Item Type",
            "/maintenance/item-management/sub-item-type",
            "maintenance.item",
          ),
          child(
            "maintenance-item-unit",
            "Item Unit of Measurement",
            "/maintenance/item-management/unit-of-measurement",
            "maintenance.item",
          ),
        ],
      ),
      item(
        "maintenance-audit",
        "Audit Trail",
        "/maintenance/audit-trail",
        "maintenance.audit",
      ),
      item(
        "maintenance-users",
        "User Management",
        "/maintenance/user-management",
        "maintenance.users",
      ),
      navGroup(
        "maintenance-approval",
        "Approval Management",
        "/maintenance/approval-management",
        "maintenance.approval",
        "core",
        [
          child(
            "approval-settings",
            "Settings Approval",
            "/maintenance/approval-management/settings",
            "maintenance.approval",
          ),
          child(
            "approval-module-approvers",
            "Set Approval per Module",
            "/maintenance/approval-management/module-approvers",
            "maintenance.approval",
          ),
          child(
            "approval-transactions",
            "Transactions for Approval",
            "/maintenance/approval-management/transactions",
            "maintenance.approval",
          ),
        ],
      ),
      item(
        "maintenance-workflow",
        "Workflow Management",
        "/maintenance/workflow-management",
        "maintenance.workflow",
      ),
      item(
        "maintenance-reports",
        "Report Maintenance",
        "/maintenance/report-maintenance",
        "maintenance.reports",
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
      item(
        "sales-quotation",
        "Sales Quotation",
        "/sales/sales-quotation",
        "sales",
        "accounting",
      ),
      item(
        "sales-order",
        "Sales Order",
        "/sales/sales-order",
        "sales",
        "accounting",
      ),
      item(
        "sales-invoice",
        "Sales Invoice",
        "/sales/sales-invoice",
        "sales",
        "accounting",
      ),
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
      item(
        "sales-cash-sales-invoice",
        "Cash Sales Invoice",
        "/sales/cash-sales-invoice",
        "sales",
        "accounting",
      ),
      item(
        "sales-journal",
        "Sales Journal",
        "/sales/sales-journal",
        "sales",
        "accounting",
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
        "inventory-delivery-receipt",
        "Delivery Receipt",
        "/inventory/delivery-receipt",
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
        "inventory-goods-receipt",
        "Goods Receipt",
        "/inventory/goods-receipt",
        "inventory",
        "inventory",
      ),
      item(
        "inventory-receiving-report",
        "Receiving Report",
        "/inventory/receiving-report",
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
        "inventory-account",
        "Inventory Account",
        "/inventory/inventory-account",
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
    key: "canvass-form",
    title: "Canvass Form",
    icon: "purchasing",
    accessKey: "canvass",
    productKey: "inventory",
    items: [
      item(
        "canvass-form-default",
        "Canvass Form",
        "/canvass-form",
        "canvass",
        "inventory",
      ),
    ],
  },
  {
    key: "fixed-asset",
    title: "Fixed Asset",
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
    key: "reports",
    title: "Reports",
    icon: "reports",
    accessKey: "reports.accounting",
    items: [
      navGroup(
        "reports-accounting",
        "Accounting",
        "/reports/accounting",
        "reports.accounting",
        "accounting",
        [
          child(
            "reports-accounting-transaction-reports",
            "Transaction Reports",
            "/reports/accounting/transaction-reports",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-accounting-financial-reports",
            "Financial Reports",
            "/reports/accounting/financial-reports",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-accounting-books-of-accounts",
            "Books of Accounts",
            "/reports/accounting/books-of-accounts",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-accounting-journals",
            "Journals",
            "/reports/accounting/journals",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-accounting-bir",
            "BIR",
            "/reports/accounting/bir",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-accounting-receivable",
            "Account Receivable Reports",
            "/reports/accounting/account-receivable-reports",
            "reports.accounting",
            "accounting",
          ),
        ],
      ),
      navGroup(
        "reports-inventory",
        "Inventory",
        "/reports/inventory",
        "reports.inventory",
        "inventory",
        [
          child(
            "reports-inventory-item-query",
            "Item Query Generator",
            "/reports/inventory/item-query-generator",
            "reports.inventory",
            "inventory",
          ),
          child(
            "reports-inventory-movements",
            "Inventory Movements",
            "/reports/inventory/inventory-movements",
            "reports.inventory",
            "inventory",
          ),
        ],
      ),
    ],
  },
];

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
    name: AppName,
  },
  availableCompanies: [
    { id: "cmp-001", name: AppName },
    { id: "cmp-002", name: "Demo Trading Corp." },
  ],
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
    "dashboard-default",
    "cash-receipt-official-receipt",
    "inventory-receiving-report",
    "maintenance-item",
  ],
  recentlyVisitedNavigationKeys: [
    "approval-transactions",
    "reports-accounting",
    "maintenance-users",
    "dashboard-operations",
  ],
  notifications: [
    {
      id: "notif-001",
      title: "Dashboard shared",
      body: "Maria shared the Operations Overview dashboard with you.",
      href: "/dashboard/operations-overview",
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
      href: "/onboarding",
      time: "Yesterday",
      isRead: true,
    },
  ] satisfies MainNotification[],
  helpArticles: [
    {
      key: "help-dashboard",
      title: "Customizable dashboards",
      path: "/dashboard",
      summary:
        "Create, arrange, and share dashboards based on user permissions.",
      content: [
        "Dashboards are user-configurable workspaces. Users with add access can create more dashboards, while view access controls visibility.",
        "Use dashboard widgets for summaries, queues, charts, and saved operational views.",
      ],
      relatedKeys: ["help-branches", "help-permissions"],
    },
    {
      key: "help-maintenance",
      title: "Maintenance workspace",
      path: "/maintenance",
      summary:
        "Manage shared master files outside accounting and inventory routes.",
      content: [
        "Maintenance is its own workspace for company setup, party records, approval rules, workflow management, and audit tools.",
        "Each maintenance page can be enabled independently by view, add, edit, delete, cancel, and uncancel permissions.",
      ],
      relatedKeys: ["help-permissions", "help-branches"],
    },
    {
      key: "help-branches",
      title: "Branches",
      path: "/settings/branches",
      summary:
        "Switch branches and manage branch records when your role allows it.",
      content: [
        "The first breadcrumb is the active branch. Opening it lazy-loads branch choices so the layout can later call the backend only when needed.",
        "Branches and satellites are separated in the Branch Management switcher for easier selection.",
      ],
      relatedKeys: ["help-permissions"],
    },
    {
      key: "help-permissions",
      title: "Role permissions",
      path: "/settings/permissions",
      summary: "Control module visibility through granular access actions.",
      content: [
        "A module appears when the current user has at least one enabled action for that module.",
        "Action-level checks support view, add, edit, delete, cancel, and uncancel access.",
      ],
      relatedKeys: ["help-branches", "help-dashboard"],
    },
    {
      key: "help-profile",
      title: "Profile menu",
      path: "/profile",
      summary: "Open profile tools, settings, company switching, and logout.",
      content: [
        "The profile menu gives users direct access to their profile, settings, company switching, and logout actions.",
        "Future backend integration can populate companies and user details from the session endpoint.",
      ],
      relatedKeys: ["help-permissions"],
    },
  ] satisfies MainHelpArticle[],
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

export const MainSearchItems = flattenSections(MainNavigationSections);

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
) {
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
          isProductEnabled(section.productKey, subscription)) ||
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
      isProductEnabled(item.productKey, subscription),
  );
}

export function getAccessibleBranches(branches: MainBranch[]) {
  return branches.filter((branch) =>
    Object.values(branch.access).some(Boolean),
  );
}

export function getHelpArticleForPath(
  pathname: string,
  articles: MainHelpArticle[],
) {
  return (
    [...articles]
      .sort((first, second) => second.path.length - first.path.length)
      .find(
        (article) =>
          pathname === article.path || pathname.startsWith(`${article.path}/`),
      ) ?? articles[0]
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
          isProductEnabled(navigationItem.productKey, subscription)) ||
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

function child(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKey: MainProductKey = "core",
) {
  return item(key, label, href, accessKey, productKey);
}

function navGroup(
  key: string,
  label: string,
  href: string,
  accessKey: MainAccessKey,
  productKey: MainProductKey,
  children: MainNavigationItem[],
) {
  return {
    key,
    label,
    href,
    accessKey,
    productKey,
    children,
  };
}
