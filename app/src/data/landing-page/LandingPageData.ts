import type {
  LandingPageHighlight,
  LandingPageModule,
} from "@/app/src/types/landing-page/LandingPageTypes";

export const LandingPageBenefits = [
  "Accounting and inventory in one operating view",
  "Approvals, audit trails, and role-based workspace control",
  "Reports that stay connected to day-to-day transactions",
] as const;

export const LandingPageModules = [
  {
    icon: "accounting",
    label: "Accounting",
    text: "Clean ledgers, vouchers, journals, and connected financial records.",
  },
  {
    icon: "inventory",
    label: "Inventory",
    text: "Track items, warehouses, receiving, releasing, and stock movement.",
  },
  {
    icon: "sales",
    label: "Sales",
    text: "Manage customer transactions from documents to posting workflows.",
  },
  {
    icon: "purchasing",
    label: "Purchasing",
    text: "Control requests, orders, supplier documents, and approvals.",
  },
  {
    icon: "approvals",
    label: "Approvals",
    text: "Route work through accountable reviews with audit-ready actions.",
  },
  {
    icon: "reports",
    label: "Reports",
    text: "Turn daily activity into practical financial and operational insight.",
  },
] as const satisfies readonly LandingPageModule[];

export const LandingPageHighlights = [
  {
    icon: "inventory",
    title: "Inventory-aware books",
    text: "Stock movement, receiving, delivery, and valuation stay close to the financial records.",
  },
  {
    icon: "approvals",
    title: "Controlled operations",
    text: "Users, branches, approvals, and audit trails help keep work accountable as the company grows.",
  },
  {
    icon: "teams",
    title: "Built for teams",
    text: "One SaaS workspace for companies that need practical accounting workflows without scattered files.",
  },
] as const satisfies readonly LandingPageHighlight[];
