import type { ReactNode } from "react";
import type { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";

export type AccountsPayableVoucherPartyAddTarget = { kind: "expense"; id: string } | { kind: "accounting"; id: string };

export type AccountsPayableVoucherDataEntryTablesProps = {
  canAddPartyName: boolean;
  onAddPartyName: (target: AccountsPayableVoucherPartyAddTarget) => void;
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>;
};

export type AccountsPayableVoucherDataEntryPanelProps = AccountsPayableVoucherDataEntryTablesProps & {
  title: ReactNode;
};

export type AccountsPayableVoucherEntryView = "expense" | "accounting";
