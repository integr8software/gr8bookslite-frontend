import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ReceivingReportMain } from "@/app/src/ui/modules/inventory/receiving-report/Main";

const PageTitle = "Receiving Report";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryReceivingReportPage() {
  return <ReceivingReportMain />;
}


