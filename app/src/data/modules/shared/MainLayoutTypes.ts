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
  branchCode?: string;
  branchName?: string;
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
