import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AccountsPayableVoucherMain } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/Main";

const PageTitle = "Accounts Payable Voucher";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function AccountsPayableAccountsPayableVoucherPage() {
  return <AccountsPayableVoucherMain />;
}


