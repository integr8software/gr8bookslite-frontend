"use client";

import { useMemo, useState } from "react";
import {
	TermManagementStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagement";
import type { TermManagement } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";

type TermManagementStatusFilter =
	| ""
	| (typeof TermManagementStatusOptions)[number];

export function useTermManagementListPage() {
	const terms = useTermManagementStore((state) => state.terms);
	const addTerms = useTermManagementStore((state) => state.addTerms);
	const updateTerm = useTermManagementStore((state) => state.updateTerm);
	const isLoading = useTermManagementStore((state) => state.isLoading);
	const isRefreshing = useTermManagementStore((state) => state.isRefreshing);
	const lastSyncedAt = useTermManagementStore((state) => state.lastSyncedAt);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const permissions = useTermManagementStore((state) => state.permissions);
	const statistics = useTermManagementStore((state) => state.statistics);
	const refreshTerms = useTermManagementStore((state) => state.refreshTerms);
	const [datemodeFilter, setDatemodeFilter] = useState("All");
	const [statusFilter, setStatusFilter] =
		useState<TermManagementStatusFilter>("Active");
	const [query, setQuery] = useState("");
	const [pendingStatusTerm, setPendingStatusTerm] =
		useState<TermManagement | null>(null);

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

			return [term.name, term.description, term.datemode, term.period, term.status]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [datemodeFilter, query, statusFilter, terms]);

	function resetFilters() {
		setDatemodeFilter("All");
		setStatusFilter("Active");
		setQuery("");
	}

	function confirmTermStatusChange() {
		if (!pendingStatusTerm) {
			return;
		}

		void updateTerm({
			...pendingStatusTerm,
			status: pendingStatusTerm.status === "Active" ? "Inactive" : "Active",
		}).then(() => {
			setPendingStatusTerm(null);
		}).catch(() => undefined);
	}

	return {
		confirmTermStatusChange,
		addTerms,
		datemodeFilter,
		filteredTerms,
		isLoading,
		isRefreshing,
		lastSyncedAt,
		isMutating,
		pendingStatusTerm,
		permissions,
		query,
		refreshTerms,
		resetFilters,
		setDatemodeFilter,
		setPendingStatusTerm,
		setQuery,
		setStatusFilter,
		statusFilter,
		statistics,
		terms,
	};
}
