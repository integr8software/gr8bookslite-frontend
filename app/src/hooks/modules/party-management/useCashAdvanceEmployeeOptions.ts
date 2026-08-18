"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCashAdvanceEmployeeOptions } from "@/app/src/services/modules/party-management/PartyManagementApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";

export function useCashAdvanceEmployeeOptions(consumer: string) {
  const query = useQuery({
    queryKey: PartyManagementQueryKeys.employeeOptions(consumer),
    queryFn: fetchCashAdvanceEmployeeOptions,
    retry: false,
  });

  return {
    employeeOptions: query.data ?? [],
    isEmployeeOptionsEmpty: query.isSuccess && (query.data?.length ?? 0) === 0,
    isEmployeeOptionsError: query.isError,
    isEmployeeOptionsLoading: query.isLoading,
  };
}
