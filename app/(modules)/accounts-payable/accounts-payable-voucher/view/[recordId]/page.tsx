import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { AccountsPayableVoucherAction } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/Action";

const PageTitle = "View Accounts Payable Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function AccountsPayableAccountsPayableVoucherViewPage() {
  return <AccountsPayableVoucherAction />;
}


