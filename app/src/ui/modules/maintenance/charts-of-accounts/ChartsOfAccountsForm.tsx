"use client";

import type {
  AccountLevel,
  BankDetailsKey,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsFormTab,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsAccountFields } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsAccountFields";
import { ChartsOfAccountsBankFields } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsBankFields";

type ChartsOfAccountsFormProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  activeTab: ChartsOfAccountsFormTab;
  accountCodeError?: string;
  availableAccountLevels: AccountLevel[];
  isAccountCodeLoading?: boolean;
  submitted: boolean;
  values: ChartAccountFormValues;
  onBankFieldChange: (key: BankDetailsKey, value: string) => void;
  onFieldChange: <Key extends keyof ChartAccountFormValues>(
    key: Key,
    value: ChartAccountFormValues[Key],
  ) => void;
  onParentChange: (parentId: string | null) => void;
};

export function ChartsOfAccountsForm(props: ChartsOfAccountsFormProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
      {props.activeTab === "Account Information" ? (
        <ChartsOfAccountsAccountFields {...props} />
      ) : (
        <ChartsOfAccountsBankFields
          values={props.values}
          onBankFieldChange={props.onBankFieldChange}
        />
      )}
    </div>
  );
}
