import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ReceivingReportAction } from "@/app/src/ui/modules/inventory/receiving-report/Action";

const PageTitle = "Edit Receiving Report";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryReceivingReportEditPage() {
  return <ReceivingReportAction />;
}


