import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCashAdvanceAccountOptions,
  fetchCashAdvancePartyOptions,
  fetchCashAdvanceResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import type {
  CashAdvanceAccountDropdownOption,
  CashAdvanceFormController,
  CashAdvancePartyDropdownOption,
  CashAdvanceResponsibilityCenterDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

const CashAdvanceDetailsLookupQuerySegment = "cash-disbursement";
const CashAdvanceDetailsLookupModuleSegment = "cash-advance";

export function useCashAdvanceDetailsLookups(form: CashAdvanceFormController) {
  const partyQuery = useQuery({
    queryKey: PartyManagementQueryKeys.cashAdvancePartyOptions(),
    queryFn: fetchCashAdvancePartyOptions,
  });

  const accountQuery = useQuery({
    queryKey: [CashAdvanceDetailsLookupQuerySegment, CashAdvanceDetailsLookupModuleSegment, "account-options"],
    queryFn: fetchCashAdvanceAccountOptions,
  });

  const responsibilityCenterQuery = useQuery({
    queryKey: [CashAdvanceDetailsLookupQuerySegment, CashAdvanceDetailsLookupModuleSegment, "rc-options"],
    queryFn: fetchCashAdvanceResponsibilityCenters,
  });

  const accountOptions = useMemo<CashAdvanceAccountDropdownOption[]>(() => {
    const options = [...(accountQuery.data ?? [])];

    if (
      form.values.accountCode &&
      !options.some((option) => option.value === form.values.accountId || option.label === form.values.accountCode)
    ) {
      options.unshift({
        name: form.values.accountTitle || form.values.accountCode,
        label: form.values.accountCode,
        value: form.values.accountId || form.values.accountCode,
        accountId: form.values.accountId,
        accountCode: form.values.accountCode,
        accountTitle: form.values.accountTitle,
      });
    }

    return options;
  }, [accountQuery.data, form.values.accountCode, form.values.accountId, form.values.accountTitle]);

  const costCenterOptions = useMemo<CashAdvanceResponsibilityCenterDropdownOption[]>(() => {
    const options = [...(responsibilityCenterQuery.data?.costCenters ?? [])];

    if (
      form.values.costCenter &&
      !options.some((option) => option.value === form.values.costCenterId || option.name === form.values.costCenter)
    ) {
      options.unshift({
        name: form.values.costCenter,
        label: form.values.referenceFields.costCenterCode || form.values.costCenter,
        value: form.values.costCenterId || form.values.costCenter,
        id: form.values.costCenterId,
        code: form.values.referenceFields.costCenterCode,
      });
    }

    return options;
  }, [
    form.values.costCenter,
    form.values.costCenterId,
    form.values.referenceFields.costCenterCode,
    responsibilityCenterQuery.data?.costCenters,
  ]);

  const projectOptions = useMemo<CashAdvanceResponsibilityCenterDropdownOption[]>(() => {
    const options = [...(responsibilityCenterQuery.data?.projects ?? [])];

    if (
      form.values.referenceFields.projectName &&
      !options.some((option) => option.value === form.values.projectId || option.name === form.values.referenceFields.projectName)
    ) {
      options.unshift({
        name: form.values.referenceFields.projectName,
        label: form.values.referenceFields.projectCode || form.values.referenceFields.projectName,
        value: form.values.projectId || form.values.referenceFields.projectName,
        id: form.values.projectId,
        code: form.values.referenceFields.projectCode,
      });
    }

    return options;
  }, [
    form.values.projectId,
    form.values.referenceFields.projectCode,
    form.values.referenceFields.projectName,
    responsibilityCenterQuery.data?.projects,
  ]);

  const partyOptions = useMemo<CashAdvancePartyDropdownOption[]>(() => {
    const options = [...(partyQuery.data ?? [])];

    if (
      form.values.partyCode &&
      !options.some((option) => option.value === form.values.partyId || option.label === form.values.partyCode)
    ) {
      options.unshift({
        name: form.values.partyName || form.values.partyCode,
        label: form.values.partyCode,
        value: form.values.partyId || form.values.partyCode,
        partyId: form.values.partyId,
        partyCode: form.values.partyCode,
        partyName: form.values.partyName,
        availableCashAdvance: form.values.availableCashAdvance,
        cashAdvanceLimit: form.values.cashAdvanceLimit,
      });
    }

    return options;
  }, [
    form.values.availableCashAdvance,
    form.values.cashAdvanceLimit,
    form.values.partyCode,
    form.values.partyId,
    form.values.partyName,
    partyQuery.data,
  ]);

  const selectedParty = useMemo(
    () => partyOptions.find((party) => party.value === form.values.partyId || party.partyCode === form.values.partyCode),
    [form.values.partyCode, form.values.partyId, partyOptions],
  );

  return {
    accountOptions,
    costCenterOptions,
    isAccountLookupLoading: accountQuery.isLoading,
    isCostCenterLookupLoading: responsibilityCenterQuery.isLoading,
    isPartyLookupError: partyQuery.isError,
    isPartyLookupLoading: partyQuery.isLoading,
    isProjectLookupLoading: responsibilityCenterQuery.isLoading,
    projectOptions,
    partyOptions,
    selectedParty,
    totalAdvanced: Number(selectedParty?.totalCashAdvance ?? 0),
  };
}
