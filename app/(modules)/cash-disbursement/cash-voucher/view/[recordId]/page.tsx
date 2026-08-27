import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherActionPage";

const PageTitle = "View Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashVoucherViewPage() {
  return <CashVoucherActionPage mode="view" />;
}
