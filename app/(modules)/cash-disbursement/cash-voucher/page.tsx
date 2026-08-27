import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashVoucherOverviewPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherOverviewPage";

const PageTitle = "Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashVoucherPage() {
  return <CashVoucherOverviewPage />;
}
