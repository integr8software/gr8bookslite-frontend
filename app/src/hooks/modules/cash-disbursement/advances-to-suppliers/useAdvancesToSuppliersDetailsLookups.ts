"use client";

import { useMemo } from "react";
import { createProjectCodeLookupOptions } from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceLookupData";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import { useProjectMaintenanceLookup } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import type { AdvancesToSuppliersFormValues } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { PartyLookupOption } from "@/app/src/types/modules/party-management/PartyLookupTypes";
import type { PostingAccountLookupOption } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupTypes";
import type { ResponsibilityCenterLookupOption } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterLookupTypes";

export type AdvancesToSuppliersLookupValues = Pick<
  AdvancesToSuppliersFormValues,
  | "accountCode"
  | "accountTitle"
  | "partyCode"
  | "partyName"
  | "projectCode"
  | "projectName"
  | "responsibilityCenter"
  | "responsibilityCenterCode"
>;

export function useAdvancesToSuppliersDetailsLookups(values: AdvancesToSuppliersLookupValues) {
  const partyQuery = usePartyLookup({ detail: "complete" });
  const accountQuery = usePostingAccountLookup();
  const responsibilityCenterQuery = useResponsibilityCenterLookup();
  const projectQuery = useProjectMaintenanceLookup();

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
    const accounts = accountQuery.data ?? [];
    const supplierAdvanceAccounts = accounts.filter((account) => {
      const title = String(account.accountTitle ?? account.name ?? "").toLowerCase();
      return title.includes("advance") || title.includes("supplier") || title.includes("deposit");
    });
    const base = supplierAdvanceAccounts.length > 0 ? supplierAdvanceAccounts : accounts;
    const options = base.map((account) => ({
      ...account,
      name: account.accountTitle || account.name,
      label: account.accountCode || account.label,
      value: account.accountCode || account.value,
      description: "",
      selectedDetails: account.accountCode || account.label,
    }));

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
        description: "",
        selectedDetails: values.accountCode,
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
        description: "",
      });
    }
    return options;
  }, [responsibilityCenterQuery.data, values.responsibilityCenter, values.responsibilityCenterCode]);

  const projectOptions = useMemo(
    () =>
      createProjectCodeLookupOptions({
        currentProjectCode: values.projectCode,
        currentProjectName: values.projectName,
        options: projectQuery.data ?? [],
      }),
    [projectQuery.data, values.projectCode, values.projectName],
  );

  const isPartyLookupLoading = partyQuery.isLoading;
  const isAccountLookupLoading = accountQuery.isLoading;
  const isResponsibilityCenterLookupLoading = responsibilityCenterQuery.isLoading;
  const isProjectLookupLoading = projectQuery.isLoading;
  const isLookupLoading =
    isPartyLookupLoading || isAccountLookupLoading || isResponsibilityCenterLookupLoading || isProjectLookupLoading;

  return {
    accountOptions,
    isAccountLookupLoading,
    isLookupLoading,
    isPartyLookupLoading,
    isProjectLookupLoading,
    isResponsibilityCenterLookupLoading,
    partyOptions,
    projectOptions,
    responsibilityCenterOptions,
  };
}
