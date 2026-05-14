import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export type ModulesWizardStepId =
  | "module"
  | "configuration"
  | "access"
  | "review";

export type ModulesWizardStep = {
  id: ModulesWizardStepId;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
};

export type ModulesWizardOption = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  recommended?: boolean;
};

export type ModulesWizardValues = {
  moduleId: string;
  setupMode: string;
  rolloutDate: string;
  accessLevel: string;
  assignedTeam: string;
  notes: string;
};

export const ModulesWizardInitialValues: ModulesWizardValues = {
  moduleId: "financial-management",
  setupMode: "guided",
  rolloutDate: "",
  accessLevel: "managers",
  assignedTeam: "finance",
  notes: "",
};

export const ModulesWizardSteps: ModulesWizardStep[] = [
  {
    id: "module",
    title: "Choose Module",
    eyebrow: "Step 1",
    description: "Select the module workspace that needs setup.",
    icon: Boxes,
  },
  {
    id: "configuration",
    title: "Configure",
    eyebrow: "Step 2",
    description: "Pick the setup style and target rollout date.",
    icon: Settings2,
  },
  {
    id: "access",
    title: "Assign Access",
    eyebrow: "Step 3",
    description: "Choose the starting team and permission level.",
    icon: UsersRound,
  },
  {
    id: "review",
    title: "Review",
    eyebrow: "Step 4",
    description: "Confirm the wizard details before activation.",
    icon: ShieldCheck,
  },
];

export const ModulesWizardModuleOptions: ModulesWizardOption[] = [
  {
    id: "financial-management",
    title: "Financial Management",
    description: "Chart of accounts, journals, cash, banking, and reports.",
    icon: ChartNoAxesCombined,
    recommended: true,
  },
  {
    id: "sales-management",
    title: "Sales Management",
    description: "Quotes, orders, billing, invoices, and revenue workflows.",
    icon: FileText,
  },
  {
    id: "inventory",
    title: "Inventory",
    description: "Stock movement, item records, warehouses, and adjustments.",
    icon: ClipboardList,
  },
];

export const ModulesWizardSetupOptions: ModulesWizardOption[] = [
  {
    id: "guided",
    title: "Guided setup",
    description: "Use recommended defaults and complete required fields first.",
    icon: ShieldCheck,
    recommended: true,
  },
  {
    id: "manual",
    title: "Manual setup",
    description: "Start with a blank configuration for advanced admins.",
    icon: Settings2,
  },
];

export const ModulesWizardAccessOptions: ModulesWizardOption[] = [
  {
    id: "admins",
    title: "Administrators",
    description: "Full configuration access for workspace admins.",
    icon: ShieldCheck,
  },
  {
    id: "managers",
    title: "Managers",
    description: "Operational access for module owners and approvers.",
    icon: UsersRound,
    recommended: true,
  },
  {
    id: "staff",
    title: "Staff",
    description: "Limited access for day-to-day transaction users.",
    icon: ClipboardList,
  },
];

export const ModulesWizardTeamOptions = [
  { id: "finance", label: "Finance Team" },
  { id: "operations", label: "Operations Team" },
  { id: "sales", label: "Sales Team" },
  { id: "administration", label: "Administration Team" },
];
