import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { CreditMemoAction } from "@/app/src/ui/modules/sales/credit-memo/Action";

const PageTitle = "Edit Credit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCreditMemoEditPage() {
  return <CreditMemoAction />;
}


