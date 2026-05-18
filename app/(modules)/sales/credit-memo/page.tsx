import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CreditMemoMain } from "@/app/src/ui/modules/sales/credit-memo/Main";

const PageTitle = "Credit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCreditMemoPage() {
  return <CreditMemoMain />;
}


