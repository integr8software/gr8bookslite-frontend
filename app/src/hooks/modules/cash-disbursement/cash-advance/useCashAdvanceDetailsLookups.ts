import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCashAdvanceAccountOptions,
  fetchCashAdvancePartyOptions,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

const CashAdvanceLookupQuerySegment = "cash-disbursement";
const CashAdvanceLookupModuleSegment = "cash-advance";

export function useCashAdvanceDetailsLookups(values: CashAdvanceFormValues) {
  const partyQuery = useQuery({
    queryKey: PartyManagementQueryKeys.cashAdvancePartyOptions(),
    queryFn: fetchCashAdvancePartyOptions,
  });
  const accountQuery = useQuery({
    queryKey: [CashAdvanceLookupQuerySegment, CashAdvanceLookupModuleSegment, "account-options"],
    queryFn: fetchCashAdvanceAccountOptions,
  });

  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = (partyQuery.data ?? []).map((party) => ({
      ...party,
      label: party.partyCode || party.label || party.name,
      value: party.partyCode || party.label || party.name,
    }));

    if (values.partyCode && !options.some((option) => option.value === values.partyCode)) {
      options.unshift({
        name: values.partyName || values.partyCode,
        label: values.partyCode,
        value: values.partyCode,
        partyCode: values.partyCode,
        partyName: values.partyName,
      });
    }

    return options;
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const accountOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = (accountQuery.data ?? []).map((account) => ({
      ...account,
      label: account.accountCode || account.label || account.name,
      value: account.accountCode || account.label || account.name,
    }));

    if (values.accountCode && !options.some((option) => option.value === values.accountCode)) {
      options.unshift({
        name: values.accountTitle || values.accountCode,
        label: values.accountCode,
        value: values.accountCode,
        accountCode: values.accountCode,
        accountTitle: values.accountTitle,
      });
    }

    return options;
  }, [accountQuery.data, values.accountCode, values.accountTitle]);

  return {
    accountOptions,
    isAccountLookupLoading: accountQuery.isLoading,
    isPartyLookupLoading: partyQuery.isLoading,
    partyOptions,
  };
}
