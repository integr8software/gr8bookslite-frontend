"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenter";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterStatusFilter,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

export function useResponsibilityCenterListPage() {
	const centers = useResponsibilityCenterStore((state) => state.centers);
	const updateCenter = useResponsibilityCenterStore(
		(state) => state.updateCenter,
	);
	const isLoading = useResponsibilityCenterStore((state) => state.isLoading);
	const isRefreshing = useResponsibilityCenterStore(
		(state) => state.isRefreshing,
	);
	const lastSyncedAt = useResponsibilityCenterStore(
		(state) => state.lastSyncedAt,
	);
	const isMutating = useResponsibilityCenterStore(
		(state) => state.isMutating,
	);
	const permissions = useResponsibilityCenterStore(
		(state) => state.permissions,
	);
	const refreshCenters = useResponsibilityCenterStore(
		(state) => state.refreshCenters,
	);
	const statistics = useResponsibilityCenterStore(
		(state) => state.statistics,
	);
	const [query, setQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("All");
	const [financialTypeFilter, setFinancialTypeFilter] = useState("All");
	const [statusFilter, setStatusFilter] =
		useState<ResponsibilityCenterStatusFilter>("Active");
	const [pendingStatusCenter, setPendingStatusCenter] =
		useState<ResponsibilityCenter | null>(null);

	const filteredCenters = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return centers.filter((center) => {
			if (statusFilter && center.status !== statusFilter) {
				return false;
			}

			if (categoryFilter !== "All" && center.category !== categoryFilter) {
				return false;
			}

			if (
				financialTypeFilter !== "All" &&
				center.financialType !== financialTypeFilter
			) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			const parentName = center.parentId
				? centers.find((parentCenter) => parentCenter.id === center.parentId)
						?.name
				: "";

			return [
				center.code,
				center.name,
				center.category,
				center.financialType,
				center.manager,
				parentName,
				center.status,
				center.description,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [categoryFilter, centers, financialTypeFilter, query, statusFilter]);

	function confirmCenterStatusChange() {
		if (!pendingStatusCenter) {
			return;
		}

		updateCenter({
			...pendingStatusCenter,
			status:
				pendingStatusCenter.status === "Active" ? "Inactive" : "Active",
			updatedAt: new Date().toISOString(),
		});
		setPendingStatusCenter(null);
	}

	return {
		categoryFilter,
		centers,
		confirmCenterStatusChange,
		filteredCenters,
		financialTypeFilter,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		pendingStatusCenter,
		permissions,
		query,
		refreshCenters,
		setCategoryFilter,
		setFinancialTypeFilter,
		setPendingStatusCenter,
		setQuery,
		setStatusFilter,
		statistics,
		statusFilter,
	};
}
