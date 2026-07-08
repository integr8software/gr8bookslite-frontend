"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createPaymentType,
	fetchPaymentTypes,
	importPaymentTypes,
	updatePaymentType,
} from "@/app/src/services/modules/maintenance/payment-type/PaymentTypeService";
import { PaymentTypeQueryKeys } from "@/app/src/services/modules/maintenance/payment-type/PaymentTypeQueryKeys";
import type {
	PaymentTypePermissions,
	PaymentTypeRecord,
	PaymentTypeStatistics,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

type PaymentTypeStoreState = {
	paymentTypes: PaymentTypeRecord[];
	addPaymentType: (paymentType: PaymentTypeRecord) => Promise<PaymentTypeRecord>;
	addPaymentTypes: (
		paymentTypes: PaymentTypeRecord[],
	) => Promise<PaymentTypeRecord[]>;
	updatePaymentType: (paymentType: PaymentTypeRecord) => Promise<PaymentTypeRecord>;
	permissions: PaymentTypePermissions;
	statistics: PaymentTypeStatistics;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	refreshPaymentTypes: () => void;
};

const EmptyPaymentTypePermissions: PaymentTypePermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRolePaymentTypePermissions: PaymentTypePermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyPaymentTypeStatistics: PaymentTypeStatistics = {
	totalPaymentTypes: 0,
	activePaymentTypes: 0,
	inactivePaymentTypes: 0,
	cashPaymentTypes: 0,
	withBankPaymentTypes: 0,
	bankTransferPaymentTypes: 0,
	onlinePaymentTypes: 0,
	multipleCheckPaymentTypes: 0,
	debitPaymentTypes: 0,
};

export function usePaymentTypeStore<TSelected = PaymentTypeStoreState>(
	selector?: (state: PaymentTypeStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const paymentTypesQuery = useQuery({
		queryKey: PaymentTypeQueryKeys.paymentTypes(),
		queryFn: () => fetchPaymentTypes(),
	});
	const refreshPaymentTypes = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: PaymentTypeQueryKeys.all(),
		});
	}, [queryClient]);

	const addPaymentTypeMutation = useMutation({
		mutationFn: createPaymentType,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: PaymentTypeQueryKeys.all(),
			});
			toast.success("Payment type created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create payment type. Please try again.",
			);
		},
	});

	const addPaymentTypesMutation = useMutation({
		mutationFn: importPaymentTypes,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: PaymentTypeQueryKeys.all(),
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not import payment types. Please try again.",
			);
		},
	});

	const updatePaymentTypeMutation = useMutation({
		mutationFn: updatePaymentType,
		onSuccess: (_, updatedPaymentType) => {
			const previousPaymentType = paymentTypesQuery.data?.paymentTypes.find(
				(paymentType) => paymentType.id === updatedPaymentType.id,
			);
			const didStatusChange =
				previousPaymentType &&
				previousPaymentType.status !== updatedPaymentType.status;

			void queryClient.invalidateQueries({
				queryKey: PaymentTypeQueryKeys.all(),
			});
			toast.success(
				didStatusChange
					? `Payment type ${updatedPaymentType.status === "Active" ? "activated" : "deactivated"} successfully.`
					: "Payment type updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update payment type. Please try again.",
			);
		},
	});

	const state = useMemo<PaymentTypeStoreState>(
		() => {
			const effectiveRole = ResolveAuthProfileEffectiveRole(
				authProfileQuery.data,
			);
			const hasReservedRoleAccess =
				effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

			return {
				addPaymentType: (paymentType) =>
					addPaymentTypeMutation.mutateAsync(paymentType),
				addPaymentTypes: (paymentTypes) =>
					addPaymentTypesMutation.mutateAsync(paymentTypes),
				isLoading: paymentTypesQuery.isLoading,
				isRefreshing:
					paymentTypesQuery.isFetching && !paymentTypesQuery.isLoading,
				lastSyncedAt: paymentTypesQuery.dataUpdatedAt,
				isMutating:
					addPaymentTypeMutation.isPending ||
					addPaymentTypesMutation.isPending ||
					updatePaymentTypeMutation.isPending,
				paymentTypes: paymentTypesQuery.data?.paymentTypes ?? [],
				permissions: hasReservedRoleAccess
					? ReservedRolePaymentTypePermissions
					: (paymentTypesQuery.data?.permissions ??
						EmptyPaymentTypePermissions),
				refreshPaymentTypes,
				statistics:
					paymentTypesQuery.data?.statistics ?? EmptyPaymentTypeStatistics,
				updatePaymentType: (paymentType) =>
					updatePaymentTypeMutation.mutateAsync(paymentType),
			};
		},
		[
			addPaymentTypeMutation,
			addPaymentTypesMutation,
			authProfileQuery.data,
			paymentTypesQuery.data,
			paymentTypesQuery.dataUpdatedAt,
			paymentTypesQuery.isFetching,
			paymentTypesQuery.isLoading,
			refreshPaymentTypes,
			updatePaymentTypeMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
