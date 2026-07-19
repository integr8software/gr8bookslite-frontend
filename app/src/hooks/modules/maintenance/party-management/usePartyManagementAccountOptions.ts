"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPartyManagementAccountingOptions } from "@/app/src/services/modules/maintenance/party-management/PartyManagementApi";
import type {
	PartyAccountingAccountIds,
	PartyAccountingAccountOptions,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

const EmptyPartyAccountingAccountIds: PartyAccountingAccountIds = {
	customerAdvanceAccount: "",
	defaultPayableAccount: "",
	defaultReceivableAccount: "",
	employeeAdvanceAccount: "",
	employeePayableAccount: "",
	vendorAdvanceAccount: "",
};

const EmptyPartyAccountingAccountOptions: PartyAccountingAccountOptions = {
	customerAdvanceAccount: [],
	defaultPayableAccount: [],
	defaultReceivableAccount: [],
	employeeAdvanceAccount: [],
	employeePayableAccount: [],
	vendorAdvanceAccount: [],
};

export function usePartyManagementAccountOptions() {
	const query = useQuery({
		queryKey: ["party-management", "accounting-options"],
		queryFn: fetchPartyManagementAccountingOptions,
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	return {
		accountOptions: query.data?.accountOptions ?? EmptyPartyAccountingAccountOptions,
		defaultAccounts: query.data?.defaultAccounts ?? EmptyPartyAccountingAccountIds,
		isLoading: query.isLoading,
	};
}

export type { PartyAccountingAccountIds as PartyDefaultAccountingAccountIds };
