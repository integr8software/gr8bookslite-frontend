import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { JournalVoucherAction } from "@/app/src/ui/modules/general-journal/journal-voucher/Action";

const PageTitle = "Edit Journal Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function GeneralJournalJournalVoucherEditPage() {
  return <JournalVoucherAction />;
}


