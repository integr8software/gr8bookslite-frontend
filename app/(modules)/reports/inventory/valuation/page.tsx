import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryValuationMain } from "@/app/src/ui/modules/reports/inventory/valuation/Main";

const PageTitle = "Valuation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsInventoryValuationPage() {
  return <InventoryValuationMain />;
}


