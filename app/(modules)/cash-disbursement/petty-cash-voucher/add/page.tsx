import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherActionPage";

const PageTitle = "Add Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherAddPage() {
  return <PettyCashVoucherActionPage />;
}


