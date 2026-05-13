import type {
  ErpBranch,
  ErpNavSection,
  ErpNotification,
} from "@/app/src/data/modules/workspace/ErpWorkspaceTypes";

export const erpBranches: ErpBranch[] = [
  {
    id: "branch-hou",
    code: "HOU",
    name: "Houston Site",
    descriptor: "Main Branch",
    address: "123 Main St., Houston, TX 77001",
    phone: "+1 (555) 123-4567",
    isCurrent: true,
  },
  {
    id: "branch-dal",
    code: "DAL",
    name: "Dallas Site",
    descriptor: "Branch Office",
    address: "455 Elm Street, Dallas, TX 75001",
    phone: "+1 (555) 870-1100",
  },
];

export const erpNavigation: ErpNavSection[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  {
    key: "financial-management",
    label: "Financial Management",
    href: "/financial-management",
    children: [
      {
        key: "chart-of-accounts",
        label: "Chart of Accounts",
        href: "/financial-management/chart-of-accounts",
      },
      {
        key: "bank-reconciliation",
        label: "Bank Reconciliation",
        href: "/financial-management/bank-reconciliation",
      },
      {
        key: "collections",
        label: "Collections",
        href: "/financial-management/collections",
        children: [
          {
            key: "collection-receipts",
            label: "Collection Receipts",
            href: "/financial-management/collections/collection-receipts",
          },
          {
            key: "customers",
            label: "Customers",
            href: "/financial-management/collections/customers",
          },
          {
            key: "statements",
            label: "Statements",
            href: "/financial-management/collections/statements",
          },
          {
            key: "aging-report",
            label: "Aging Report",
            href: "/financial-management/collections/aging-report",
          },
          {
            key: "write-offs",
            label: "Write Offs",
            href: "/financial-management/collections/write-offs",
          },
        ],
      },
    ],
  },
  { key: "sales-management", label: "Sales Management", href: "/sales-management" },
  { key: "purchasing", label: "Purchasing", href: "/purchasing" },
  { key: "inventory", label: "Inventory", href: "/inventory" },
  { key: "projects", label: "Projects", href: "/projects" },
  { key: "human-resources", label: "Human Resources", href: "/human-resources" },
  {
    key: "reports-analytics",
    label: "Reports & Analytics",
    href: "/reports-analytics",
  },
  { key: "companies", label: "Companies", href: "/companies" },
  { key: "users-roles", label: "Users & Roles", href: "/users-roles" },
  { key: "permissions", label: "Permissions", href: "/permissions" },
  { key: "audit-logs", label: "Audit Logs", href: "/audit-logs" },
  { key: "settings", label: "Settings", href: "/settings", bottom: true },
];

export const erpNotifications: ErpNotification[] = [
  {
    id: "notif-1",
    title: "Approval queue needs review",
    detail: "Purchase Order PO-10034 is waiting for your branch approval.",
    time: "Just now",
    tone: "red",
  },
  {
    id: "notif-2",
    title: "Branch access updated",
    detail: "Dallas Site was added to your accessible branches.",
    time: "25m ago",
    tone: "blue",
  },
  {
    id: "notif-3",
    title: "Deposit batch generated",
    detail: "Deposit Slip DS-HOU-2024-0031 is ready for review.",
    time: "2h ago",
    tone: "amber",
  },
];

export const erpProfile = {
  initials: "JD",
  name: "John Dela Cruz",
  shortName: "John D.",
  role: "Super Admin",
  title: "Finance Clerk",
};

export function getBranchById(branchId: string) {
  return erpBranches.find((branch) => branch.id === branchId) ?? erpBranches[0];
}
