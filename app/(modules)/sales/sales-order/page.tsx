import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { SalesOrderMain } from "@/app/src/ui/modules/sales/sales-order/Main";

const PageTitle = "Sales Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesOrderPage() {
  return <SalesOrderMain />;
}


