import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { JournalVoucherMain } from "@/app/src/ui/modules/general-journal/journal-voucher/Main";

const PageTitle = "Journal Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function GeneralJournalJournalVoucherPage() {
  return <JournalVoucherMain />;
}


