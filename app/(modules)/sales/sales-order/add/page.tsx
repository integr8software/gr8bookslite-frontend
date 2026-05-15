import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { SalesOrderAction } from "@/app/src/ui/modules/sales/sales-order/Action";

const PageTitle = "Add Sales Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesOrderAddPage() {
  return <SalesOrderAction />;
}


