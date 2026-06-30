import type {
  MainAccessAction,
  MainAccessKey,
  MainNavigationSection,
  MainProductKey,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { flattenSections } from "@/app/src/data/shared/main-layout/sidebar/SidebarUtils";

export const MainWorkspaceNavigationSections: MainNavigationSection[] = [
  directSection(
    "workspace-dashboard-section",
    "Dashboard",
    "/workspace/dashboard",
    "dashboard",
    "workspace.dashboard",
    "workspace-dashboard",
  ),
  directSection(
    "workspace-company-management-section",
    "Company Management",
    "/workspace/company-management",
    "company",
    "workspace.companies",
    "workspace-company-management",
  ),
  directSection(
    "workspace-user-management-section",
    "User Management",
    "/workspace/users-management",
    "user",
    "workspace.users",
    "workspace-users-management",
  ),
  directSection(
    "workspace-billing-and-subscription-section",
    "Billing & Subscription",
    "/workspace/billing-and-subscription",
    "billing",
    "workspace.billing.subscriptions",
    "workspace-billing-and-subscription",
  ),
  directSection(
    "workspace-vouchers-and-coupons-section",
    "Vouchers and Coupons",
    "/workspace/vouchers-and-coupons",
    "promotion",
    "workspace.billing.promotions",
    "workspace-vouchers-and-coupons",
  ),
  directSection(
    "workspace-audit-logs-section",
    "Audit Logs",
    "/workspace/audit-logs",
    "security",
    "workspace.audit",
    "workspace-audit",
  ),
  directSection(
    "workspace-system-settings-section",
    "System Settings",
    "/workspace/system-settings",
    "settings",
    "workspace.platform.settings",
    "workspace-system-settings",
  ),
];

export const MainMasterNavigationSections: MainNavigationSection[] = [
  directSection(
    "master-dashboard-section",
    "Dashboard",
    "/master/dashboard",
    "dashboard",
    "workspace.dashboard",
    "master-dashboard",
  ),
  directSection(
    "master-announcement-section",
    "Announcement",
    "/master/announcements",
    "announcement",
    "workspace.support.announcements",
    "master-announcements",
  ),
  directSection(
    "master-subscriber-management-section",
    "Subscriber Management",
    "/master/subscriber-management",
    "subscription",
    "workspace.billing.subscriptions",
    "master-subscriber-management",
  ),
  directSection(
    "master-plan-and-packages-section",
    "Plan and Packages",
    "/master/plan-and-packages",
    "billing",
    "workspace.billing.plans",
    "master-plan-and-packages",
  ),
  directSection(
    "master-module-systems-section",
    "System Maintenance",
    "/master/module-systems",
    "settings",
    "workspace.platform.settings",
    "master-module-systems",
  ),
  directSection(
    "master-subscription-section",
    "Subscription",
    "/master/subscriptions",
    "subscription",
    "workspace.billing.subscriptions",
    "master-subscriptions",
  ),
  directSection(
    "master-invoices-section",
    "Invoices",
    "/master/invoices",
    "invoice",
    "workspace.billing.invoices",
    "master-invoices",
  ),
  directSection(
    "master-promotions-section",
    "Promotions",
    "/master/promotions",
    "promotion",
    "workspace.billing.promotions",
    "master-promotions",
  ),
  directSection(
    "master-subscriber-promotions-section",
    "Subscriber Promotions",
    "/master/subscriber-promotions",
    "promotion",
    "workspace.billing.promotions",
    "master-subscriber-promotions",
  ),
  directSection(
    "master-audit-logs-section",
    "Audit Logs",
    "/master/audit-logs",
    "security",
    "workspace.monitoring.logs",
    "master-audit-logs",
  ),
  directSection(
    "master-support-tickets-section",
    "Support Tickets",
    "/master/support-tickets",
    "support",
    "workspace.support.tickets",
    "master-support-tickets",
  ),
  directSection(
    "master-system-settings-section",
    "System Settings",
    "/master/system-settings",
    "settings",
    "workspace.platform.settings",
    "master-system-settings",
  ),
];

export const MainAccountNavigationSections: MainNavigationSection[] = [
  directSection(
    "account-profile-section",
    "Profile",
    "/account/profile",
    "profile",
    "profile",
    "account-profile",
  ),
  directSection(
    "account-settings-section",
    "Settings",
    "/account/settings",
    "settings",
    "profile",
    "account-settings",
  ),
];

export const MainWorkspaceSearchItems = flattenSections(
  MainWorkspaceNavigationSections,
);
export const MainAccountSearchItems = flattenSections(
  MainAccountNavigationSections,
);
export const MainMasterSearchItems = flattenSections(
  MainMasterNavigationSections,
);

function directSection(
  key: string,
  title: string,
  href: string,
  icon: MainNavigationSection["icon"],
  accessKey: MainAccessKey,
  itemKey: string,
): MainNavigationSection {
  return {
    key,
    title,
    href,
    icon,
    accessKey,
    items: [item(itemKey, title, href, accessKey)],
  };
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
