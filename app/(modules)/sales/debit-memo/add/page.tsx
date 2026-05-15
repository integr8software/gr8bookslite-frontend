import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { DebitMemoAction } from "@/app/src/ui/modules/sales/debit-memo/Action";

const PageTitle = "Add Debit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesDebitMemoAddPage() {
  return <DebitMemoAction />;
}


