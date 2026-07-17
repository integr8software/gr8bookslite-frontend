"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/discount-management/useDiscountManagement";
import type {
	Discount,
	DiscountStatusFilter,
	DiscountTypeFilter,
	DiscountValueTypeFilter,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";

export function useDiscountManagementListPage() {
	const discounts = useDiscountManagementStore((state) => state.discounts);
	const addDiscounts = useDiscountManagementStore((state) => state.addDiscounts);
	const updateDiscount = useDiscountManagementStore(
		(state) => state.updateDiscount,
	);
	const isLoading = useDiscountManagementStore((state) => state.isLoading);
	const isRefreshing = useDiscountManagementStore(
		(state) => state.isRefreshing,
	);
	const lastSyncedAt = useDiscountManagementStore((state) => state.lastSyncedAt);
	const isMutating = useDiscountManagementStore((state) => state.isMutating);
	const permissions = useDiscountManagementStore((state) => state.permissions);
	const statistics = useDiscountManagementStore((state) => state.statistics);
	const refreshDiscounts = useDiscountManagementStore(
		(state) => state.refreshDiscounts,
	);
	const [typeFilter, setTypeFilter] = useState<DiscountTypeFilter>("All");
	const [discountTypeFilter, setDiscountTypeFilter] =
		useState<DiscountValueTypeFilter>("All");
	const [statusFilter, setStatusFilter] =
		useState<DiscountStatusFilter>("Active");
	const [query, setQuery] = useState("");
	const [pendingStatusDiscount, setPendingStatusDiscount] =
		useState<Discount | null>(null);

	const filteredDiscounts = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return discounts.filter((discount) => {
			if (typeFilter !== "All" && discount.type !== typeFilter) {
				return false;
			}

			if (
				discountTypeFilter !== "All" &&
				discount.discountType !== discountTypeFilter
			) {
				return false;
			}

			if (statusFilter && discount.status !== statusFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				discount.name,
				discount.description,
				discount.type,
				discount.discountType,
				String(discount.amount),
				discount.accountCode,
				discount.accountTitle,
				discount.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [discountTypeFilter, discounts, query, statusFilter, typeFilter]);

	function resetFilters() {
		setTypeFilter("All");
		setDiscountTypeFilter("All");
		setStatusFilter("Active");
		setQuery("");
	}

	function confirmDiscountStatusChange() {
		if (!pendingStatusDiscount) {
			return;
		}

		return updateDiscount({
			...pendingStatusDiscount,
			status:
				pendingStatusDiscount.status === "Active" ? "Inactive" : "Active",
		})
			.then(() => {
				setPendingStatusDiscount(null);
			})
			.catch(() => undefined);
	}

	return {
		addDiscounts,
		confirmDiscountStatusChange,
		discounts,
		discountTypeFilter,
		filteredDiscounts,
		isLoading,
		isMutating,
		isRefreshing,
		lastSyncedAt,
		pendingStatusDiscount,
		permissions,
		query,
		refreshDiscounts,
		resetFilters,
		setDiscountTypeFilter,
		setPendingStatusDiscount,
		setQuery,
		setStatusFilter,
		setTypeFilter,
		statistics,
		statusFilter,
		typeFilter,
	};
}
