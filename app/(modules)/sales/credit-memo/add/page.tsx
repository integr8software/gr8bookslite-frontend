import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CreditMemoAction } from "@/app/src/ui/modules/sales/credit-memo/Action";

const PageTitle = "Add Credit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCreditMemoAddPage() {
  return <CreditMemoAction />;
}


