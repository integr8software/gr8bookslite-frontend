import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashVoucherAccountingGridPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherAccountingGridPage";

const PageTitle = "Cash Voucher Accounting Grid";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashVoucherAccountingGridPage() {
  return <CashVoucherAccountingGridPage />;
}
