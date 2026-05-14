import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CashSalesInvoiceAction } from "@/app/src/ui/modules/sales/cash-sales-invoice/Action";

const PageTitle = "Add Cash Sales Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCashSalesInvoiceAddPage() {
  return <CashSalesInvoiceAction />;
}


