import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherActionPage";

const PageTitle = "View Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherViewPage() {
  return <PettyCashVoucherActionPage />;
}


