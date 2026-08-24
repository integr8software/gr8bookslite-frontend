import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesOrderActionPage } from "@/app/src/ui/modules/sales/sales-order/action/SalesOrderActionPage";

const PageTitle = "Add Sales Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesOrderAddPage() {
  return <SalesOrderActionPage />;
}
