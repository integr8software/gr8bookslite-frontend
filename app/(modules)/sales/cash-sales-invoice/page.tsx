import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashSalesInvoiceMain } from "@/app/src/ui/modules/sales/cash-sales-invoice/Main";

const PageTitle = "Cash Sales Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCashSalesInvoicePage() {
  return <CashSalesInvoiceMain />;
}


