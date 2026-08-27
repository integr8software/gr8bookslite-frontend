import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DebitMemoFormPage } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoFormPage";

const PageTitle = "View Debit Memo";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function GeneralJournalDebitMemoViewPage() {
  return <DebitMemoFormPage />;
}
