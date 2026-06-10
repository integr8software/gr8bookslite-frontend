"use client";

import { useMemo, useState } from "react";
import {
	TermManagementStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

type TermManagementStatusFilter =
	| ""
	| (typeof TermManagementStatusOptions)[number];

export function useTermManagementListPage() {
	const terms = useTermManagementStore((state) => state.terms);
	const updateTerm = useTermManagementStore((state) => state.updateTerm);
	const isLoading = useTermManagementStore((state) => state.isLoading);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const [datemodeFilter, setDatemodeFilter] = useState("All");
	const [statusFilter, setStatusFilter] =
		useState<TermManagementStatusFilter>("");
	const [query, setQuery] = useState("");

	const filteredTerms = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return terms.filter((term) => {
			if (datemodeFilter !== "All" && term.datemode !== datemodeFilter) {
				return false;
			}

			if (statusFilter && term.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [term.name, term.datemode, term.period, term.status]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [datemodeFilter, query, statusFilter, terms]);

	function resetFilters() {
		setDatemodeFilter("All");
		setStatusFilter("");
		setQuery("");
	}

	function toggleTermStatus(term: TermManagement) {
		updateTerm({
			...term,
			status: term.status === "Active" ? "Inactive" : "Active",
		});
	}

	return {
		datemodeFilter,
		filteredTerms,
		isLoading,
		isMutating,
		query,
		resetFilters,
		setDatemodeFilter,
		setQuery,
		setStatusFilter,
		statusFilter,
		terms,
		toggleTermStatus,
	};
}
