import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  FolderKanban,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserRound,
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
      "A monitoring placeholder focused on timeline patterns, alert cards, and searchable records for UX review.",
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
