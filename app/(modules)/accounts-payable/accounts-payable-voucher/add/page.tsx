import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { AccountsPayableVoucherAction } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/Action";

const PageTitle = "Add Accounts Payable Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function AccountsPayableAccountsPayableVoucherAddPage() {
  return <AccountsPayableVoucherAction />;
}


