"use client";

import { Plus } from "lucide-react";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function ChartsOfAccountsHeader({ onAddAccount, canCreate }: { onAddAccount: () => void; canCreate: boolean }) {
  return (
    <ModuleHeader
      variant="plain"
      data-spotlight-id="charts-of-accounts-header"
      titleAs="h1"
      title="Chart of Accounts"
      description="Manage all company accounts and financial statement mapping."
      actions={
        canCreate ? (
          <button
            type="button"
            className={moduleHeaderActionClassNames.primary}
            onClick={onAddAccount}
            data-spotlight-id="charts-of-accounts-add-account"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Account
          </button>
        ) : null
      }
    />
  );
}
