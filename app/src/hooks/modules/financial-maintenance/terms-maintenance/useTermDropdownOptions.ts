"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTermDuration } from "@/app/src/data/modules/financial-maintenance/terms-maintenance/TermsMaintenanceDisplay";
import { fetchTerms } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceApi";
import { TermsMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQueryKeys";
import type { TermsMaintenancePermissions } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

const EmptyTermPermissions: TermsMaintenancePermissions = {
	canCreate: false,
	canExport: false,
	canImport: false,
	canUpdate: false,
	canView: false,
};

export function useTermDropdownOptions() {
	const termsQuery = useQuery({
		queryKey: TermsMaintenanceQueryKeys.terms(),
		queryFn: fetchTerms,
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	const options = useMemo(
		() =>
			(termsQuery.data?.terms ?? [])
				.filter((term) => term.status === "Active")
				.map((term) => ({
					description: formatTermDuration(term),
					name: term.name,
					value: term.id,
				})),
		[termsQuery.data],
	);

	return {
		...termsQuery,
		options,
		permissions: termsQuery.data?.permissions ?? EmptyTermPermissions,
		terms: termsQuery.data?.terms ?? [],
	};
}

