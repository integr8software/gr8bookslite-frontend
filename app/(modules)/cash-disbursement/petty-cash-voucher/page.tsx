import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashVoucherMain } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/Main";

const PageTitle = "Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherPage() {
  return <PettyCashVoucherMain />;
}


