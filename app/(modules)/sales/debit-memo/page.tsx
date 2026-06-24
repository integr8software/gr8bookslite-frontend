import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DebitMemoMain } from "@/app/src/ui/modules/sales/debit-memo/Main";

const PageTitle = "Debit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesDebitMemoPage() {
  return <DebitMemoMain />;
}


