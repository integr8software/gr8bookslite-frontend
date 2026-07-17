"use client";

import { useState } from "react";
import { ChartsOfAccountsDrawerTabs } from "@/app/src/constants/modules/maintenance/charts-of-accounts/ChartsOfAccountsConstants";
import type {
  BankDetailsKey,
  ChartsOfAccountsFormProps,
  ChartsOfAccountsFormTab,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  isAccountInformationIncomplete,
  isBankDetailsIncomplete,
} from "@/app/src/validations/modules/maintenance/charts-of-accounts/ChartsOfAccountsValidation";
import { ChartsOfAccountsAccountFields } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsAccountFields";
import { ChartsOfAccountsBankFields } from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsBankFields";

export function ChartsOfAccountsForm(props: ChartsOfAccountsFormProps) {
  const [selectedTab, setSelectedTab] =
    useState<ChartsOfAccountsFormTab>("Account Information");
  const visibleTabs = props.values.isBankLinked
    ? ChartsOfAccountsDrawerTabs
    : (["Account Information"] satisfies ChartsOfAccountsFormTab[]);
  const activeTab = visibleTabs.includes(selectedTab)
    ? selectedTab
    : "Account Information";
  const hasBankDetailsError =
    props.submitted &&
    props.values.isBankLinked &&
    isBankDetailsIncomplete(props.values);
  const hasAccountInformationError =
    props.submitted && isAccountInformationIncomplete(props);

  function handleBankFieldChange(key: BankDetailsKey, value: string) {
    props.onFieldChange("bankDetails", {
      ...props.values.bankDetails,
      [key]: value,
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ChartsOfAccountsLinkedDetailsTabs
        hasAccountInformationError={hasAccountInformationError}
        hasBankDetailsError={hasBankDetailsError}
        options={visibleTabs}
        value={activeTab}
        onChange={setSelectedTab}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-5">
        {activeTab === "Bank Details" && props.values.isBankLinked ? (
          <ChartsOfAccountsBankFields
            readOnly={props.isReadOnly}
            submitted={props.submitted}
            values={props.values}
            onBankFieldChange={handleBankFieldChange}
          />
        ) : (
          <ChartsOfAccountsAccountFields {...props} />
        )}
      </div>
    </div>
  );
}

function ChartsOfAccountsLinkedDetailsTabs({
  hasAccountInformationError,
  hasBankDetailsError,
  options,
  value,
  onChange,
}: {
  hasAccountInformationError: boolean;
  hasBankDetailsError: boolean;
  options: ChartsOfAccountsFormTab[];
  value: ChartsOfAccountsFormTab;
  onChange: (value: ChartsOfAccountsFormTab) => void;
}) {
  return (
    <div className="flex h-10 shrink-0 items-end gap-5 border-b border-darknavy/10 px-6">
      {options.map((option) => {
        const isActive = value === option;
        const hasError =
          (option === "Account Information" && hasAccountInformationError) ||
          (option === "Bank Details" && hasBankDetailsError);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              "h-9 whitespace-nowrap border-b-2 text-sm font-semibold transition",
              isActive
                ? "border-skyblue text-skyblue"
                : "border-transparent text-darknavy/45 hover:text-darknavy/70",
            ].join(" ")}
          >
            <span className="relative inline-block">
              {option}
              {hasError ? (
                <span className="absolute -right-2 -top-0.5 h-1.5 w-1.5 rounded-full bg-coralpink" />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

