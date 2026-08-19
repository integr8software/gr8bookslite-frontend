import type { Metadata } from "next";
import { CashVoucherAccountingGridPage } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/entries/CashVoucherAccountingGridPage";

export const metadata: Metadata = { title: "Cash Voucher Accounting Grid" };

export default function Page() {
  return <CashVoucherAccountingGridPage />;
}
