import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherActionPage";

const PageTitle = "Edit Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherEditPage() {
  return <PettyCashVoucherActionPage />;
}


