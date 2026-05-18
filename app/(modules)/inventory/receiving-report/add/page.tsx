import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ReceivingReportAction } from "@/app/src/ui/modules/inventory/receiving-report/Action";

const PageTitle = "Add Receiving Report";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryReceivingReportAddPage() {
  return <ReceivingReportAction />;
}


