import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChartColumnBig,
  ClipboardCheck,
  FileClock,
  FileText,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

export type WorkspaceCompanyRecord = {
  id: string;
  initials: string;
  name: string;
  branchCode: string;
  branchName: string;
  status: "Active" | "Inactive";
  monthlyRevenue: string;
  monthlyExpenses: string;
  netProfit: string;
  trend: number[];
  tone: "sky" | "citron" | "coral" | "dark" | "mint" | "violet";
};

export type WorkspaceSummaryCard = {
  title: string;
  value: string;
  supportingText: string;
  actionLabel: string;
  icon: LucideIcon;
  tone: "sky" | "citron" | "coral" | "violet" | "mint";
};

export type WorkspaceApprovalItem = {
  id: string;
  title: string;
  company: string;
  amount: string;
  dateLabel: string;
  priority: "High" | "Medium" | "Low";
  icon: LucideIcon;
  tone: "coral" | "citron" | "sky" | "mint" | "violet";
};

export type WorkspaceTimelineItem = {
  id: string;
  title: string;
  timestamp: string;
  icon: LucideIcon;
  tone: "sky" | "mint" | "violet";
};

export const WorkspaceCompanies: WorkspaceCompanyRecord[] = [
  {
    id: "company-gr8-construction",
    initials: "GC",
    name: "Gr8 Construction Inc.",
    branchCode: "MAIN",
    branchName: "Main Branch",
    status: "Active",
    monthlyRevenue: "$4.25M",
    monthlyExpenses: "$3.10M",
    netProfit: "$1.15M",
    trend: [28, 24, 39, 34, 45, 42, 57],
    tone: "sky",
  },
  {
    id: "company-gr8-technologies",
    initials: "GT",
    name: "Gr8 Technologies Corp.",
    branchCode: "BGC",
    branchName: "BGC Branch",
    status: "Active",
    monthlyRevenue: "$3.60M",
    monthlyExpenses: "$2.45M",
    netProfit: "$1.15M",
    trend: [22, 30, 27, 35, 33, 44, 48],
    tone: "violet",
  },
  {
    id: "company-gr8-retail",
    initials: "GR",
    name: "Gr8 Retail Solutions",
    branchCode: "CEB",
    branchName: "Cebu Branch",
    status: "Active",
    monthlyRevenue: "$2.30M",
    monthlyExpenses: "$1.80M",
    netProfit: "$0.50M",
    trend: [18, 16, 26, 21, 20, 31, 37],
    tone: "coral",
  },
  {
    id: "company-gr8-manufacturing",
    initials: "GM",
    name: "Gr8 Manufacturing Inc.",
    branchCode: "LAG",
    branchName: "Laguna Plant",
    status: "Active",
    monthlyRevenue: "$1.75M",
    monthlyExpenses: "$1.40M",
    netProfit: "$0.35M",
    trend: [12, 18, 15, 17, 26, 23, 32],
    tone: "mint",
  },
  {
    id: "company-gr8-services",
    initials: "GS",
    name: "Gr8 Services Group",
    branchCode: "MKT",
    branchName: "Makati Branch",
    status: "Inactive",
    monthlyRevenue: "$550K",
    monthlyExpenses: "$480K",
    netProfit: "$70K",
    trend: [8, 7, 13, 12, 16, 15, 20],
    tone: "dark",
  },
];

export const WorkspaceSummaryCards: WorkspaceSummaryCard[] = [
  {
    title: "Total Companies",
    value: "5",
    supportingText: "4 active / 1 inactive",
    actionLabel: "View all",
    icon: Building2,
    tone: "sky",
  },
  {
    title: "Total Revenue",
    value: "$12.45M",
    supportingText: "+12.5% vs last week",
    actionLabel: "View report",
    icon: ChartColumnBig,
    tone: "mint",
  },
  {
    title: "Pending Approvals",
    value: "24",
    supportingText: "Across all companies",
    actionLabel: "View approvals",
    icon: ClipboardCheck,
    tone: "violet",
  },
  {
    title: "Active Users",
    value: "142",
    supportingText: "+8 this week",
    actionLabel: "View users",
    icon: Users,
    tone: "coral",
  },
];

export const WorkspaceApprovalQueue: WorkspaceApprovalItem[] = [
  {
    id: "approval-po-10034",
    title: "Purchase Order #PO-10034",
    company: "Gr8 Construction Inc.",
    amount: "$25,000",
    dateLabel: "Today",
    priority: "High",
    icon: ShoppingCart,
    tone: "coral",
  },
  {
    id: "approval-exp-2048",
    title: "Expense Report #EXP-2048",
    company: "Gr8 Technologies Corp.",
    amount: "$1,250",
    dateLabel: "Today",
    priority: "Medium",
    icon: FileText,
    tone: "citron",
  },
  {
    id: "approval-je-3092",
    title: "Journal Entry #JE-3092",
    company: "Gr8 Retail Solutions",
    amount: "$5,600",
    dateLabel: "Yesterday",
    priority: "Low",
    icon: Receipt,
    tone: "sky",
  },
  {
    id: "approval-po-10035",
    title: "Purchase Order #PO-10035",
    company: "Gr8 Manufacturing Inc.",
    amount: "$12,500",
    dateLabel: "Yesterday",
    priority: "Medium",
    icon: ShoppingCart,
    tone: "mint",
  },
  {
    id: "approval-exp-2050",
    title: "Expense Report #EXP-2050",
    company: "Gr8 Services Group",
    amount: "$950",
    dateLabel: "May 24, 2024",
    priority: "Low",
    icon: FileClock,
    tone: "violet",
  },
];

export const WorkspaceRecentActivity: WorkspaceTimelineItem[] = [
  {
    id: "activity-001",
    title:
      "Maria Santos created a new purchase order PO-10036 for Gr8 Construction Inc.",
    timestamp: "2 minutes ago",
    icon: Building2,
    tone: "mint",
  },
  {
    id: "activity-002",
    title: "You approved expense report EXP-2047 for Gr8 Technologies Corp.",
    timestamp: "15 minutes ago",
    icon: Users,
    tone: "violet",
  },
];

export const WorkspaceSystemNotifications: WorkspaceTimelineItem[] = [
  {
    id: "notification-001",
    title:
      "System Maintenance scheduled on May 30, 2024 from 10:00 PM to 12:00 AM (PST).",
    timestamp: "1 hour ago",
    icon: ShieldCheck,
    tone: "sky",
  },
];
