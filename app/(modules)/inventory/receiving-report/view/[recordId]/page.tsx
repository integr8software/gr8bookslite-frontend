import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ReceivingReportActionPage } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportActionPage";

const PageTitle = "View Receiving Report";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryReceivingReportViewPage() {
  return <ReceivingReportActionPage />;
}


