import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CreditMemoFormPage } from "@/app/src/ui/modules/general-journal/credit-memo/CreditMemoFormPage";

const PageTitle = "Add Credit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesCreditMemoAddPage() {
  return <CreditMemoFormPage />;
}
