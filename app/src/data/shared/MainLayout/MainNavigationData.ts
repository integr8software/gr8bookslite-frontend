import type {
  MainAccessAction,
  MainAccessKey,
  MainNavigationItem,
  MainNavigationSection,
  MainProductKey,
} from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { flattenSections } from "@/app/src/data/shared/MainLayout/ModuleShellUtils";
import { MainModuleNavigationSections } from "@/app/src/data/shared/MainLayout/MainModuleRegistry";

export const MainWorkspaceNavigationSections: MainNavigationSection[] = [
  {
    key: "workspace",
    title: "Workspace",
    href: "/workspace/dashboard",
    icon: "settings",
    accessKey: "workspace.overview",
    items: [
      item(
        "workspace-overview",
        "Overview",
        "/workspace/dashboard",
        "workspace.overview",
      ),
      item(
        "workspace-companies",
        "Companies",
        "/workspace/companies",
        "workspace.companies",
      ),
      item(
        "workspace-users-roles",
        "Users & Roles",
        "/workspace/users-roles",
        "workspace.users",
      ),
      item(
        "workspace-permissions",
        "Permissions",
        "/workspace/permissions",
        "workspace.approval",
      ),
      item(
        "workspace-audit",
        "Audit Logs",
        "/workspace/audit-logs",
        "workspace.audit",
      ),
      item("workspace-settings", "Settings", "/workspace/settings", "settings"),
    ],
  },
  {
    key: "workspace-modules",
    title: "Modules",
    icon: "dashboard",
    accessKey: "maintenance.chartOfAccounts",
    items: [
      item(
        "workspace-module-financial-management",
        "Financial Management",
        "/workspace/financial-management",
        "maintenance.chartOfAccounts",
      ),
      item(
        "workspace-module-sales-management",
        "Sales Management",
        "/workspace/sales-management",
        "sales",
      ),
      item(
        "workspace-module-purchasing",
        "Purchasing",
        "/workspace/purchasing",
        "purchasing",
      ),
      item(
        "workspace-module-inventory",
        "Inventory",
        "/workspace/inventory",
        "inventory",
      ),
      item(
        "workspace-module-projects",
        "Projects",
        "/workspace/projects",
        "branch.management",
      ),
      item(
        "workspace-module-human-resources",
        "Human Resources",
        "/workspace/human-resources",
        "maintenance.users",
      ),
      item(
        "workspace-module-reports-analytics",
        "Reports & Analytics",
        "/workspace/reports-analytics",
        "reports.accounting",
      ),
    ],
  },
];

const RegisteredMainCompanyNavigationSections = MainModuleNavigationSections;

export const LegacyMainCompanyNavigationSections: MainNavigationSection[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    accessKey: "dashboard",
    items: [
      item(
        "dashboard-overview",
        "Dashboard Overview",
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
        "Petty Cash Voucher",
        "/cash-disbursement/petty-cash-voucher",
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
            "reports-beginning-balance-general-ledger-uploader",
            "Beginning Balance General Ledger Uploader",
            "/reports/financial/beginning-balance-general-ledger-uploader",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-beginning-balance-subsidiary-ledger-uploader",
            "Beginning Balance Subsidiary Ledger Uploader",
            "/reports/financial/beginning-balance-subsidiary-ledger-uploader",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-budget-uploader",
            "Budget Uploader",
            "/reports/financial/budget-uploader",
            "reports.accounting",
            "accounting",
          ),
          child(
            "reports-verifier",
            "Verifier",
            "/reports/financial/verifier",
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
  {
    key: "system-administration",
    title: "System Administration",
    icon: "settings",
    accessKey: "maintenance.users",
    items: [
      navGroup(
        "maintenance-user-management",
        "User Management",
        "/system-administration/user-management",
        "maintenance.users",
        "core",
        [
          item(
            "maintenance-users",
            "Users",
            "/system-administration/user-management/users",
            "maintenance.users",
          ),
          item(
            "maintenance-user-role",
            "User Role",
            "/system-administration/user-management/user-role",
            "maintenance.users",
          ),
        ],
      ),
      item(
        "branch-management",
        "Branch Management",
        "/system-administration/branch-management",
        "branch.management",
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
        "transaction-number-setup",
        "Transaction Number Setup",
        "/system-administration/transaction-number-setup",
        "settings",
      ),
      item(
        "maintenance-mail",
        "Mail Maintenance",
        "/system-administration/mail-maintenance",
        "maintenance.mail",
      ),
    ],
  },
];

export const MainCompanyNavigationSections: MainNavigationSection[] = [
  ...RegisteredMainCompanyNavigationSections,
  ...LegacyMainCompanyNavigationSections.filter((section) =>
    ["reporting-analytics", "system-administration"].includes(section.key),
  ),
];

export const MainNavigationSections = MainCompanyNavigationSections;
export const MainWorkspaceSearchItems = flattenSections(
  MainWorkspaceNavigationSections,
);
export const MainCompanySearchItems = flattenSections(
  MainCompanyNavigationSections,
);
export const MainSearchItems = MainCompanySearchItems;

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
