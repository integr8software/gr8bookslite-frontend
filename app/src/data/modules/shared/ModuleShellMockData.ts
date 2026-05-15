import type {
  MainBranch,
  MainCompany,
  MainCurrentUser,
  MainDashboardWidget,
  MainNotification,
  MainPermissionMap,
  MainSubscriptionOption,
  MainUserRole,
  MainUserType,
} from "@/app/src/data/modules/shared/MainLayout/ModuleShellTypes";
import { AppName } from "@/app/src/data/shared/AppConstants";

export const ModuleSubscriptionPlans: MainSubscriptionOption[] = [
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

const CurrentUserType = {
  id: "user-type-operations-admin",
  name: "Operations Admin",
  permissions: {
    dashboard: { view: true, add: true, edit: true },
    cashReceipt: { view: true, add: true, edit: true, cancel: true },
    cashDisbursement: { view: true, add: true, edit: true },
    accountsPayable: { view: true, add: true },
    generalJournal: { view: true, add: true, edit: true },
    sales: { view: true, add: true, edit: true },
    inventory: { view: true, add: true, edit: true },
    purchasing: { view: true, add: true },
    canvass: { view: true },
    fixedAsset: { view: true },
    "maintenance.chartOfAccounts": { view: true, add: true, edit: true },
    "maintenance.currency": { view: true, edit: true },
    "maintenance.party": { view: true, add: true, edit: true },
    "maintenance.discount": { view: true, add: true, edit: true },
    "maintenance.transactionType": { view: true, edit: true },
    "maintenance.responsibilityCenter": { view: true, add: true, edit: true },
    "maintenance.term": { view: true, add: true, edit: true },
    "maintenance.mail": { view: true, edit: true },
    "maintenance.item": { view: true, add: true, edit: true },
    "maintenance.warehouse": { view: true, add: true },
    "maintenance.warehouse.access": { view: true, add: true, edit: true },
    "maintenance.approval": { view: true, edit: true },
    "maintenance.workflow": { view: true },
    "maintenance.audit": { view: true },
    "maintenance.users": { view: true, add: true, edit: true },
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
} satisfies MainUserType;

const CurrentUser = createCurrentUser({
  id: "usr-001",
  firstName: "John",
  lastName: "Dela Cruz",
  userRole: "Super Admin",
  userType: CurrentUserType,
});

const PrimaryCompanyBranches = [
  {
    id: "branch-main",
    code: "MAIN",
    name: "Main Branch",
    href: "/dashboard",
    kind: "branch",
    isMain: true,
    access: { view: true, edit: true },
  },
  {
    id: "branch-north",
    code: "NORTH",
    name: "North Branch",
    href: "/dashboard",
    kind: "branch",
    access: { view: true },
  },
  {
    id: "branch-south",
    code: "SOUTH",
    name: "South Satellite",
    href: "/dashboard",
    kind: "satellite",
    access: { view: true },
  },
] satisfies MainBranch[];

const TradingCompanyBranches = [
  {
    id: "branch-trading-main",
    code: "MAIN",
    name: "Trading Main",
    href: "/dashboard",
    kind: "branch",
    isMain: true,
    access: { view: true },
  },
] satisfies MainBranch[];

const Companies = [
  createCompany({
    id: "cmp-001",
    name: AppName,
    businessKind: "Accounting software",
    branches: PrimaryCompanyBranches,
    helperText: "Primary company",
  }),
  createCompany({
    id: "cmp-002",
    name: "Demo Trading Corp.",
    businessKind: "Trading",
    branches: TradingCompanyBranches,
    helperText: "Trading group",
  }),
] satisfies MainCompany[];

const CurrentCompany = Companies[0];

export const ModuleShellMockData = {
  currentUser: CurrentUser,
  currentCompany: CurrentCompany,
  availableCompanies: Companies,
  activeBranchId: getDefaultBranchId(CurrentCompany.branches),
  activeSubscription: ModuleSubscriptionPlans[2],
  branches: CurrentCompany.branches ?? [],
  recentCompanyIds: ["cmp-001", "cmp-002"],
  recentBranchIds: ["branch-main", "branch-north", "branch-south"],
  recentNavigationKeys: [
    "maintenance-approval",
    "reports-financial",
    "maintenance-users",
    "inventory-receiving-report",
    "cash-disbursement-voucher",
  ],
  notifications: [
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
      title: "Branch access updated",
      body: "North Branch view access is now available for your role.",
      href: "/settings",
      time: "18m ago",
      isRead: false,
    },
    {
      id: "notif-003",
      title: "Approval rule changed",
      body: "A maintenance approval workflow was updated.",
      href: "/workspace/permissions",
      time: "1h ago",
      isRead: true,
    },
    {
      id: "notif-004",
      title: "Subscription reviewed",
      body: "Your Accounting + Inventory subscription details are ready for billing review.",
      href: "/workspace/settings",
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
      value: String(CurrentCompany.branches?.length ?? 0),
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

type CurrentUserInput = {
  id: string;
  firstName: string;
  lastName: string;
  userRole: MainUserRole;
  userType: MainUserType;
};

function createCurrentUser(user: CurrentUserInput): MainCurrentUser {
  return {
    ...user,
    name: `${user.firstName} ${user.lastName}`,
    shortName: `${user.firstName} ${user.lastName.charAt(0)}.`,
    initials: getInitials(user.firstName, user.lastName),
  };
}

function createCompany(
  company: Omit<MainCompany, "totalBranches" | "branchCode" | "branchName">,
): MainCompany {
  const mainBranch =
    company.branches?.find((branch) => branch.isMain) ?? company.branches?.[0];

  return {
    ...company,
    totalBranches: company.branches?.length ?? 0,
    branchCode: mainBranch?.code,
    branchName: mainBranch?.name,
  };
}

function getDefaultBranchId(branches: MainBranch[] | undefined) {
  const accessibleBranches =
    branches?.filter((branch) => Object.values(branch.access).some(Boolean)) ??
    [];
  const mainBranch = accessibleBranches.find((branch) => branch.isMain);

  return mainBranch?.id ?? accessibleBranches.at(-1)?.id ?? "";
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
