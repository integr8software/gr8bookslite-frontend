"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockPaymentTypes } from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import {
	createPaymentType,
	fetchPaymentTypes,
	updatePaymentType,
} from "@/app/src/services/modules/maintenance/financial-management/payment-type/PaymentTypeService";
import { PaymentTypeQueryKeys } from "@/app/src/services/modules/maintenance/financial-management/payment-type/PaymentTypeQueryKeys";
import type { PaymentTypeRecord } from "@/app/src/types/modules/maintenance/financial-management/payment-type/PaymentTypeTypes";

type PaymentTypeStoreState = {
	paymentTypes: PaymentTypeRecord[];
	addPaymentType: (paymentType: PaymentTypeRecord) => void;
	updatePaymentType: (paymentType: PaymentTypeRecord) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function usePaymentTypeStore<TSelected = PaymentTypeStoreState>(
	selector?: (state: PaymentTypeStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const paymentTypesQuery = useQuery({
		queryKey: PaymentTypeQueryKeys.paymentTypes(),
		queryFn: () => fetchPaymentTypes(),
		initialData: MockPaymentTypes,
	});

	function updateCachedPaymentTypes(
		updater: (paymentTypes: PaymentTypeRecord[]) => PaymentTypeRecord[],
	) {
		queryClient.setQueryData<PaymentTypeRecord[]>(
			PaymentTypeQueryKeys.paymentTypes(),
			(currentPaymentTypes = MockPaymentTypes) => updater(currentPaymentTypes),
		);
	}

	const addPaymentTypeMutation = useMutation({
		mutationFn: createPaymentType,
		onSuccess: (paymentType) => {
			updateCachedPaymentTypes((paymentTypes) => [...paymentTypes, paymentType]);
			toast.success("Payment type created.");
		},
		onError: () => {
			toast.error("Could not create payment type. Please try again.");
		},
	});

	const updatePaymentTypeMutation = useMutation({
		mutationFn: updatePaymentType,
		onSuccess: (paymentType) => {
			updateCachedPaymentTypes((paymentTypes) =>
				paymentTypes.map((current) =>
					current.id === paymentType.id ? paymentType : current,
				),
			);
			toast.success("Payment type updated.");
		},
		onError: () => {
			toast.error("Could not update payment type. Please try again.");
		},
	});

	const state = useMemo<PaymentTypeStoreState>(
		() => ({
			addPaymentType: (paymentType) => addPaymentTypeMutation.mutate(paymentType),
			isLoading: paymentTypesQuery.isLoading,
			isMutating:
				addPaymentTypeMutation.isPending ||
				updatePaymentTypeMutation.isPending,
			paymentTypes: paymentTypesQuery.data,
			updatePaymentType: (paymentType) =>
				updatePaymentTypeMutation.mutate(paymentType),
		}),
		[
			addPaymentTypeMutation,
			paymentTypesQuery.data,
			paymentTypesQuery.isLoading,
			updatePaymentTypeMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
