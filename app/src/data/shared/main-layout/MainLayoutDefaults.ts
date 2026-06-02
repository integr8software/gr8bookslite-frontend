import type {
  MainDashboardWidget,
  MainNotification,
  MainSubscriptionOption,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";

export const MainLayoutSubscriptionPlans: MainSubscriptionOption[] = [
  {
    id: "ACCOUNTING",
    label: "Accounting",
    description:
      "Accounting workflows with reports, cash, payable, sales, and journals.",
    enabledProductKeys: ["core", "accounting"],
  },
  {
    id: "INVENTORY",
    label: "Inventory",
    description:
      "Inventory workflows with items, warehouses, stock movement, and reports.",
    enabledProductKeys: ["core", "inventory"],
  },
  {
    id: "ACCOUNTING_INVENTORY",
    label: "Accounting + Inventory",
    description:
      "Accounting and inventory modules enabled for full company operations.",
    enabledProductKeys: ["core", "accounting", "inventory"],
  },
];

export const MainLayoutDefaultSubscription = MainLayoutSubscriptionPlans[2];

export const MainLayoutRecentNavigationKeys = [
  "maintenance-approval",
  "reports-financial",
  "maintenance-users",
  "inventory-receiving-report",
  "cash-disbursement-voucher",
];

export const MainLayoutInitialNotifications: MainNotification[] = [
  {
    id: "notif-001",
    title: "Dashboard updated",
    body: "Workspace summary widgets were refreshed for your role.",
    href: "/workspace/dashboard",
    time: "Just now",
    isRead: false,
  },
  {
    id: "notif-002",
    title: "Company access checked",
    body: "Your company and Accounting + Inventory package are active.",
    href: "/account/settings",
    time: "18m ago",
    isRead: false,
  },
  {
    id: "notif-003",
    title: "Approval rule changed",
    body: "A maintenance approval workflow was updated.",
    href: "/workspace/audit-logs",
    time: "1h ago",
    isRead: true,
  },
  {
    id: "notif-004",
    title: "Subscription reviewed",
    body: "Your company has one Accounting + Inventory subscription package on record.",
    href: "/workspace/billing-and-subscription",
    time: "Yesterday",
    isRead: true,
  },
];

export const MainDashboardWidgets: MainDashboardWidget[] = [
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
    title: "Company package",
    value: MainLayoutDefaultSubscription.label,
    supportingText: "Single backend subscription package",
    tone: "citron",
  },
  {
    id: "dashboard-widget-004",
    title: "Saved views",
    value: "21",
    supportingText: "Personal and team views",
    tone: "dark",
  },
];
