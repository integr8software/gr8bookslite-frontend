"use client";

import { useMemo, useState } from "react";
import { PaymentTypeOptions } from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentType";
import type {
	PaymentTypeClassification,
	PaymentTypeRecord,
	PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function usePaymentTypeListPage() {
	const paymentTypes = usePaymentTypeStore((state) => state.paymentTypes);
	const updatePaymentType = usePaymentTypeStore((state) => state.updatePaymentType);
	const isLoading = usePaymentTypeStore((state) => state.isLoading);
	const isMutating = usePaymentTypeStore((state) => state.isMutating);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<"" | PaymentTypeClassification>(
		"",
	);
	const [statusFilter, setStatusFilter] = useState<"" | PaymentTypeStatus>("");
	const [pendingStatusPaymentType, setPendingStatusPaymentType] =
		useState<PaymentTypeRecord | null>(null);

	const filteredPaymentTypes = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

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

	function confirmPaymentTypeStatusChange() {
		if (!pendingStatusPaymentType) {
			return;
		}

		updatePaymentType({
			...pendingStatusPaymentType,
			status:
				pendingStatusPaymentType.status === "Active" ? "Inactive" : "Active",
		});
		setPendingStatusPaymentType(null);
	}

	return {
		confirmPaymentTypeStatusChange,
		filteredPaymentTypes,
		isLoading,
		isMutating,
		paymentTypes,
		pendingStatusPaymentType,
		searchTerm,
		setPendingStatusPaymentType,
		setSearchTerm,
		setStatusFilter,
		setTypeFilter,
		statusFilter,
		typeFilter,
		typeFilterOptions: PaymentTypeOptions,
	};
}
