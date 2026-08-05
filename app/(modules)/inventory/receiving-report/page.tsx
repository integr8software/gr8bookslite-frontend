import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ReceivingReportListPage } from "@/app/src/ui/modules/inventory/receiving-report/overview/ReceivingReportListPage";

const PageTitle = "Receiving Report";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryReceivingReportPage() {
  return <ReceivingReportListPage />;
}
