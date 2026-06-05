import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  FolderKanban,
  GitBranch,
  Package,
  ShieldCheck,
  ShoppingCart,
  Settings,
  Tags,
  TrendingUp,
  UserRound,
  WalletCards,
  Warehouse,
} from "lucide-react";

export type ModulePreviewMetric = {
  label: string;
  value: string;
};

export type ModulePreviewData = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "sky" | "citron" | "coral" | "violet" | "mint";
  metrics: ModulePreviewMetric[];
  highlights: string[];
};

export const ModulePreviewPages: Record<string, ModulePreviewData> = {
  companies: {
    eyebrow: "Workspace Directory",
    title: "Companies",
    description:
      "A mock company management area for testing workspace navigation, filters, and list density before wiring live APIs.",
    icon: Building2,
    tone: "sky",
    metrics: [
      { label: "Tracked Companies", value: "05" },
      { label: "Needs Review", value: "02" },
      { label: "Draft Profiles", value: "03" },
    ],
    highlights: [
      "Global search and company switcher ready for UI validation.",
      "Card and table patterns match the workspace overview styling.",
      "Useful as a placeholder while real CRUD flows are still being designed.",
    ],
  },
  usersRoles: {
    eyebrow: "Workspace Access",
    title: "Users & Roles",
    description:
      "A mock role management space to test permission-heavy layouts, dense lists, and admin call-to-actions.",
    icon: UserRound,
    tone: "violet",
    metrics: [
      { label: "Active Users", value: "142" },
      { label: "Role Templates", value: "08" },
      { label: "Pending Invites", value: "11" },
    ],
    highlights: [
      "Large-table surfaces can be tested without backend dependencies.",
      "The page gives room for future filters, invite flows, and audit trails.",
      "Helps validate hierarchy between workspace tools and company modules.",
    ],
  },
  permissions: {
    eyebrow: "Workspace Security",
    title: "Permissions",
    description:
      "A permissions preview page for stress-testing complex admin UX with strong visual grouping and status cards.",
    icon: ShieldCheck,
    tone: "citron",
    metrics: [
      { label: "Policies", value: "18" },
      { label: "Exceptions", value: "04" },
      { label: "Approvals", value: "07" },
    ],
    highlights: [
      "Designed for mock approval policy and access matrix experiments.",
      "Keeps navigation consistent with the dashboard shell.",
      "Lets the team validate naming before backend models are finalized.",
    ],
  },
  auditLogs: {
    eyebrow: "Workspace Monitoring",
    title: "Audit Logs",
    description:
      "A company-scoped audit area for filtering activity by company, branch, module, and user.",
    icon: Activity,
    tone: "coral",
    metrics: [
      { label: "Events Today", value: "1.4K" },
      { label: "Flagged", value: "12" },
      { label: "Exports", value: "03" },
    ],
    highlights: [
      "Ideal for validating event density and empty-state behavior.",
      "Gives a realistic destination for sidebar navigation testing.",
      "Uses the same visual language as the new workspace mockup.",
    ],
  },
  settings: {
    eyebrow: "Workspace Configuration",
    title: "Settings",
    description:
      "A settings placeholder for testing administrative form layouts, preferences, and account-wide actions.",
    icon: ShieldCheck,
    tone: "sky",
    metrics: [
      { label: "Policies", value: "11" },
      { label: "Alerts", value: "06" },
      { label: "Connected Items", value: "04" },
    ],
    highlights: [
      "Useful for testing dense settings forms before wiring real persistence.",
      "Provides a clean destination for the sidebar and branch shortcuts.",
      "Keeps the module shell complete for stakeholder walkthroughs.",
    ],
  },
  activityFeed: {
    eyebrow: "Workspace Overview",
    title: "Activity Feed",
    description:
      "A cross-tenant timeline for subscription changes, company events, security signals, and support activity.",
    icon: Activity,
    tone: "sky",
    metrics: [
      { label: "Events Today", value: "184" },
      { label: "Needs Review", value: "09" },
      { label: "Automations", value: "12" },
    ],
    highlights: [
      "Separates live operational signals from the dashboard summary.",
      "Gives admins one place to review important workspace changes.",
      "Can be scoped globally for Super Admin or per company for Admin.",
    ],
  },
  branches: {
    eyebrow: "Tenant Management",
    title: "Branch Management",
    description:
      "A branch and satellite management surface grouped by company for access, addresses, and operating locations.",
    icon: GitBranch,
    tone: "citron",
    metrics: [
      { label: "Branches", value: "08" },
      { label: "Satellites", value: "03" },
      { label: "Pending Setup", value: "02" },
    ],
    highlights: [
      "Keeps branch administration near companies and users.",
      "Supports tenant-scoped views for company admins.",
      "Creates room for future branch billing and access controls.",
    ],
  },
  plansPackages: {
    eyebrow: "Subscription & Billing",
    title: "Plans & Packages",
    description:
      "A billing configuration area for Accounting, Inventory, combined packages, included users, and add-on pricing.",
    icon: Package,
    tone: "coral",
    metrics: [
      { label: "Packages", value: "03" },
      { label: "Included User", value: "01" },
      { label: "User Add-on", value: "PHP 100" },
    ],
    highlights: [
      "Best kept as a Super Admin control because it changes platform revenue rules.",
      "Can drive onboarding plan copy from a single source of truth later.",
      "Supports clear add-on pricing for users, branches, satellites, and companies.",
    ],
  },
  subscriptions: {
    eyebrow: "Subscription & Billing",
    title: "Billing & Subscription",
    description:
      "A company billing area for subscription computation, payment review, renewal state, and payment history.",
    icon: WalletCards,
    tone: "sky",
    metrics: [
      { label: "Active", value: "42" },
      { label: "Trial", value: "07" },
      { label: "Past Due", value: "03" },
    ],
    highlights: [
      "Company admins can review their own company subscription state.",
      "Payment lists stay near computed subscription totals.",
      "Plan configuration stays separate from company billing review.",
    ],
  },
  invoices: {
    eyebrow: "Subscription & Billing",
    title: "Invoices",
    description:
      "A receipt and invoice record area for paid subscribers, payment status, receipt trails, and finance review.",
    icon: FileText,
    tone: "citron",
    metrics: [
      { label: "Open", value: "18" },
      { label: "Paid", value: "226" },
      { label: "Overdue", value: "04" },
    ],
    highlights: [
      "Gives finance teams a clean destination for billing history.",
      "Can be filtered globally or limited to a company admin's tenant.",
      "Pairs naturally with payment methods and subscription records.",
    ],
  },
  couponsPromotions: {
    eyebrow: "Subscription & Billing",
    title: "Coupons & Promotions",
    description:
      "A promotion management surface for discounts, vouchers, campaign codes, and redemption rules.",
    icon: Tags,
    tone: "violet",
    metrics: [
      { label: "Active Codes", value: "14" },
      { label: "Campaigns", value: "05" },
      { label: "Redemptions", value: "318" },
    ],
    highlights: [
      "Keeps marketing discounts out of plan configuration.",
      "Supports future rules for expiration, package eligibility, and usage caps.",
      "Works well as a Super Admin-only billing tool.",
    ],
  },
  modulesFeatures: {
    eyebrow: "Platform Configuration",
    title: "Modules & Features",
    description:
      "A platform catalog for enabling modules, feature flags, product bundles, and tenant availability.",
    icon: BarChart3,
    tone: "mint",
    metrics: [
      { label: "Modules", value: "11" },
      { label: "Feature Flags", value: "28" },
      { label: "Bundles", value: "03" },
    ],
    highlights: [
      "This is the right home for Accounting and Inventory availability rules.",
      "Keeps company operational modules out of the global sidebar.",
      "Creates a clean path for plan-to-module entitlement mapping.",
    ],
  },
  domainsPorts: {
    eyebrow: "Platform Configuration",
    title: "Domains & Ports",
    description:
      "A deployment configuration area for custom domains, allowed origins, ports, and tenant routing rules.",
    icon: GitBranch,
    tone: "sky",
    metrics: [
      { label: "Domains", value: "09" },
      { label: "Ports", value: "04" },
      { label: "Pending DNS", value: "02" },
    ],
    highlights: [
      "Good as a Super Admin-only tool because it affects infrastructure.",
      "Keeps tenant routing controls away from company-level settings.",
      "Can later connect to domain verification and environment status.",
    ],
  },
  integrations: {
    eyebrow: "Platform Configuration",
    title: "Integrations",
    description:
      "A connection hub for payment gateways, email providers, accounting services, and external platform hooks.",
    icon: FolderKanban,
    tone: "coral",
    metrics: [
      { label: "Connected", value: "06" },
      { label: "Needs Auth", value: "02" },
      { label: "Providers", value: "12" },
    ],
    highlights: [
      "Centralizes platform-level integrations and provider credentials.",
      "Can expose tenant-safe connection status to company admins later.",
      "Keeps provider setup separate from daily operating modules.",
    ],
  },
  systemSettings: {
    eyebrow: "Platform Configuration",
    title: "System Settings",
    description:
      "A global configuration area for defaults, environment rules, notification behavior, and platform policy.",
    icon: Settings,
    tone: "citron",
    metrics: [
      { label: "Policies", value: "16" },
      { label: "Defaults", value: "24" },
      { label: "Pending Review", value: "03" },
    ],
    highlights: [
      "Best reserved for Super Admin because these settings affect every tenant.",
      "Reduces confusion with company-specific settings.",
      "Creates a stable home for future global configuration forms.",
    ],
  },
  securityCenter: {
    eyebrow: "Monitoring & Security",
    title: "Security Center",
    description:
      "A security command area for suspicious activity, account protection, device sessions, and access policy health.",
    icon: ShieldCheck,
    tone: "coral",
    metrics: [
      { label: "Alerts", value: "06" },
      { label: "MFA Coverage", value: "91%" },
      { label: "Sessions", value: "214" },
    ],
    highlights: [
      "Separates security posture from ordinary settings.",
      "Works well beside audit logs, backups, and account protection.",
      "Can later include company-scoped views for tenant admins.",
    ],
  },
  backups: {
    eyebrow: "Monitoring & Security",
    title: "Backups",
    description:
      "A recovery operations area for backup schedules, retention, restore points, and tenant export controls.",
    icon: Warehouse,
    tone: "mint",
    metrics: [
      { label: "Restore Points", value: "31" },
      { label: "Successful", value: "99%" },
      { label: "Retention", value: "90d" },
    ],
    highlights: [
      "Backup visibility belongs with security and monitoring.",
      "Creates a clear destination for restore workflows later.",
      "Should be strongly permissioned because it touches tenant data.",
    ],
  },
  announcements: {
    eyebrow: "Support & Maintenance",
    title: "Announcements",
    description:
      "A communication area for release notices, outage advisories, planned maintenance, and tenant broadcasts.",
    icon: Briefcase,
    tone: "sky",
    metrics: [
      { label: "Published", value: "18" },
      { label: "Drafts", value: "04" },
      { label: "Scheduled", value: "02" },
    ],
    highlights: [
      "Good for Super Admin publishing and company admin visibility.",
      "Keeps platform notices out of operational dashboards.",
      "Can later support audience targeting by plan or company.",
    ],
  },
  supportTickets: {
    eyebrow: "Support & Maintenance",
    title: "Support Tickets",
    description:
      "A support queue for tenant requests, billing questions, platform incidents, and maintenance follow-up.",
    icon: UserRound,
    tone: "citron",
    metrics: [
      { label: "Open", value: "23" },
      { label: "Waiting", value: "08" },
      { label: "SLA Risk", value: "03" },
    ],
    highlights: [
      "Super Admin can manage every queue item.",
      "Company admins can create and review tickets for their own company.",
      "Pairs naturally with announcements and maintenance notices.",
    ],
  },
  maintenance: {
    eyebrow: "Support & Maintenance",
    title: "Maintenance",
    description:
      "A maintenance planning area for scheduled downtime, service windows, operational tasks, and incident notes.",
    icon: Settings,
    tone: "coral",
    metrics: [
      { label: "Windows", value: "04" },
      { label: "Tasks", value: "19" },
      { label: "Incidents", value: "02" },
    ],
    highlights: [
      "Keeps platform maintenance separate from company maintenance records.",
      "Can feed announcements and activity events.",
      "Works best as a Super Admin operational tool.",
    ],
  },
  companySettings: {
    eyebrow: "Admin",
    title: "Company Settings",
    description:
      "A company-admin workspace for tenant profile, default theme, custom-field policy, and strict theme controls.",
    icon: Building2,
    tone: "sky",
    metrics: [
      { label: "Profile Fields", value: "18" },
      { label: "Admins", value: "03" },
      { label: "Branches", value: "05" },
    ],
    highlights: [
      "This should be tenant-scoped for company admins.",
      "Default company themes and custom fields stay separate from global system settings.",
      "Strict theme controls can be enforced per company without exposing platform controls.",
    ],
  },
  subscriberPromotions: {
    eyebrow: "Subscription & Billing",
    title: "Subscriber Promotions",
    description:
      "A Super Admin distribution area for granting promotions to every subscriber or selected companies.",
    icon: Tags,
    tone: "coral",
    metrics: [
      { label: "Assigned", value: "128" },
      { label: "Selected Companies", value: "16" },
      { label: "Scheduled", value: "05" },
    ],
    highlights: [
      "Promotion maintenance stays separate from subscriber assignment.",
      "Audience rules can target all subscribers or a selected company list.",
      "Assignment history can later connect to invoices and renewal credits.",
    ],
  },
  financialManagement: {
    eyebrow: "Core Module",
    title: "Financial Management",
    description:
      "A module landing mock for accounting-focused workflows, built to test card groupings and large action surfaces.",
    icon: TrendingUp,
    tone: "sky",
    metrics: [
      { label: "Open Periods", value: "03" },
      { label: "Reports", value: "16" },
      { label: "Exceptions", value: "05" },
    ],
    highlights: [
      "Good target for validating charts, ledgers, and approvals layouts.",
      "Keeps the modules menu feeling populated during design review.",
      "Can evolve into a proper financial command center later.",
    ],
  },
  salesManagement: {
    eyebrow: "Revenue Module",
    title: "Sales Management",
    description:
      "A sales module placeholder for pipeline summaries, order queues, and invoice flow experiments.",
    icon: BadgeCheck,
    tone: "coral",
    metrics: [
      { label: "Open Quotes", value: "27" },
      { label: "Orders Today", value: "18" },
      { label: "Collections", value: "$86K" },
    ],
    highlights: [
      "Supports future CRM-style cards without forcing backend work now.",
      "Useful for testing list layouts under moderate data density.",
      "Matches the sidebar structure from the reference design.",
    ],
  },
  purchasing: {
    eyebrow: "Operations Module",
    title: "Purchasing",
    description:
      "A purchasing placeholder page that gives procurement, approvals, and supplier queues a clean destination.",
    icon: ShoppingCart,
    tone: "citron",
    metrics: [
      { label: "Open POs", value: "34" },
      { label: "Suppliers", value: "58" },
      { label: "Urgent Items", value: "06" },
    ],
    highlights: [
      "Great for testing approval-heavy UI states.",
      "Makes the modules section immediately clickable during demos.",
      "Shares the same mock design system as the workspace overview.",
    ],
  },
  inventory: {
    eyebrow: "Operations Module",
    title: "Inventory",
    description:
      "A warehouse and stock visibility mock page for testing operational dashboards with dense information blocks.",
    icon: BarChart3,
    tone: "mint",
    metrics: [
      { label: "Warehouses", value: "09" },
      { label: "Low Stock", value: "14" },
      { label: "Transfers", value: "21" },
    ],
    highlights: [
      "Lets the team test KPI cards and warehouse queue layouts.",
      "Creates a believable module destination without live stock data.",
      "Supports future charts, movement logs, and alerts.",
    ],
  },
  projects: {
    eyebrow: "Delivery Module",
    title: "Projects",
    description:
      "A project operations mock that gives implementation teams a staging area for milestone and workload concepts.",
    icon: FolderKanban,
    tone: "violet",
    metrics: [
      { label: "Active Projects", value: "12" },
      { label: "Milestones", value: "48" },
      { label: "At Risk", value: "03" },
    ],
    highlights: [
      "Helps validate cross-functional layouts inside the modules shell.",
      "Useful for testing a more operations-oriented information architecture.",
      "Creates room for future planning tables and assignee cards.",
    ],
  },
  humanResources: {
    eyebrow: "People Module",
    title: "Human Resources",
    description:
      "A people ops placeholder page for employee summaries, requests, and policy notices with a softer presentation.",
    icon: Briefcase,
    tone: "sky",
    metrics: [
      { label: "Employees", value: "142" },
      { label: "Leave Requests", value: "09" },
      { label: "Open Roles", value: "04" },
    ],
    highlights: [
      "Useful for testing forms, announcements, and people-data cards.",
      "Keeps the module naming close to the provided reference.",
      "Can later connect cleanly to HR-specific services and hooks.",
    ],
  },
  reportsAnalytics: {
    eyebrow: "Insights Module",
    title: "Reports & Analytics",
    description:
      "A reporting destination mock for business summaries, exports, and cross-module insight cards.",
    icon: BarChart3,
    tone: "coral",
    metrics: [
      { label: "Saved Reports", value: "24" },
      { label: "Dashboards", value: "06" },
      { label: "Scheduled Runs", value: "13" },
    ],
    highlights: [
      "Ideal for validating larger chart containers and report actions.",
      "Acts as a realistic catch-all analytics surface for demos.",
      "Rounds out the module catalog with a familiar admin destination.",
    ],
  },
};
