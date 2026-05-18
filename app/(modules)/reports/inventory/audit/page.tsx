import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryAuditMain } from "@/app/src/ui/modules/reports/inventory/audit/Main";

const PageTitle = "Audit";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsInventoryAuditPage() {
  return <InventoryAuditMain />;
}


