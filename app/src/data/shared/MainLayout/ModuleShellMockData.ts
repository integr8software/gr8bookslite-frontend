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
} from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { AppName } from "@/app/src/constants/shared/AppConstants";

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
  activeCompanyId: "cmp-001",
  companyIds: ["cmp-001"],
  firstName: "John",
  lastName: "Dela Cruz",
  userRole: "Super Admin",
  userType: CurrentUserType,
  profileImageUrl: undefined,
});

const CompanyBranches = [
  {
    id: "branch-satellite-main",
    code: "SAT",
    companyCode: "GR8",
    name: "Main Satellite",
    contactNo: "+63 2 8123 4567",
    email: "main@gr8books.test",
    description: "Primary operating branch for the company.",
    tin: "123-456-789-000",
    address: "Makati City, Metro Manila",
    href: "/dashboard",
    kind: "branch",
    isMain: true,
    access: { view: true, edit: true },
  },
  {
    id: "branch-satellite-sub",
    code: "SATO",
    companyCode: "GR8",
    name: "Sub Satellite",
    contactNo: "+63 32 412 7788",
    email: "satellite@gr8books.test",
    description: "Satellite office using the main branch TIN.",
    tin: "123-456-789-000",
    linkedMainBranchId: "branch-satellite-main",
    address: "Cebu City, Cebu",
    href: "/dashboard",
    kind: "satellite",
    isMain: false,
    access: { view: true, edit: true },
  },
] satisfies MainBranch[];

const Companies = [
  createCompany({
    id: "cmp-001",
    name: AppName,
    logoUrl: "/img/company-background.jpg",
    status: "Active",
    businessKind: "Accounting software",
    subscriptionPackage: ModuleSubscriptionPlans[2],
    branches: CompanyBranches,
    helperText: "Current company",
  }),
  createCompany({
    id: "cmp-archived",
    name: "Archived Company",
    status: "Inactive",
    businessKind: "Inactive company",
    subscriptionPackage: ModuleSubscriptionPlans[0],
    branches: [],
    helperText: "Hidden from active company switching",
  }),
] satisfies MainCompany[];

const ActiveCompanies = Companies.filter(
  (company) => company.status === "Active",
);
const CurrentCompany =
  ActiveCompanies.find(
    (company) => company.id === CurrentUser.activeCompanyId,
  ) ?? ActiveCompanies[0];
const ActiveSubscription =
  CurrentCompany.subscriptionPackage ?? ModuleSubscriptionPlans[0];
const VisibleBranches = getVisibleBranches(CurrentCompany.branches);

export const ModuleShellMockData = {
  currentUser: CurrentUser,
  currentCompany: CurrentCompany,
  availableCompanies: ActiveCompanies,
  activeBranchId: getDefaultBranchId(CurrentCompany.branches),
  activeSubscription: ActiveSubscription,
  branches: VisibleBranches,
  recentCompanyIds: ["cmp-001"],
  recentBranchIds: VisibleBranches.map((branch) => branch.id),
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
      title: "Company access checked",
      body: "Your company and Accounting + Inventory package are active.",
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
      body: "Your company has one Accounting + Inventory subscription package on record.",
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
      title: "Company package",
      value: ActiveSubscription.label,
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
  ] satisfies MainDashboardWidget[],
};

type CurrentUserInput = {
  id: string;
  activeCompanyId?: string;
  companyIds: string[];
  firstName: string;
  lastName: string;
  userRole: MainUserRole;
  userType: MainUserType;
  profileImageUrl?: string;
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

function getVisibleBranches(branches: MainBranch[] | undefined) {
  const accessibleBranches =
    branches?.filter((branch) => Object.values(branch.access).some(Boolean)) ??
    [];

  if (!accessibleBranches.some((branch) => branch.kind)) {
    return [];
  }

  if (
    accessibleBranches.length <= 1 &&
    accessibleBranches[0]?.kind === "satellite"
  ) {
    return [];
  }

  return accessibleBranches;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
