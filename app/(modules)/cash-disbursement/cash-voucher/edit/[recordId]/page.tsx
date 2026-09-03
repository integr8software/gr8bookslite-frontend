import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashVoucherActionModes } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { CashVoucherActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherActionPage";

const PageTitle = "Edit Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashVoucherEditPage() {
  return <CashVoucherActionPage mode={CashVoucherActionModes.Edit} />;
}
