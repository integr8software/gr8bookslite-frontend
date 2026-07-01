"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTermDuration } from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementDisplay";
import { fetchTerms } from "@/app/src/services/modules/maintenance/term-management/TermManagementApi";
import { TermManagementQueryKeys } from "@/app/src/services/modules/maintenance/term-management/TermManagementQueryKeys";

export function useTermDropdownOptions() {
	const termsQuery = useQuery({
		queryKey: TermManagementQueryKeys.terms(),
		queryFn: fetchTerms,
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
		terms: termsQuery.data?.terms ?? [],
	};
}
