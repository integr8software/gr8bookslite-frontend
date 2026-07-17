"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { PaymentTypeOptions } from "@/app/src/data/modules/maintenance/payment-type/PaymentTypeData";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentType";
import type {
	PaymentTypeClassificationFilter,
	PaymentTypeRecord,
	PaymentTypeStatusFilter,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function usePaymentTypeListPage() {
	const paymentTypes = usePaymentTypeStore((state) => state.paymentTypes);
	const addPaymentTypes = usePaymentTypeStore((state) => state.addPaymentTypes);
	const updatePaymentType = usePaymentTypeStore((state) => state.updatePaymentType);
	const reorderPaymentTypes = usePaymentTypeStore(
		(state) => state.reorderPaymentTypes,
	);
	const isLoading = usePaymentTypeStore((state) => state.isLoading);
	const isRefreshing = usePaymentTypeStore((state) => state.isRefreshing);
	const lastSyncedAt = usePaymentTypeStore((state) => state.lastSyncedAt);
	const isMutating = usePaymentTypeStore((state) => state.isMutating);
	const permissions = usePaymentTypeStore((state) => state.permissions);
	const refreshPaymentTypes = usePaymentTypeStore(
		(state) => state.refreshPaymentTypes,
	);
	const statistics = usePaymentTypeStore((state) => state.statistics);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] =
		useState<PaymentTypeClassificationFilter>("");
	const [statusFilter, setStatusFilter] =
		useState<PaymentTypeStatusFilter>("Active");
	const [pendingStatusPaymentType, setPendingStatusPaymentType] =
		useState<PaymentTypeRecord | null>(null);

	const filteredPaymentTypes = useMemo(() => {
		const normalizedSearch = normalizeLowercaseText(searchTerm);

		return paymentTypes
			.filter((paymentType) => {
				const matchesSearch =
					normalizedSearch.length === 0 ||
					paymentType.paymentType.toLowerCase().includes(normalizedSearch) ||
					paymentType.type.toLowerCase().includes(normalizedSearch);
				const matchesType = !typeFilter || paymentType.type === typeFilter;
				const matchesStatus =
					!statusFilter || paymentType.status === statusFilter;

				return matchesSearch && matchesType && matchesStatus;
			})
			.sort((left, right) =>
				left.sortOrder === right.sortOrder
					? left.paymentType.localeCompare(right.paymentType)
					: left.sortOrder - right.sortOrder,
			);
	}, [paymentTypes, searchTerm, statusFilter, typeFilter]);

	function resetFilters() {
		setSearchTerm("");
		setTypeFilter("");
		setStatusFilter("Active");
	}

	function confirmPaymentTypeStatusChange() {
		if (!pendingStatusPaymentType) {
			return;
		}

		return updatePaymentType({
			...pendingStatusPaymentType,
			status:
				pendingStatusPaymentType.status === "Active" ? "Inactive" : "Active",
		}).then(() => {
			setPendingStatusPaymentType(null);
		}).catch(() => undefined);
	}

	function reorderPaymentType(
		draggedPaymentTypeId: string,
		targetPaymentTypeId: string,
		placement: "before" | "after",
	) {
		const draggedIndex = filteredPaymentTypes.findIndex(
			(paymentType) => paymentType.id === draggedPaymentTypeId,
		);
		const targetIndex = filteredPaymentTypes.findIndex(
			(paymentType) => paymentType.id === targetPaymentTypeId,
		);

		if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
			return;
		}

		const nextPaymentTypes = [...filteredPaymentTypes];
		const [draggedPaymentType] = nextPaymentTypes.splice(draggedIndex, 1);

		if (!draggedPaymentType) {
			return;
		}

		const adjustedTargetIndex = nextPaymentTypes.findIndex(
			(paymentType) => paymentType.id === targetPaymentTypeId,
		);
		const insertIndex =
			placement === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex;

		nextPaymentTypes.splice(insertIndex, 0, draggedPaymentType);

		const changedPaymentTypes = nextPaymentTypes
			.map((paymentType, index) => ({
				...paymentType,
				sortOrder: (index + 1) * 10,
			}))
			.filter(
				(paymentType) =>
					paymentTypes.find((current) => current.id === paymentType.id)
						?.sortOrder !== paymentType.sortOrder,
			);

		if (changedPaymentTypes.length > 0) {
			void reorderPaymentTypes(changedPaymentTypes).catch(() => undefined);
		}
	}

	return {
		confirmPaymentTypeStatusChange,
		addPaymentTypes,
		filteredPaymentTypes,
		isLoading,
		isRefreshing,
		lastSyncedAt,
		isMutating,
		paymentTypes,
		pendingStatusPaymentType,
		permissions,
		refreshPaymentTypes,
		reorderPaymentType,
		resetFilters,
		searchTerm,
		setPendingStatusPaymentType,
		setSearchTerm,
		setStatusFilter,
		setTypeFilter,
		statistics,
		statusFilter,
		typeFilter,
		typeFilterOptions: PaymentTypeOptions,
	};
}

