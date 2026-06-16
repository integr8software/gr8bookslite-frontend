"use client";

import { Download, Home, Plus, Upload } from "lucide-react";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function ChartsOfAccountsHeader({
  onAddAccount,
}: {
  onAddAccount: () => void;
}) {
  return (
    <ModuleHeader
      variant="panel"
      data-spotlight-id="charts-of-accounts-header"
      titleAs="h1"
      title="Chart of Accounts"
      description="Manage all company accounts and financial statement mapping"
      eyebrow={
        <>
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Accounting master data
        </>
      }
      actions={
        <>
          <button
            type="button"
            className={moduleHeaderActionClassNames.secondary}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            className={moduleHeaderActionClassNames.secondary}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className={moduleHeaderActionClassNames.primary}
            onClick={onAddAccount}
            data-spotlight-id="charts-of-accounts-add-account"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Account
          </button>
        </>
      }
    />
  );
}
