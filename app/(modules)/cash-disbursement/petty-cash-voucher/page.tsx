import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashVoucherOverviewPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/overview/PettyCashVoucherOverviewPage";

const PageTitle = "Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherPage() {
  return <PettyCashVoucherOverviewPage />;
}


