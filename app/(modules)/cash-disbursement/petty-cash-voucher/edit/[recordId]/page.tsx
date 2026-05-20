import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashVoucherAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/Action";

const PageTitle = "Edit Petty Cash Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashVoucherEditPage() {
  return <PettyCashVoucherAction />;
}


