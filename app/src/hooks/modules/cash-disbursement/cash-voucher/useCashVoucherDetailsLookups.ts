"use client";

import { useMemo } from "react";
import { createProjectNameLookupOptions } from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceLookupData";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { useProjectMaintenanceLookup } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import type { CashVoucherDetailsFormProps } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type CashVoucherLookupValues = {
  costCenter?: string;
  partyCode?: string;
  partyName?: string;
  projectCode?: string;
  projectName?: string;
};

export function useCashVoucherDetailsLookups(values: CashVoucherLookupValues | CashVoucherDetailsFormProps["values"] = {}) {
  const partyQuery = usePartyLookup();
  const projectQuery = useProjectMaintenanceLookup();

  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const list: AppAdvancedDropdownOption[] = (partyQuery.data ?? []).map((party) => ({
      label: party.partyCode || party.label,
      name: party.partyName || party.name,
      value: party.partyCode || party.value,
      description: party.description,
    }));

    if (values.partyCode && !list.some((opt) => opt.value === values.partyCode)) {
      list.unshift({
        label: values.partyCode,
        name: values.partyName || values.partyCode,
        value: values.partyCode,
      });
    }

    return list;
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const projectOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return createProjectNameLookupOptions({
      currentProjectCode: values.projectCode || values.costCenter,
      currentProjectName: values.projectName,
      options: projectQuery.data ?? [],
    });
  }, [projectQuery.data, values.costCenter, values.projectCode, values.projectName]);

  return {
    isPartyLookupLoading: partyQuery.isLoading,
    isProjectLookupLoading: projectQuery.isLoading,
    partyOptions,
    projectOptions,
  };
}
