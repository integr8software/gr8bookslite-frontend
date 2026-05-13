"use client";

import {
  BarChart3,
  Building2,
  FolderKanban,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

export const workspaceSidebarIconMap = {
  dashboard: LayoutDashboard,
  "financial-management": Wallet,
  "sales-management": ReceiptText,
  purchasing: ShoppingCart,
  inventory: Package,
  projects: FolderKanban,
  "human-resources": Users,
  "reports-analytics": BarChart3,
  companies: Building2,
  "users-roles": Users,
  permissions: ShieldCheck,
  "audit-logs": ReceiptText,
  settings: Settings,
} as const;

export function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
