import {
  BadgeCheck,
  BarChart3,
  Building2,
  ClipboardCheck,
  FileText,
  ReceiptText,
  Warehouse,
} from "lucide-react";
import type { LandingPageIconName } from "@/app/src/types/landing-page/LandingPageTypes";

const LandingPageIcons = {
  accounting: ReceiptText,
  inventory: Warehouse,
  sales: FileText,
  purchasing: ClipboardCheck,
  approvals: BadgeCheck,
  reports: BarChart3,
  teams: Building2,
} as const;

export function LandingPageIcon({
  name,
  className,
}: Readonly<{ name: LandingPageIconName; className?: string }>) {
  const Icon = LandingPageIcons[name];
  return <Icon className={className} aria-hidden="true" />;
}
