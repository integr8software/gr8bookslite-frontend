import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesOrderOverviewPage } from "@/app/src/ui/modules/sales/sales-order/overview/SalesOrderOverviewPage";

const PageTitle = "Sales Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesOrderPage() {
  return <SalesOrderOverviewPage />;
}
