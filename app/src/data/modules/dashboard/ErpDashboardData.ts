export const erpDashboardStats = [
  {
    label: "Total Companies",
    value: "5",
    helper: "4 Active â€¢ 1 Inactive",
    linkLabel: "View all",
    tone: "blue",
  },
  {
    label: "Total Revenue",
    value: "$12.45M",
    helper: "+12.5% vs last week",
    linkLabel: "View report",
    tone: "green",
  },
  {
    label: "Pending Approvals",
    value: "24",
    helper: "Across all companies",
    linkLabel: "View approvals",
    tone: "violet",
  },
  {
    label: "Active Users",
    value: "142",
    helper: "+8 this week",
    linkLabel: "View users",
    tone: "amber",
  },
] as const;

export const erpApprovalQueue = [
  {
    title: "Purchase Order #PO-10034",
    company: "Gr8 Construction Inc.",
    amount: "$25,000",
    when: "Today",
    priority: "High",
  },
  {
    title: "Expense Report #EXP-2048",
    company: "Gr8 Technologies Corp.",
    amount: "$1,250",
    when: "Today",
    priority: "Medium",
  },
  {
    title: "Journal Entry #JE-3092",
    company: "Gr8 Retail Solutions",
    amount: "$5,600",
    when: "Yesterday",
    priority: "Low",
  },
  {
    title: "Purchase Order #PO-10035",
    company: "Gr8 Manufacturing Inc.",
    amount: "$12,500",
    when: "Yesterday",
    priority: "Medium",
  },
];

export const erpRecentActivity = [
  "Maria Santos created a new purchase order PO-10036 for Gr8 Construction Inc.",
  "You approved expense report EXP-2047 for Gr8 Technologies Corp.",
];

export const erpSystemNotifications = [
  "System Maintenance scheduled on May 30, 2024 from 10:00 PM to 12:00 AM (PST).",
];
