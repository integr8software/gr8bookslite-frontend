"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type MaintenanceDetailsLookupValues = {
  accountCode: string;
  accountTitle: string;
  partyCode: string;
  partyName: string;
  projectCode?: string;
  projectName?: string;
  responsibilityCenter?: string;
  responsibilityCenterCode?: string;
};

export type MaintenanceDetailsLookupsOptions = {
  fetchAccountOptions: () => Promise<AppAdvancedDropdownOption[]>;
  fetchPartyOptions: () => Promise<AppAdvancedDropdownOption[]>;
  fetchResponsibilityCenterOptions: () => Promise<AppAdvancedDropdownOption[]>;
  moduleKey: string;
  querySegment: string;
  values: MaintenanceDetailsLookupValues;
};

export function useMaintenanceDetailsLookups({
  fetchAccountOptions,
  fetchPartyOptions,
  fetchResponsibilityCenterOptions,
  moduleKey,
  querySegment,
  values,
}: MaintenanceDetailsLookupsOptions) {
  const partyQuery = useQuery({
    queryKey: [querySegment, moduleKey, "parties"],
    queryFn: fetchPartyOptions,
  });

  const accountQuery = useQuery({
    queryKey: [querySegment, moduleKey, "accounts"],
    queryFn: fetchAccountOptions,
  });

  const responsibilityCenterQuery = useQuery({
    queryKey: [querySegment, moduleKey, "responsibility-centers"],
    queryFn: fetchResponsibilityCenterOptions,
  });

  const partyOptions = useMemo(() => {
    const options = [...(partyQuery.data ?? [])];
    if (values.partyCode && !options.some((option) => option.value === values.partyCode || option.label === values.partyCode)) {
      options.unshift({
        name: values.partyName || values.partyCode,
        label: values.partyCode,
        value: values.partyCode,
        description: values.partyName,
      });
    }
    return options;
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const accountOptions = useMemo(() => {
    const options = [...(accountQuery.data ?? [])];
    if (values.accountCode && !options.some((option) => option.value === values.accountCode || option.label === values.accountCode)) {
      options.unshift({
        name: values.accountTitle || values.accountCode,
        label: values.accountCode,
        value: values.accountCode,
        description: values.accountTitle,
      });
    }
    return options;
  }, [accountQuery.data, values.accountCode, values.accountTitle]);

  const responsibilityCenterOptions = useMemo(() => {
    const options = createResponsibilityCenterOptions(responsibilityCenterQuery.data ?? [], false);
    if (
      values.responsibilityCenterCode &&
      !options.some((option) => option.value === values.responsibilityCenterCode || option.label === values.responsibilityCenterCode)
    ) {
      options.unshift({
        name: values.responsibilityCenter || values.responsibilityCenterCode,
        label: values.responsibilityCenterCode,
        value: values.responsibilityCenterCode,
        description: values.responsibilityCenter,
      });
    }
    return options;
  }, [responsibilityCenterQuery.data, values.responsibilityCenter, values.responsibilityCenterCode]);

  const projectOptions = useMemo(() => {
    const rawProjectOptions = createResponsibilityCenterOptions(responsibilityCenterQuery.data ?? [], true);
    const options = rawProjectOptions.length > 0 ? rawProjectOptions : [...(responsibilityCenterQuery.data ?? [])];
    if (values.projectCode && !options.some((option) => option.value === values.projectCode || option.label === values.projectCode)) {
      options.unshift({
        name: values.projectName || values.projectCode,
        label: values.projectCode,
        value: values.projectCode,
        description: values.projectName,
      });
    }
    return options;
  }, [responsibilityCenterQuery.data, values.projectCode, values.projectName]);

  return {
    accountOptions,
    isAccountLookupLoading: accountQuery.isLoading,
    isPartyLookupLoading: partyQuery.isLoading,
    isProjectLookupLoading: responsibilityCenterQuery.isLoading,
    isResponsibilityCenterLookupLoading: responsibilityCenterQuery.isLoading,
    partyOptions,
    projectOptions,
    responsibilityCenterOptions,
  };
}

function createResponsibilityCenterOptions(options: AppAdvancedDropdownOption[], isProject: boolean) {
  return options.filter((option) => Boolean(option.name?.toLowerCase().includes("project")) === isProject);
}
