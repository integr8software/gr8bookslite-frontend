import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCashVoucherPartyOptions,
  fetchCashVoucherResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherApi";
import { CashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherQueryKeys";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import type { CashVoucherDetailsFormProps } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export function useCashVoucherDetailsLookups(values: CashVoucherDetailsFormProps["values"]) {
  const partyOptionsQuery = useQuery({
    queryKey: PartyManagementQueryKeys.cashVoucherPartyOptions(),
    queryFn: fetchCashVoucherPartyOptions,
    staleTime: 60_000,
  });

  const responsibilityCentersQuery = useQuery({
    queryKey: CashVoucherQueryKeys.responsibilityCenters(),
    queryFn: fetchCashVoucherResponsibilityCenters,
    staleTime: 60_000,
  });

  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return createVoucherPartyOptions({
      baseOptions: partyOptionsQuery.data ?? [],
      currentPartyCode: values.partyCode,
      currentPartyName: values.partyName,
    });
  }, [partyOptionsQuery.data, values.partyCode, values.partyName]);

  const projectOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return createVoucherProjectOptions({
      baseOptions: responsibilityCentersQuery.data?.projects ?? [],
      currentProjectCode: values.projectCode || values.costCenter,
      currentProjectName: values.projectName,
    });
  }, [responsibilityCentersQuery.data, values.costCenter, values.projectCode, values.projectName]);

  return {
    isPartyLookupLoading: partyOptionsQuery.isLoading,
    isProjectLookupLoading: responsibilityCentersQuery.isLoading,
    partyOptions,
    projectOptions,
  };
}

function createVoucherPartyOptions({
  baseOptions,
  currentPartyCode,
  currentPartyName,
}: {
  baseOptions: readonly AppAdvancedDropdownOption[];
  currentPartyCode: string;
  currentPartyName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...baseOptions];

  if (currentPartyCode.trim() || currentPartyName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current voucher value",
      label: currentPartyCode || "Current voucher",
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode || currentPartyName,
    });
  }

  return options;
}

function createVoucherProjectOptions({
  baseOptions,
  currentProjectCode,
  currentProjectName,
}: {
  baseOptions: readonly AppAdvancedDropdownOption[];
  currentProjectCode: string;
  currentProjectName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...baseOptions];

  if (currentProjectName.trim()) {
    addUniqueDropdownOption(options, {
      label: currentProjectCode || "Current project",
      name: currentProjectName,
      value: currentProjectName,
    });
  }

  return options;
}

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
