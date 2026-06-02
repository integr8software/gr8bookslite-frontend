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
  | "workspace.activity"
  | "workspace.companies"
  | "workspace.branches"
  | "workspace.users"
  | "workspace.approval"
  | "workspace.mail"
  | "workspace.audit"
  | "workspace.billing.plans"
  | "workspace.billing.subscriptions"
  | "workspace.billing.invoices"
  | "workspace.billing.promotions"
  | "workspace.platform.modules"
  | "workspace.platform.domains"
  | "workspace.platform.integrations"
  | "workspace.platform.settings"
  | "workspace.monitoring.logs"
  | "workspace.monitoring.security"
  | "workspace.monitoring.backups"
  | "workspace.support.announcements"
  | "workspace.support.tickets"
  | "workspace.support.maintenance"
  | "workspace.settings"
  | "workspace.admin.companySettings"
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
  | "maintenance.currency"
  | "maintenance.party"
  | "maintenance.discount"
  | "maintenance.transactionType"
  | "maintenance.responsibilityCenter"
  | "maintenance.term"
  | "maintenance.mail"
  | "maintenance.item"
  | "maintenance.warehouse.access"
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

export type ModuleSubscriptionPlanId =
  | "lite-suite"
  | "core"
  | "accounting"
  | "inventory"
  | "ACCOUNTING"
  | "INVENTORY"
  | "ACCOUNTING_INVENTORY";

export type MainNavigationScope = "master" | "workspace" | "company" | "account";

export type MainPermissionMap = Partial<
  Record<MainAccessKey, Partial<Record<MainAccessAction, boolean>>>
>;

export type MainIconName =
  | "approval"
  | "announcement"
  | "asset"
  | "branch"
  | "billing"
  | "cashIn"
  | "cashOut"
  | "company"
  | "dashboard"
  | "inventory"
  | "invoice"
  | "journal"
  | "maintenance"
  | "payable"
  | "profile"
  | "promotion"
  | "purchasing"
  | "reports"
  | "sales"
  | "security"
  | "settings"
  | "subscription"
  | "support"
  | "user";

export type MainNavigationItem = {
  key: string;
  label: string;
  href: string;
  accessKey: MainAccessKey;
  productKey?: MainProductKey;
  productKeys?: MainProductKey[];
  requiredActions?: MainAccessAction[];
  module?: {
    actions: Extract<MainAccessAction, "view" | "add" | "edit">[];
    recordIds?: string[];
  };
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
  logoUrl?: string;
  status: "Active" | "Inactive";
  businessKind?: string;
  subscriptionPackage?: MainSubscriptionOption;
  branches?: MainBranch[];
  totalBranches?: number;
  branchCode?: string;
  branchName?: string;
  helperText?: string;
};

export type MainSubscriptionOption = {
  id: ModuleSubscriptionPlanId;
  label: string;
  description: string;
  enabledProductKeys: MainProductKey[];
};

export type MainUserRole = "Super Admin" | "Admin" | "User";

export type MainUserRoleDetails = {
  id: string;
  name: string;
  permissions: MainPermissionMap;
};

export type MainUserAccessContext = {
  userRole: MainUserRole;
  userRoleDetails?: MainUserRoleDetails;
};

export type MainCurrentUser = MainUserAccessContext & {
  id: string;
  activeCompanyId?: string;
  companyIds: string[];
  firstName: string;
  lastName: string;
  name: string;
  shortName: string;
  initials: string;
  profileImageUrl?: string;
};

export type MainBranch = {
  id: string;
  code: string;
  companyCode: string;
  name: string;
  contactNo?: string;
  email?: string;
  description?: string;
  tin: string;
  linkedMainBranchId?: string;
  address?: string;
  href: string;
  kind?: "branch" | "satellite";
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
