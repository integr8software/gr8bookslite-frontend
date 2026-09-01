import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CreditMemoListPage } from "@/app/src/ui/modules/general-journal/credit-memo/CreditMemoListPage";

const PageTitle = "Credit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCreditMemoPage() {
  return <CreditMemoListPage />;
}
