import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DebitMemoListPage } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoListPage";

const PageTitle = "Debit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesDebitMemoPage() {
  return <DebitMemoListPage />;
}
