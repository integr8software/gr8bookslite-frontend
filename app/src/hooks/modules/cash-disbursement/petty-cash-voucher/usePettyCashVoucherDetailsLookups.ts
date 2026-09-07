"use client";

import { useMemo } from "react";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import type { PettyCashVoucherFormValues } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { PartyLookupOption } from "@/app/src/types/modules/party-management/PartyLookupTypes";
import type { PostingAccountLookupOption } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupTypes";
import type { ResponsibilityCenterLookupOption } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterLookupTypes";

export type PettyCashVoucherLookupValues = Pick<
  PettyCashVoucherFormValues,
  "accountCode" | "accountTitle" | "partyCode" | "partyName" | "responsibilityCenterCode" | "responsibilityCenter"
>;

export function usePettyCashVoucherDetailsLookups(values: PettyCashVoucherLookupValues) {
  const partyQuery = usePartyLookup();
  const accountQuery = usePostingAccountLookup();
  const responsibilityCenterQuery = useResponsibilityCenterLookup();

  const partyOptions = useMemo<PartyLookupOption[]>(() => {
    const options = [...(partyQuery.data ?? [])];
    if (
      values.partyCode &&
      !options.some((opt) => opt.value === values.partyCode || opt.label === values.partyCode)
    ) {
      options.unshift({
        partyId: values.partyCode,
        partyCode: values.partyCode,
        partyName: values.partyName || values.partyCode,
        name: values.partyName || values.partyCode,
        label: values.partyCode,
        value: values.partyCode,
        description: values.partyName,
      });
    }
    return options;
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const accountOptions = useMemo<PostingAccountLookupOption[]>(() => {
    const options = [...(accountQuery.data ?? [])];
    if (
      values.accountCode &&
      !options.some((opt) => opt.value === values.accountCode || opt.label === values.accountCode)
    ) {
      options.unshift({
        accountId: values.accountCode,
        accountCode: values.accountCode,
        accountTitle: values.accountTitle || values.accountCode,
        name: values.accountTitle || values.accountCode,
        label: values.accountCode,
        value: values.accountCode,
        description: values.accountTitle,
      });
    }
    return options;
  }, [accountQuery.data, values.accountCode, values.accountTitle]);

  const responsibilityCenterOptions = useMemo<ResponsibilityCenterLookupOption[]>(() => {
    const base = (responsibilityCenterQuery.data ?? []).filter(
      (opt) => !opt.name?.toLowerCase().includes("project"),
    );
    const options = [...base];
    if (
      values.responsibilityCenterCode &&
      !options.some(
        (opt) => opt.value === values.responsibilityCenterCode || opt.label === values.responsibilityCenterCode,
      )
    ) {
      options.unshift({
        centerId: values.responsibilityCenterCode,
        code: values.responsibilityCenterCode,
        name: values.responsibilityCenter || values.responsibilityCenterCode,
        label: values.responsibilityCenterCode,
        value: values.responsibilityCenterCode,
        description: values.responsibilityCenter,
      });
    }
    return options;
  }, [responsibilityCenterQuery.data, values.responsibilityCenter, values.responsibilityCenterCode]);

  return {
    accountOptions,
    isAccountLookupLoading: accountQuery.isLoading,
    isPartyLookupLoading: partyQuery.isLoading,
    isResponsibilityCenterLookupLoading: responsibilityCenterQuery.isLoading,
    partyOptions,
    responsibilityCenterOptions,
  };
}
