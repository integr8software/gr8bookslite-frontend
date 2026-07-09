"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { PaymentTypeOptions } from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
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

		return paymentTypes.filter((paymentType) => {
			const matchesSearch =
				normalizedSearch.length === 0 ||
				paymentType.paymentType.toLowerCase().includes(normalizedSearch) ||
				paymentType.type.toLowerCase().includes(normalizedSearch);
			const matchesType = !typeFilter || paymentType.type === typeFilter;
			const matchesStatus =
				!statusFilter || paymentType.status === statusFilter;

			return matchesSearch && matchesType && matchesStatus;
		});
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

		void updatePaymentType({
			...pendingStatusPaymentType,
			status:
				pendingStatusPaymentType.status === "Active" ? "Inactive" : "Active",
		}).then(() => {
			setPendingStatusPaymentType(null);
		}).catch(() => undefined);
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
