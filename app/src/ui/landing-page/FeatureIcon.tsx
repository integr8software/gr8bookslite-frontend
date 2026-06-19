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

const FeatureIcons = {
  accounting: ReceiptText,
  inventory: Warehouse,
  sales: FileText,
  purchasing: ClipboardCheck,
  approvals: BadgeCheck,
  reports: BarChart3,
  teams: Building2,
} as const;

export function FeatureIcon({
  name,
  className,
}: Readonly<{ name: LandingPageIconName; className?: string }>) {
  const Icon = FeatureIcons[name];
  return <Icon className={className} aria-hidden="true" />;
}
