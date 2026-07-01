import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DebitMemoAction } from "@/app/src/ui/modules/sales/debit-memo/Action";

const PageTitle = "Edit Debit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesDebitMemoEditPage() {
  return <DebitMemoAction />;
}


