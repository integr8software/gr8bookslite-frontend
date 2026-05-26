import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { SalesOrderAction } from "@/app/src/ui/modules/sales/sales-order/Action";

const PageTitle = "View Sales Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesOrderViewPage() {
  return <SalesOrderAction />;
}


