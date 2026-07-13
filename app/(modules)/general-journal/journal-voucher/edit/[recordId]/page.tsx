import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { JournalVoucherFormPage } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherFormPage";

const PageTitle = "Edit Journal Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function GeneralJournalJournalVoucherEditPage() {
  return <JournalVoucherFormPage />;
}


