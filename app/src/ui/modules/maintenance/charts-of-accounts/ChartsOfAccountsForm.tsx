"use client";

import type {
  AccountLevel,
  ChartAccount,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsAccountFields } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsAccountFields";

type ChartsOfAccountsFormProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  accountCodeError?: string;
  availableAccountLevels: AccountLevel[];
  isAccountCodeLoading?: boolean;
  isReadOnly?: boolean;
  parentAccountError?: string;
  submitted: boolean;
  values: ChartAccountFormValues;
  onFieldChange: <Key extends keyof ChartAccountFormValues>(
    key: Key,
    value: ChartAccountFormValues[Key],
  ) => void;
  onParentChange: (parentId: string | null) => void;
};

export function ChartsOfAccountsForm(props: ChartsOfAccountsFormProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
      <ChartsOfAccountsAccountFields {...props} />
    </div>
  );
}
